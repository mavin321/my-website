#include "cfd_flow_model.h"

#include <algorithm>
#include <cmath>

namespace {

constexpr double PI = 3.14159265358979323846;

double hydraulic_area(double diameter) {
    return PI * diameter * diameter / 4.0;
}

double prandtl_number(double cp, double viscosity, double conductivity) {
    return cp * viscosity / std::max(conductivity, 1e-9);
}

double colebrook_white(double reynolds, double roughness, double diameter) {
    double f = 0.02;
    const double rel_roughness = roughness / std::max(diameter, 1e-12);
    for (int i = 0; i < 20; ++i) {
        const double rhs =
            -2.0 * std::log10(rel_roughness / 3.7 + 2.51 / (reynolds * std::sqrt(f)));
        f = 1.0 / (rhs * rhs);
    }
    return f;
}

}  // namespace

int simulate_pipe_flow(
    const CFDFlowParams *params,
    CFDFlowPoint *points_out,
    CFDFlowSummary *summary_out
) {
    if (!params || !points_out || !summary_out) {
        return -1;
    }
    if (params->length <= 0 || params->diameter <= 0 || params->mass_flow <= 0 ||
        params->density <= 0 || params->viscosity <= 0 || params->cp <= 0 ||
        params->conductivity <= 0 || params->axial_points < 2 || params->radial_points < 2) {
        return -2;
    }

    const double area = hydraulic_area(params->diameter);
    const double bulk_velocity = params->mass_flow / (params->density * area);
    const double reynolds = params->density * bulk_velocity * params->diameter / params->viscosity;
    const bool turbulent = reynolds >= 2300.0;
    const double friction_factor = turbulent
        ? colebrook_white(reynolds, params->roughness, params->diameter)
        : 64.0 / std::max(reynolds, 1e-9);
    const double pressure_drop =
        friction_factor * (params->length / params->diameter) *
        0.5 * params->density * bulk_velocity * bulk_velocity;
    const double pr = prandtl_number(params->cp, params->viscosity, params->conductivity);
    const double nusselt = turbulent
        ? 0.023 * std::pow(reynolds, 0.8) * std::pow(pr, 0.4)
        : 3.66;
    const double h = nusselt * params->conductivity / params->diameter;
    const double perimeter = PI * params->diameter;
    const double heat_exchange_rate =
        h * perimeter / std::max(params->mass_flow * params->cp, 1e-9);

    const int total_points = params->axial_points * params->radial_points;
    const double radius = params->diameter / 2.0;
    const double max_velocity = turbulent ? bulk_velocity * 1.22 : bulk_velocity * 2.0;

    for (int i = 0; i < params->axial_points; ++i) {
        const double x = params->length * static_cast<double>(i) / (params->axial_points - 1);
        const double pressure = std::max(0.0, pressure_drop * (1.0 - x / params->length));
        const double bulk_temp =
            params->wall_temp -
            (params->wall_temp - params->inlet_temp) *
                std::exp(-heat_exchange_rate * x);

        for (int j = 0; j < params->radial_points; ++j) {
            const double radial_fraction = static_cast<double>(j) / (params->radial_points - 1);
            const double r = radial_fraction * radius;
            double profile = 0.0;
            double turbulence_intensity = 0.0;

            if (turbulent) {
                profile = std::pow(std::max(1.0 - radial_fraction, 0.0), 1.0 / 7.0);
                turbulence_intensity = 0.16 * std::pow(reynolds, -1.0 / 8.0) *
                    (0.4 + 0.6 * radial_fraction);
            } else {
                profile = std::max(1.0 - radial_fraction * radial_fraction, 0.0);
                turbulence_intensity = 0.01 * radial_fraction;
            }

            const double velocity = std::max(0.0, max_velocity * profile);
            const double wall_blend = std::pow(radial_fraction, turbulent ? 0.85 : 1.6);
            const double temperature =
                bulk_temp + wall_blend * (params->wall_temp - bulk_temp);

            const int index = i * params->radial_points + j;
            points_out[index] = CFDFlowPoint{
                x,
                r,
                velocity,
                temperature,
                pressure,
                turbulence_intensity,
            };
        }
    }

    *summary_out = CFDFlowSummary{
        reynolds,
        friction_factor,
        pressure_drop,
        nusselt,
        h,
        bulk_velocity,
        max_velocity,
    };

    return total_points;
}
