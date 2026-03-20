#include "fusion_plasma_model.h"

#include <algorithm>
#include <cmath>

namespace {

constexpr double PI = 3.14159265358979323846;
constexpr double MU0 = 4.0e-7 * PI;

struct PlasmaState {
    double density;
    double temperature;
    double helium_fraction;
};

struct PlasmaRates {
    double d_density;
    double d_temperature;
    double d_helium;
};

double volume_from_geometry(double major_radius, double minor_radius) {
    return 2.0 * PI * PI * major_radius * minor_radius * minor_radius;
}

double dt_reactivity(double temperature_kev) {
    const double t = std::max(temperature_kev, 0.1);
    const double numerator = 1.1e-24 * t * t;
    const double denominator = 1.0 + 0.035 * std::pow(t, 1.5);
    const double barrier = std::exp(-19.94 / std::pow(t, 1.0 / 3.0));
    return numerator * barrier / denominator;
}

double fusion_power_density(double density, double temperature_kev, double helium_fraction) {
    const double effective_density = std::max(density * (1.0 - helium_fraction), 0.0);
    const double react = dt_reactivity(temperature_kev);
    const double energy_per_reaction = 17.6e6 * 1.602176634e-19;
    return 0.25 * effective_density * effective_density * react * energy_per_reaction;
}

double bremsstrahlung_loss_density(
    double density,
    double temperature_kev,
    double impurity_fraction,
    double radiation_coeff
) {
    const double z_eff = 1.0 + 4.0 * std::max(impurity_fraction, 0.0);
    return radiation_coeff * z_eff * density * density * std::sqrt(std::max(temperature_kev, 0.1));
}

double beta_n(double density, double temperature_kev, double magnetic_field, double plasma_current, double minor_radius) {
    const double pressure = 2.0 * density * temperature_kev * 1.602176634e-16;
    const double beta = 2.0 * MU0 * pressure / std::max(magnetic_field * magnetic_field, 1e-9);
    const double normalizer = std::max(plasma_current, 1e-9) / std::max(minor_radius * magnetic_field, 1e-9);
    return 100.0 * beta / std::max(normalizer, 1e-9);
}

PlasmaRates evaluate_rates(const PlasmaState &state, const FusionPlasmaParams &params) {
    const double density = std::max(state.density, 1e18);
    const double temperature = std::max(state.temperature, 0.1);
    const double helium = std::clamp(state.helium_fraction, 0.0, 0.8);
    const double volume = volume_from_geometry(params.major_radius, params.minor_radius);

    const double p_fusion = fusion_power_density(density, temperature, helium) * volume;
    const double p_alpha = 0.2 * p_fusion;
    const double p_brem =
        bremsstrahlung_loss_density(
            density, temperature, params.impurity_fraction, params.radiation_coeff
        ) *
        volume;
    const double plasma_energy =
        3.0 * density * temperature * 1.602176634e-16 * volume;
    const double p_conf = plasma_energy / std::max(params.confinement_time, 1e-6);
    const double p_aux = std::max(params.auxiliary_power, 0.0);
    const double p_recycled = params.wall_reflectivity * p_alpha;

    const double particle_burn = p_fusion / (17.6e6 * 1.602176634e-19);
    const double d_density =
        params.fueling_rate - 2.0 * particle_burn / std::max(volume, 1e-9) -
        density / (15.0 * params.confinement_time);

    const double effective_heating =
        p_aux + params.alpha_heating_fraction * p_alpha + p_recycled - p_brem - p_conf;
    const double d_temperature =
        effective_heating / std::max(3.0 * density * volume * 1.602176634e-16, 1e-9) -
        0.18 * temperature * helium;

    const double ash_source = particle_burn / std::max(volume * density, 1e-9);
    const double ash_removal = helium / std::max(3.5 * params.confinement_time, 1e-9);
    const double d_helium = ash_source - ash_removal;

    return PlasmaRates{d_density, d_temperature, d_helium};
}

PlasmaState add_scaled(const PlasmaState &state, const PlasmaRates &rates, double factor) {
    return PlasmaState{
        state.density + factor * rates.d_density,
        state.temperature + factor * rates.d_temperature,
        state.helium_fraction + factor * rates.d_helium,
    };
}

PlasmaState clamp_state(const PlasmaState &state) {
    return PlasmaState{
        std::max(state.density, 1e17),
        std::clamp(state.temperature, 0.05, 120.0),
        std::clamp(state.helium_fraction, 0.0, 0.85),
    };
}

}  // namespace

