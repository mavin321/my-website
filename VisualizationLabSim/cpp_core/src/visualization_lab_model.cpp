#include "visualization_lab_model.h"

#include <algorithm>
#include <cmath>

namespace {

constexpr double PI = 3.14159265358979323846;

double sqr(double value) {
    return value * value;
}

}  // namespace

int simulate_visualization_lab(
    const VisualizationLabParams *params,
    VisualizationLabPoint *points_out,
    VisualizationLabSummary *summary_out
) {
    if (!params || !points_out || !summary_out) {
        return -1;
    }
    if (params->grid_points < 5) {
        return -2;
    }

    const int n = params->grid_points;
    const int total_points = n * n * n;
    const double half_domain = params->domain_size * 0.5;
    const double spacing = params->domain_size / static_cast<double>(n - 1);
    const double sigma2 = sqr(params->source_sigma) + 2.0 * params->diffusivity * std::max(params->time_value, 0.0);
    const double sigma = std::sqrt(std::max(sigma2, 1e-9));
    const double center_x = params->advection_x * params->time_value;
    const double center_y = params->advection_y * params->time_value;
    const double center_z = params->advection_z * params->time_value;
    const double norm = params->source_strength / std::pow(2.0 * PI * sigma2, 1.5);
    const double core_radius2 = std::max(0.02 * sqr(params->domain_size), 1e-6);

    double max_concentration = 0.0;
    double max_temperature = 0.0;
    double speed_sum = 0.0;
    double weighted_radius_sum = 0.0;
    double concentration_sum = 0.0;
    int index = 0;

    for (int ix = 0; ix < n; ++ix) {
        const double x = -half_domain + spacing * ix;
        for (int iy = 0; iy < n; ++iy) {
            const double y = -half_domain + spacing * iy;
            for (int iz = 0; iz < n; ++iz) {
                const double z = -half_domain + spacing * iz;
                const double dx = x - center_x;
                const double dy = y - center_y;
                const double dz = z - center_z;
                const double r2 = sqr(dx) + sqr(dy) + sqr(dz);
                const double concentration = norm * std::exp(-r2 / std::max(2.0 * sigma2, 1e-9));

                const double rxy2 = sqr(x) + sqr(y);
                const double swirl = params->vortex_strength * std::exp(-rxy2 / std::max(0.18 * sqr(params->domain_size), 1e-9));
                const double vx = params->advection_x - swirl * y / (rxy2 + core_radius2);
                const double vy = params->advection_y + swirl * x / (rxy2 + core_radius2);
                const double vz =
                    params->advection_z +
                    0.35 * params->vortex_strength * std::exp(-std::abs(z) / std::max(0.3 * params->domain_size, 1e-9)) *
                    std::sin(PI * x / std::max(params->domain_size, 1e-9));
                const double speed = std::sqrt(sqr(vx) + sqr(vy) + sqr(vz));

                const double temperature =
                    295.0 +
                    params->thermal_gain * concentration *
                    (1.0 + 0.35 * std::cos(2.0 * PI * z / std::max(params->domain_size, 1e-9)));

                points_out[index++] = VisualizationLabPoint{
                    x,
                    y,
                    z,
                    concentration,
                    temperature,
                    vx,
                    vy,
                    vz,
                    speed,
                };

                max_concentration = std::max(max_concentration, concentration);
                max_temperature = std::max(max_temperature, temperature);
                speed_sum += speed;
                weighted_radius_sum += std::sqrt(r2) * concentration;
                concentration_sum += concentration;
            }
        }
    }

    *summary_out = VisualizationLabSummary{
        max_concentration,
        max_temperature,
        speed_sum / static_cast<double>(total_points),
        weighted_radius_sum / std::max(concentration_sum, 1e-12),
    };

    return 0;
}
