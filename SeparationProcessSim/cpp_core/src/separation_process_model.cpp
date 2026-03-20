#include "separation_process_model.h"

#include <algorithm>
#include <cmath>

namespace {

struct SeparationRates {
    double dx_top;
    double dx_bottom;
    double dT_top;
    double dT_bottom;
    double y_top;
    double y_bottom;
    double distillate_flow;
    double bottoms_flow;
    double condenser_duty;
    double reboiler_duty;
    double separation_index;
};

double clamp01(double value) {
    return std::clamp(value, 1e-6, 1.0 - 1e-6);
}

double vapor_light_fraction(double x_light, double alpha) {
    const double x = clamp01(x_light);
    const double denom = 1.0 + (alpha - 1.0) * x;
    return std::clamp((alpha * x) / std::max(denom, 1e-9), 1e-6, 1.0 - 1e-6);
}

SeparationRates evaluate_rates(const SeparationState &state, const SeparationParams &params) {
    const double alpha_top = std::max(
        1.05,
        params.relative_volatility_ref -
            params.alpha_temp_coeff * (state.top_temp - params.feed_temp)
    );
    const double alpha_bottom = std::max(
        1.02,
        params.relative_volatility_ref -
            params.alpha_temp_coeff * (state.bottom_temp - params.feed_temp)
    );

    const double y_top = vapor_light_fraction(state.top_x_light, alpha_top);
    const double y_bottom = vapor_light_fraction(state.bottom_x_light, alpha_bottom);

    const double distillate_flow =
        params.feed_flow / std::max(1.0 + params.reflux_ratio, 1e-6);
    const double reflux_flow = params.reflux_ratio * distillate_flow;
    const double bottoms_flow = std::max(params.feed_flow - distillate_flow, 1e-6);
    const double boilup_flow = params.boilup_ratio * bottoms_flow;

    const double feed_split = 0.5 + 0.3 * (params.feed_z_light - 0.5);
    const double feed_to_top = std::clamp(feed_split, 0.1, 0.9) * params.feed_flow;
    const double feed_to_bottom = params.feed_flow - feed_to_top;

    const double top_in_light =
        reflux_flow * clamp01(state.top_x_light) +
        feed_to_top * params.feed_z_light +
        params.tray_efficiency * boilup_flow * y_bottom;
    const double top_out_light =
        (distillate_flow + reflux_flow + params.tray_efficiency * boilup_flow) *
        clamp01(state.top_x_light);

    const double bottom_in_light =
        feed_to_bottom * params.feed_z_light +
        params.tray_efficiency * reflux_flow * clamp01(state.top_x_light);
    const double bottom_out_light =
        bottoms_flow * clamp01(state.bottom_x_light) +
        params.tray_efficiency * boilup_flow * y_bottom;

    const double dx_top =
        (top_in_light - top_out_light) / std::max(params.top_holdup, 1e-6);
    const double dx_bottom =
        (bottom_in_light - bottom_out_light) / std::max(params.bottom_holdup, 1e-6);

    const double condenser_duty =
        params.condenser_ua * (state.top_temp - params.condenser_temp);
    const double reboiler_duty =
        params.reboiler_ua * (params.steam_temp - state.bottom_temp);

    const double dT_top =
        (params.feed_flow * (params.feed_temp - state.top_temp) +
         0.015 * boilup_flow * (state.bottom_temp - state.top_temp) -
         condenser_duty / std::max(params.cp_mixture, 1e-6)) /
        std::max(params.top_tau, 1e-6);
    const double dT_bottom =
        (params.feed_flow * (params.feed_temp - state.bottom_temp) +
         reboiler_duty / std::max(params.cp_mixture, 1e-6) -
         0.012 * reflux_flow * (state.bottom_temp - state.top_temp)) /
        std::max(params.bottom_tau, 1e-6);

    const double separation_index =
        y_top / std::max(1.0 - y_top, 1e-6) /
        std::max(clamp01(state.bottom_x_light) / (1.0 - clamp01(state.bottom_x_light)), 1e-6);

    return SeparationRates{
        dx_top,
        dx_bottom,
        dT_top,
        dT_bottom,
        y_top,
        y_bottom,
        distillate_flow,
        bottoms_flow,
        condenser_duty,
        reboiler_duty,
        separation_index,
    };
}

SeparationState add_scaled(const SeparationState &state, const SeparationRates &rates, double factor) {
    return SeparationState{
        state.top_x_light + factor * rates.dx_top,
        state.bottom_x_light + factor * rates.dx_bottom,
        state.top_temp + factor * rates.dT_top,
        state.bottom_temp + factor * rates.dT_bottom,
    };
}

SeparationState clamp_state(const SeparationState &state) {
    return SeparationState{
        clamp01(state.top_x_light),
        clamp01(state.bottom_x_light),
        std::clamp(state.top_temp, 250.0, 700.0),
        std::clamp(state.bottom_temp, 250.0, 900.0),
    };
}

}  // namespace

int integrate_separation_process_rk4(
    const double *time_points,
    size_t n_points,
    const SeparationState *initial_state,
    SeparationState *state_out,
    SeparationDerived *derived_out,
    const SeparationParams *params
) {
    if (!time_points || !initial_state || !state_out || !derived_out || !params) {
        return -1;
    }
    if (n_points < 2) {
        return -2;
    }

    SeparationState current = clamp_state(*initial_state);
    state_out[0] = current;
    SeparationRates initial = evaluate_rates(current, *params);
    derived_out[0] = SeparationDerived{
        initial.y_top,
        initial.y_bottom,
        initial.distillate_flow,
        initial.bottoms_flow,
        initial.condenser_duty,
        initial.reboiler_duty,
        initial.separation_index,
    };

    for (size_t i = 1; i < n_points; ++i) {
        const double dt = time_points[i] - time_points[i - 1];
        if (dt <= 0.0) {
            return -3;
        }

        const SeparationRates k1 = evaluate_rates(current, *params);
        const SeparationRates k2 = evaluate_rates(add_scaled(current, k1, 0.5 * dt), *params);
        const SeparationRates k3 = evaluate_rates(add_scaled(current, k2, 0.5 * dt), *params);
        const SeparationRates k4 = evaluate_rates(add_scaled(current, k3, dt), *params);

        SeparationState next{
            current.top_x_light + (dt / 6.0) * (k1.dx_top + 2.0 * k2.dx_top + 2.0 * k3.dx_top + k4.dx_top),
            current.bottom_x_light + (dt / 6.0) * (k1.dx_bottom + 2.0 * k2.dx_bottom + 2.0 * k3.dx_bottom + k4.dx_bottom),
            current.top_temp + (dt / 6.0) * (k1.dT_top + 2.0 * k2.dT_top + 2.0 * k3.dT_top + k4.dT_top),
            current.bottom_temp + (dt / 6.0) * (k1.dT_bottom + 2.0 * k2.dT_bottom + 2.0 * k3.dT_bottom + k4.dT_bottom),
        };

        current = clamp_state(next);
        const SeparationRates snapshot = evaluate_rates(current, *params);
        state_out[i] = current;
        derived_out[i] = SeparationDerived{
            snapshot.y_top,
            snapshot.y_bottom,
            snapshot.distillate_flow,
            snapshot.bottoms_flow,
            snapshot.condenser_duty,
            snapshot.reboiler_duty,
            snapshot.separation_index,
        };
    }

    return 0;
}
