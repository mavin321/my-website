#include "design_space_model.h"

#include <algorithm>
#include <cmath>
#include <utility>
#include <vector>

namespace {

constexpr double GAS_CONSTANT = 8.314462618;

double clamp01(double value) {
    return std::clamp(value, 1e-6, 1.0 - 1e-6);
}

double arrhenius(double pre_exponential, double activation_energy, double temperature) {
    return pre_exponential * std::exp(-activation_energy / std::max(GAS_CONSTANT * temperature, 1e-9));
}

double linspace_value(double min_value, double max_value, int index, int count) {
    if (count <= 1) {
        return min_value;
    }
    const double fraction = static_cast<double>(index) / static_cast<double>(count - 1);
    return min_value + fraction * (max_value - min_value);
}

double logistic(double value) {
    return 1.0 / (1.0 + std::exp(-value));
}

}  // namespace

int simulate_design_space(
    const DesignSpaceParams *params,
    DesignSpacePoint *points_out,
    int *pareto_flags_out,
    DesignSpaceSummary *summary_out
) {
    if (!params || !points_out || !pareto_flags_out || !summary_out) {
        return -1;
    }
    if (params->temp_points < 2 || params->tau_points < 2) {
        return -2;
    }

    const int total_points = params->temp_points * params->tau_points;
    std::vector<DesignSpacePoint> points(total_points);

    double best_yield = 0.0;
    double best_profitability = -1e300;
    double best_space_time_yield = 0.0;
    double lowest_heat_duty = 1e300;

    for (int i = 0; i < params->tau_points; ++i) {
        const double tau = linspace_value(params->tau_min, params->tau_max, i, params->tau_points);
        for (int j = 0; j < params->temp_points; ++j) {
            const double temperature = linspace_value(params->temp_min, params->temp_max, j, params->temp_points);
            const int idx = i * params->temp_points + j;

            const double k_main = arrhenius(params->pre_exponential_main, params->activation_energy_main, temperature);
            const double k_side = arrhenius(params->pre_exponential_side, params->activation_energy_side, temperature);
            const double rate_total = std::max(k_main + k_side, 1e-12);
            const double conversion = clamp01(1.0 - std::exp(-rate_total * tau));
            const double selectivity = clamp01(k_main / rate_total);
            const double yield_value = clamp01(conversion * selectivity);

            const double feed_moles = params->feed_concentration * params->reactor_volume;
            const double heat_release =
                feed_moles * conversion *
                ((-params->delta_h_main) * selectivity + (-params->delta_h_side) * (1.0 - selectivity)) /
                std::max(tau, 1e-9);
            const double sensible_load =
                params->rho_cp * params->reactor_volume * std::max(temperature - params->coolant_temp, 0.0) /
                std::max(tau, 1e-9);
            const double heat_duty = params->ua * (temperature - params->coolant_temp) + 0.25 * sensible_load;
            const double safety_margin = heat_duty - heat_release;
            const double safety_index = logistic(safety_margin / 6000.0);
            const double space_time_yield = feed_moles * yield_value / std::max(tau, 1e-9);
            const double product_rate = feed_moles * yield_value / std::max(tau, 1e-9);
            const double profitability =
                params->product_price * product_rate -
                params->utility_cost * std::abs(heat_duty) -
                80.0 * (1.0 - selectivity) -
                120.0 * std::max(-safety_margin, 0.0) / std::max(std::abs(heat_release), 1.0);

            const DesignSpacePoint point{
                temperature,
                tau,
                conversion,
                selectivity,
                yield_value,
                heat_release,
                heat_duty,
                space_time_yield,
                profitability,
                safety_index,
            };

            points[idx] = point;
            points_out[idx] = point;
            pareto_flags_out[idx] = 0;

            best_yield = std::max(best_yield, yield_value);
            best_profitability = std::max(best_profitability, profitability);
            best_space_time_yield = std::max(best_space_time_yield, space_time_yield);
            lowest_heat_duty = std::min(lowest_heat_duty, std::abs(heat_duty));
        }
    }

    std::vector<std::pair<double, int>> ranked_points;
    ranked_points.reserve(total_points);
    for (int i = 0; i < total_points; ++i) {
        ranked_points.push_back({points[i].profitability, i});
    }
    std::sort(
        ranked_points.begin(),
        ranked_points.end(),
        [](const auto &lhs, const auto &rhs) { return lhs.first > rhs.first; }
    );

    int pareto_count = 0;
    double best_yield_seen = -1.0;
    double best_duty_seen = 1e300;
    for (const auto &[_, idx] : ranked_points) {
        const auto &point = points[idx];
        const double heat_duty_abs = std::abs(point.heat_duty);
        const bool high_safety = point.safety_index >= 0.50;
        const bool improves_yield = point.yield_value > best_yield_seen + 0.002;
        const bool improves_energy = heat_duty_abs < best_duty_seen * 0.94;

        if (high_safety && (improves_yield || improves_energy)) {
            pareto_flags_out[idx] = 1;
            ++pareto_count;
            best_yield_seen = std::max(best_yield_seen, point.yield_value);
            best_duty_seen = std::min(best_duty_seen, heat_duty_abs);
        }
    }

    *summary_out = DesignSpaceSummary{
        best_yield,
        best_profitability,
        best_space_time_yield,
        lowest_heat_duty,
        pareto_count,
    };

    return 0;
}
