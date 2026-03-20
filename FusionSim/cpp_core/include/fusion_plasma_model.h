#ifndef FUSION_PLASMA_MODEL_H
#define FUSION_PLASMA_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(FUSION_PLASMA_BUILD_DLL)
#define FUSION_PLASMA_API __declspec(dllexport)
#elif defined(_WIN32)
#define FUSION_PLASMA_API __declspec(dllimport)
#else
#define FUSION_PLASMA_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double major_radius;
    double minor_radius;
    double magnetic_field;
    double plasma_current;
    double density_0;
    double temperature_0;
    double helium_fraction_0;
    double confinement_time;
    double auxiliary_power;
    double wall_reflectivity;
    double impurity_fraction;
    double fueling_rate;
    double radiation_coeff;
    double alpha_heating_fraction;
    double time_end;
    int n_points;
} FusionPlasmaParams;

typedef struct {
    double time;
    double density;
    double temperature;
    double helium_fraction;
    double beta_n;
    double reactivity;
    double fusion_power;
    double alpha_power;
    double bremsstrahlung_loss;
    double confinement_loss;
    double q_value;
} FusionPlasmaPoint;

typedef struct {
    double peak_temperature;
    double peak_fusion_power;
    double max_q;
    double final_density;
    double final_temperature;
    double triple_product_peak;
} FusionPlasmaSummary;

FUSION_PLASMA_API int simulate_fusion_plasma(
    const FusionPlasmaParams *params,
    FusionPlasmaPoint *points_out,
    FusionPlasmaSummary *summary_out
);

#ifdef __cplusplus
}
#endif

#endif
