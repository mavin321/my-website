#include "scientific_visuals_model.h"

#include <algorithm>
#include <cmath>

namespace {

constexpr double PI = 3.14159265358979323846;

double clamp01(double value) {
    return std::clamp(value, 0.0, 1.0);
}

double safe_cos(double value) {
    return std::cos(value);
}

double safe_sin(double value) {
    return std::sin(value);
}

void scene_point(
    int scene,
    int frame_idx,
    int point_idx,
    int frame_count,
    int points_per_frame,
    ScientificVisualPoint &out
) {
    const double t = static_cast<double>(frame_idx) / std::max(frame_count - 1, 1);
    const double phase = 2.0 * PI * t;
    const double u = static_cast<double>(point_idx) / std::max(points_per_frame, 1);
    const double phi = 2.0 * PI * u;
    const double alt = 2.0 * PI * ((point_idx * 37) % std::max(points_per_frame, 1)) / std::max(points_per_frame, 1);
    out.time_value = t;
    out.scalar_a = 0.0;
    out.scalar_b = 0.0;
    out.category = 0;

    switch (scene) {
        case 0: { // electron motion
            const double radius = 0.35 + 0.85 * u;
            out.x = radius * safe_cos(phase * 3.0 + phi);
            out.y = 0.42 * radius * safe_sin(phase * 2.0 + phi * 0.6);
            out.z = radius * safe_sin(phase * 3.0 + phi);
            out.intensity = 0.25 + 0.75 * std::exp(-2.0 * radius);
            out.scalar_a = radius;
            out.scalar_b = 3.0 + 2.0 * safe_sin(phase);
            break;
        }
        case 1: { // molecular vibrations
            const double base = -1.2 + 2.4 * u;
            const double vibration = 0.18 * safe_sin(phase * 4.0 + phi * 2.0);
            out.x = base;
            out.y = vibration;
            out.z = 0.22 * safe_cos(phase * 4.0 + phi * 2.0);
            out.intensity = 0.4 + 0.6 * clamp01(std::abs(vibration) / 0.18);
            out.category = point_idx % 2;
            out.scalar_a = std::abs(vibration);
            out.scalar_b = 1.0 + point_idx % 4;
            break;
        }
        case 2: { // chemical reaction fronts
            const double front = -1.2 + 2.4 * t;
            const double x = -1.5 + 3.0 * u;
            const double width = 0.18 + 0.04 * safe_sin(phi * 3.0);
            const double activation = 1.0 / (1.0 + std::exp(-(x - front) / width));
            out.x = x;
            out.y = (u - 0.5) * 1.3;
            out.z = 0.35 * safe_sin(phi * 6.0 + phase);
            out.intensity = activation;
            out.scalar_a = activation;
            out.scalar_b = 1.0 - activation;
            break;
        }
        case 3: { // crystal lattice dynamics
            const int i = point_idx % 8;
            const int j = (point_idx / 8) % 8;
            const int k = (point_idx / 64) % 4;
            const double dx = -1.2 + i * 0.34;
            const double dy = -1.2 + j * 0.34;
            const double dz = -0.5 + k * 0.34;
            const double wave = 0.08 * safe_sin(phase * 5.0 + dx * 2.0 + dy * 2.5);
            out.x = dx;
            out.y = dy + wave;
            out.z = dz + 0.6 * wave;
            out.intensity = 0.35 + 0.65 * clamp01(std::abs(wave) / 0.08);
            out.category = (i + j + k) % 2;
            out.scalar_a = wave;
            out.scalar_b = std::sqrt(dx * dx + dy * dy + dz * dz);
            break;
        }
        case 4: { // wave interference
            const double x = -1.6 + 3.2 * u;
            const double y = -1.6 + 3.2 * static_cast<double>((point_idx * 29) % points_per_frame) / points_per_frame;
            const double r1 = std::sqrt((x + 0.55) * (x + 0.55) + y * y);
            const double r2 = std::sqrt((x - 0.55) * (x - 0.55) + y * y);
            const double amp = safe_sin(10.0 * r1 - phase * 4.0) + safe_sin(10.0 * r2 - phase * 4.0);
            out.x = x;
            out.y = y;
            out.z = 0.45 * amp;
            out.intensity = clamp01(0.5 + 0.25 * amp);
            out.scalar_a = amp;
            out.scalar_b = r1 - r2;
            break;
        }
        case 5: { // electromagnetic field
            const double theta = phi;
            const double radius = 0.35 + 0.95 * u;
            out.x = radius * safe_cos(theta);
            out.y = 0.55 * safe_sin(phase * 3.0 + theta * 2.0);
            out.z = radius * safe_sin(theta);
            out.intensity = 0.3 + 0.7 * clamp01((safe_sin(theta - phase * 2.0) + 1.0) * 0.5);
            out.scalar_a = safe_cos(theta - phase * 2.0);
            out.scalar_b = safe_sin(theta - phase * 2.0);
            break;
        }
        case 6: { // gravitational orbits
            const double orbit = 0.45 + 1.1 * u;
            const double ecc = 0.12 + 0.24 * (point_idx % 5) / 4.0;
            const double theta = phase * (1.0 + 0.5 * u) + phi;
            out.x = orbit * (safe_cos(theta) - ecc);
            out.y = 0.16 * safe_sin(theta * 0.5 + alt);
            out.z = orbit * std::sqrt(1.0 - ecc * ecc) * safe_sin(theta);
            out.intensity = 0.35 + 0.65 * clamp01(1.0 / std::max(orbit * (1.0 - ecc * safe_cos(theta)), 0.25));
            out.scalar_a = orbit;
            out.scalar_b = ecc;
            break;
        }
        case 7: { // fluid flow turbulence
            const double x = -1.7 + 3.4 * u;
            const double y = -0.95 + 1.9 * static_cast<double>((point_idx * 17) % points_per_frame) / points_per_frame;
            const double vort = safe_sin(phase * 3.0 + x * 2.3) * safe_cos(y * 3.1 - phase * 2.0);
            out.x = x;
            out.y = y + 0.18 * vort;
            out.z = 0.26 * safe_sin(x * 2.0 + y * 3.0 + phase * 4.0);
            out.intensity = 0.3 + 0.7 * clamp01(std::abs(vort));
            out.scalar_a = 1.2 + 0.9 * vort;
            out.scalar_b = safe_sin(x - phase) - safe_cos(y + phase);
            break;
        }
        case 8: { // heat diffusion
            const double x = -1.6 + 3.2 * u;
            const double y = -1.6 + 3.2 * static_cast<double>((point_idx * 19) % points_per_frame) / points_per_frame;
            const double sigma = 0.18 + 0.95 * t;
            const double temp = std::exp(-(x * x + y * y) / (2.0 * sigma * sigma));
            out.x = x;
            out.y = y;
            out.z = 0.75 * temp;
            out.intensity = temp;
            out.scalar_a = sigma;
            out.scalar_b = temp;
            break;
        }
        case 9: { // sound wave
            const double x = -1.8 + 3.6 * u;
            const double amp = safe_sin(8.0 * x - phase * 6.0);
            out.x = x;
            out.y = 0.3 * amp;
            out.z = 0.0;
            out.intensity = 0.25 + 0.75 * clamp01((amp + 1.0) * 0.5);
            out.scalar_a = amp;
            out.scalar_b = 8.0;
            break;
        }
        case 10: { // quantum probability cloud
            const double r = std::sqrt(u) * 1.4;
            out.x = r * safe_cos(phi) * safe_sin(alt);
            out.y = r * safe_sin(phi) * safe_sin(alt);
            out.z = r * safe_cos(alt);
            const double lobes = std::pow(safe_cos(2.0 * phi + phase), 2.0);
            out.intensity = clamp01(std::exp(-r * 1.4) * (0.35 + 0.9 * lobes));
            out.scalar_a = r;
            out.scalar_b = lobes;
            break;
        }
        case 11: { // phase transition
            const double x = -1.4 + 2.8 * u;
            const double order = std::tanh((t - 0.55) * 8.0 + safe_sin(phi * 5.0) * 0.6);
            out.x = x;
            out.y = 0.85 * order;
            out.z = 0.25 * safe_cos(phi * 4.0 + phase * 3.0);
            out.intensity = clamp01(0.5 + 0.5 * order);
            out.scalar_a = order;
            out.scalar_b = t;
            break;
        }
        default: { // neural signal propagation
            const double x = -1.7 + 3.4 * u;
            const double spike = std::exp(-std::pow((x - (-1.4 + 2.8 * t)) / 0.22, 2.0));
            out.x = x;
            out.y = 0.9 * spike;
            out.z = 0.16 * safe_sin(phi * 8.0 + phase * 2.0);
            out.intensity = 0.2 + 0.8 * spike;
            out.scalar_a = spike;
            out.scalar_b = 1.0 - spike;
            break;
        }
    }
}

}  // namespace

