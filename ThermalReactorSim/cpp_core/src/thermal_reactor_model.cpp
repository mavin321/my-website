#include "thermal_reactor_model.h"

#include <algorithm>
#include <cmath>

namespace {

constexpr double GAS_CONSTANT = 8.31446261815324;

struct ReactorRates {
    double dca;
    double dcb;
    double dtr;
    double dtc;
    double heat_release;
    double heat_removal;
    double conversion;
    double reaction_rate;
};

double safe_pow(double value, double exponent) {
    return std::pow(std::max(value, 1e-12), exponent);
}

ReactorRates evaluate_rates(
    const ThermalReactorState &state,
    const ThermalReactorParams &params
) {
    const double ca = std::max(state.ca, 0.0);
    const double tr = std::max(state.reactor_temp, 1.0);
    const double tc = std::max(state.coolant_temp, 1.0);
    const double volume = std::max(params.reactor_volume, 1e-9);
    const double rho_cp = std::max(params.rho_cp, 1e-9);
    const double tau_j = std::max(params.jacket_tau, 1e-9);

    const double arrhenius =
        params.pre_exponential *
        std::exp(-params.activation_energy / (GAS_CONSTANT * tr));
    const double reaction_rate =
        params.catalyst_factor * arrhenius * safe_pow(ca, params.order_a);

    const double dca = params.flow_rate * (params.ca_feed - ca) - reaction_rate;
    const double dcb =
        params.flow_rate * (params.cb_feed - state.cb) + reaction_rate -
        params.product_decay * state.cb;

    const double heat_release =
        (-params.delta_h) * reaction_rate * volume;
    const double heat_removal =
        params.ua * (tr - tc) +
        params.ambient_ua * (tr - params.ambient_temp);

    const double dtr =
        params.flow_rate * (params.feed_temp - tr) +
        (heat_release - heat_removal) / (rho_cp * volume);
    const double dtc =
        (params.coolant_inlet_temp - tc) / tau_j +
        params.coolant_gain * (tr - tc);

    const double conversion =
        params.ca_feed > 1e-12 ? 1.0 - ca / params.ca_feed : 0.0;

    return ReactorRates{
        dca,
        dcb,
        dtr,
        dtc,
        heat_release,
        heat_removal,
        std::clamp(conversion, 0.0, 1.0),
        reaction_rate,
    };
}

ThermalReactorState add_scaled(
    const ThermalReactorState &state,
    const ReactorRates &rates,
    double factor
) {
    return ThermalReactorState{
        state.ca + factor * rates.dca,
        state.cb + factor * rates.dcb,
        state.reactor_temp + factor * rates.dtr,
        state.coolant_temp + factor * rates.dtc,
    };
}

ThermalReactorState clamp_state(const ThermalReactorState &state) {
    return ThermalReactorState{
        std::max(state.ca, 0.0),
        std::max(state.cb, 0.0),
        std::clamp(state.reactor_temp, 200.0, 2000.0),
        std::clamp(state.coolant_temp, 150.0, 1500.0),
    };
}

}  // namespace

int integrate_thermal_reactor_rk4(
    const double *time_points,
    size_t n_points,
    const ThermalReactorState *initial_state,
    ThermalReactorState *state_out,
    ThermalReactorDerived *derived_out,
    const ThermalReactorParams *params
) {
    if (!time_points || !initial_state || !state_out || !derived_out || !params) {
        return -1;
    }
    if (n_points < 2) {
        return -2;
    }

    ThermalReactorState current = clamp_state(*initial_state);
    state_out[0] = current;
    ReactorRates initial_rates = evaluate_rates(current, *params);
    derived_out[0] = ThermalReactorDerived{
        initial_rates.heat_release,
        initial_rates.heat_removal,
        initial_rates.conversion,
        initial_rates.reaction_rate,
    };

    for (size_t i = 1; i < n_points; ++i) {
        const double dt = time_points[i] - time_points[i - 1];
        if (dt <= 0.0) {
            return -3;
        }

        const ReactorRates k1 = evaluate_rates(current, *params);
        const ReactorRates k2 = evaluate_rates(add_scaled(current, k1, 0.5 * dt), *params);
        const ReactorRates k3 = evaluate_rates(add_scaled(current, k2, 0.5 * dt), *params);
        const ReactorRates k4 = evaluate_rates(add_scaled(current, k3, dt), *params);

        ThermalReactorState next{
            current.ca + (dt / 6.0) * (k1.dca + 2.0 * k2.dca + 2.0 * k3.dca + k4.dca),
            current.cb + (dt / 6.0) * (k1.dcb + 2.0 * k2.dcb + 2.0 * k3.dcb + k4.dcb),
            current.reactor_temp + (dt / 6.0) * (k1.dtr + 2.0 * k2.dtr + 2.0 * k3.dtr + k4.dtr),
            current.coolant_temp + (dt / 6.0) * (k1.dtc + 2.0 * k2.dtc + 2.0 * k3.dtc + k4.dtc),
        };

        current = clamp_state(next);
        const ReactorRates snapshot = evaluate_rates(current, *params);

        state_out[i] = current;
        derived_out[i] = ThermalReactorDerived{
            snapshot.heat_release,
            snapshot.heat_removal,
            snapshot.conversion,
            snapshot.reaction_rate,
        };
    }

    return 0;
}