int simulate_fusion_plasma(
    const FusionPlasmaParams *params,
    FusionPlasmaPoint *points_out,
    FusionPlasmaSummary *summary_out
) {
    if (!params || !points_out || !summary_out) {
        return -1;
    }
    if (params->major_radius <= 0 || params->minor_radius <= 0 || params->magnetic_field <= 0 ||
        params->density_0 <= 0 || params->temperature_0 <= 0 || params->confinement_time <= 0 ||
        params->time_end <= 0 || params->n_points < 2) {
        return -2;
    }

    PlasmaState state = clamp_state(
        PlasmaState{params->density_0, params->temperature_0, params->helium_fraction_0}
    );
    const double dt = params->time_end / (params->n_points - 1);
    const double volume = volume_from_geometry(params->major_radius, params->minor_radius);

    double peak_temperature = state.temperature;
    double peak_fusion_power = 0.0;
    double max_q = 0.0;
    double peak_triple_product = 0.0;

    for (int i = 0; i < params->n_points; ++i) {
        const double time = i * dt;
        const double reactivity = dt_reactivity(state.temperature);
        const double fusion_power_density_value =
            fusion_power_density(state.density, state.temperature, state.helium_fraction);
        const double fusion_power = fusion_power_density_value * volume;
        const double alpha_power = 0.2 * fusion_power;
        const double brem_loss =
            bremsstrahlung_loss_density(
                state.density, state.temperature, params->impurity_fraction, params->radiation_coeff
            ) *
            volume;
        const double confinement_loss =
            3.0 * state.density * state.temperature * 1.602176634e-16 * volume /
            params->confinement_time;
        const double q_value = fusion_power / std::max(params->auxiliary_power, 1e3);
        const double beta_value =
            beta_n(state.density, state.temperature, params->magnetic_field, params->plasma_current, params->minor_radius);
        const double triple_product =
            state.density * state.temperature * params->confinement_time;

        points_out[i] = FusionPlasmaPoint{
            time,
            state.density,
            state.temperature,
            state.helium_fraction,
            beta_value,
            reactivity,
            fusion_power,
            alpha_power,
            brem_loss,
            confinement_loss,
            q_value,
        };

        peak_temperature = std::max(peak_temperature, state.temperature);
        peak_fusion_power = std::max(peak_fusion_power, fusion_power);
        max_q = std::max(max_q, q_value);
        peak_triple_product = std::max(peak_triple_product, triple_product);

        if (i == params->n_points - 1) {
            break;
        }

        const PlasmaRates k1 = evaluate_rates(state, *params);
        const PlasmaRates k2 = evaluate_rates(add_scaled(state, k1, 0.5 * dt), *params);
        const PlasmaRates k3 = evaluate_rates(add_scaled(state, k2, 0.5 * dt), *params);
        const PlasmaRates k4 = evaluate_rates(add_scaled(state, k3, dt), *params);

        PlasmaState next{
            state.density + (dt / 6.0) * (k1.d_density + 2.0 * k2.d_density + 2.0 * k3.d_density + k4.d_density),
            state.temperature + (dt / 6.0) * (k1.d_temperature + 2.0 * k2.d_temperature + 2.0 * k3.d_temperature + k4.d_temperature),
            state.helium_fraction + (dt / 6.0) * (k1.d_helium + 2.0 * k2.d_helium + 2.0 * k3.d_helium + k4.d_helium),
        };
        state = clamp_state(next);
    }

    *summary_out = FusionPlasmaSummary{
        peak_temperature,
        peak_fusion_power,
        max_q,
        state.density,
        state.temperature,
        peak_triple_product,
    };

    return 0;
}