int generate_scientific_visual_scene(
    const ScientificVisualsParams *params,
    ScientificVisualPoint *points_out,
    ScientificVisualSummary *summary_out
) {
    if (!params || !points_out || !summary_out) {
        return -1;
    }
    if (params->frame_count < 2 || params->points_per_frame < 32) {
        return -2;
    }

    const int frame_count = params->frame_count;
    const int points_per_frame = params->points_per_frame;
    const int total_points = frame_count * points_per_frame;

    double max_intensity = 0.0;
    double mean_a = 0.0;
    double mean_b = 0.0;
    double rms_extent = 0.0;

    for (int frame = 0; frame < frame_count; ++frame) {
      for (int i = 0; i < points_per_frame; ++i) {
        ScientificVisualPoint point{};
        scene_point(params->scene_index, frame, i, frame_count, points_per_frame, point);
        const int idx = frame * points_per_frame + i;
        points_out[idx] = point;
        max_intensity = std::max(max_intensity, point.intensity);
        mean_a += point.scalar_a;
        mean_b += point.scalar_b;
        rms_extent += point.x * point.x + point.y * point.y + point.z * point.z;
      }
    }

    const double count = static_cast<double>(total_points);
    *summary_out = ScientificVisualSummary{
        std::sqrt(rms_extent / std::max(count, 1.0)),
        max_intensity,
        mean_a / std::max(count, 1.0),
        mean_b / std::max(count, 1.0),
    };
    return 0;
}
