#include "atomic_orbital_model.h"

#include <algorithm>
#include <cmath>
#include <random>
#include <vector>

namespace {

constexpr double PI = 3.14159265358979323846;

double factorial_ratio(int numerator, int denominator) {
    if (numerator == denominator) {
        return 1.0;
    }
    double value = 1.0;
    if (numerator > denominator) {
        for (int i = denominator + 1; i <= numerator; ++i) {
            value *= static_cast<double>(i);
        }
        return value;
    }
    for (int i = numerator + 1; i <= denominator; ++i) {
        value /= static_cast<double>(i);
    }
    return value;
}

double generalized_laguerre(int k, int alpha, double x) {
    if (k == 0) {
        return 1.0;
    }
    if (k == 1) {
        return 1.0 + alpha - x;
    }

    double lkm2 = 1.0;
    double lkm1 = 1.0 + alpha - x;
    for (int i = 2; i <= k; ++i) {
        const double a = (2.0 * i - 1.0 + alpha - x) * lkm1;
        const double b = (i - 1.0 + alpha) * lkm2;
        const double current = (a - b) / static_cast<double>(i);
        lkm2 = lkm1;
        lkm1 = current;
    }
    return lkm1;
}

double associated_legendre(int l, int m_abs, double x) {
    double pmm = 1.0;
    if (m_abs > 0) {
        const double root = std::sqrt(std::max(1.0 - x * x, 0.0));
        double factor = 1.0;
        for (int i = 1; i <= m_abs; ++i) {
            pmm *= -factor * root;
            factor += 2.0;
        }
    }
    if (l == m_abs) {
        return pmm;
    }

    double pmmp1 = x * (2.0 * m_abs + 1.0) * pmm;
    if (l == m_abs + 1) {
        return pmmp1;
    }

    double pll = 0.0;
    double prev = pmm;
    double current = pmmp1;
    for (int ll = m_abs + 2; ll <= l; ++ll) {
        pll = ((2.0 * ll - 1.0) * x * current - (ll + m_abs - 1.0) * prev) /
              static_cast<double>(ll - m_abs);
        prev = current;
        current = pll;
    }
    return current;
}

double radial_wavefunction(int n, int l, double r) {
    const double rho = 2.0 * r / static_cast<double>(n);
    const int laguerre_order = n - l - 1;
    const int alpha = 2 * l + 1;
    const double norm =
        std::sqrt(std::pow(2.0 / static_cast<double>(n), 3.0) *
                  factorial_ratio(n - l - 1, n + l) /
                  (2.0 * static_cast<double>(n)));
    const double radial =
        norm * std::exp(-rho / 2.0) * std::pow(rho, l) *
        generalized_laguerre(laguerre_order, alpha, rho);
    return radial;
}

double angular_wavefunction_real(int l, int m, double theta, double phi) {
    const int m_abs = std::abs(m);
    const double legendre = associated_legendre(l, m_abs, std::cos(theta));
    const double norm =
        std::sqrt(((2.0 * l + 1.0) / (4.0 * PI)) *
                  factorial_ratio(l - m_abs, l + m_abs));
    const double base = norm * legendre;

    if (m > 0) {
        return std::sqrt(2.0) * base * std::cos(m_abs * phi);
    }
    if (m < 0) {
        return std::sqrt(2.0) * base * std::sin(m_abs * phi);
    }
    return base;
}

double orbital_probability_density(int n, int l, int m, double r, double theta, double phi) {
    const double radial = radial_wavefunction(n, l, r);
    const double angular = angular_wavefunction_real(l, m, theta, phi);
    return radial * radial * angular * angular;
}

}  // namespace

int sample_atomic_orbital(const AtomicOrbitalParams *params, AtomicOrbitalSample *samples_out) {
    if (!params || !samples_out) {
        return -1;
    }
    if (params->n <= 0 || params->l < 0 || params->l >= params->n || std::abs(params->m) > params->l) {
        return -2;
    }
    if (params->sample_count <= 0 || params->radial_max <= 0.0) {
        return -3;
    }

    std::mt19937 rng(params->seed == 0 ? 5489u : params->seed);
    std::uniform_real_distribution<double> unit_dist(0.0, 1.0);

    const int probe_count = 2500;
    double max_density = 1e-12;
    for (int i = 0; i < probe_count; ++i) {
        const double r = params->radial_max * unit_dist(rng);
        const double theta = std::acos(1.0 - 2.0 * unit_dist(rng));
        const double phi = 2.0 * PI * unit_dist(rng);
        max_density = std::max(
            max_density,
            orbital_probability_density(params->n, params->l, params->m, r, theta, phi)
        );
    }

    std::uniform_real_distribution<double> density_dist(0.0, max_density);
    int accepted = 0;
    int attempts = 0;
    const int max_attempts = params->sample_count * 600;

    while (accepted < params->sample_count && attempts < max_attempts) {
        attempts += 1;
        const double r = params->radial_max * std::cbrt(unit_dist(rng));
        const double theta = std::acos(1.0 - 2.0 * unit_dist(rng));
        const double phi = 2.0 * PI * unit_dist(rng);
        const double density = orbital_probability_density(params->n, params->l, params->m, r, theta, phi);

        if (density_dist(rng) <= density) {
            const double sin_theta = std::sin(theta);
            samples_out[accepted] = AtomicOrbitalSample{
                r * sin_theta * std::cos(phi),
                r * sin_theta * std::sin(phi),
                r * std::cos(theta),
                r,
                theta,
                phi,
                density,
                density / max_density,
            };
            accepted += 1;
        }
    }

    return accepted == params->sample_count ? 0 : -4;
}
