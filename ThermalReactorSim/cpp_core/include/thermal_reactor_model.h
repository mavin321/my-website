#ifndef THERMAL_REACTOR_MODEL_H
#define THERMAL_REACTOR_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(THERMAL_REACTOR_BUILD_DLL)
#define THERMAL_REACTOR_API __declspec(dllexport)
#elif defined(_WIN32)
#define THERMAL_REACTOR_API __declspec(dllimport)
#else
#define THERMAL_REACTOR_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double ca_feed;
    double cb_feed;
    double feed_temp;
    double coolant_inlet_temp;
    double ambient_temp;
    double flow_rate;
    double reactor_volume;
    double jacket_tau;
    double rho_cp;
    double coolant_gain;
    double ua;
    double ambient_ua;
    double delta_h;
    double pre_exponential;
    double activation_energy;
    double order_a;
    double catalyst_factor;
    double product_decay;
} ThermalReactorParams;

typedef struct {
    double ca;
    double cb;
    double reactor_temp;
    double coolant_temp;
} ThermalReactorState;

typedef struct {
    double heat_release;
    double heat_removal;
    double conversion;
    double reaction_rate;
} ThermalReactorDerived;

THERMAL_REACTOR_API int integrate_thermal_reactor_rk4(
    const double *time_points,
    size_t n_points,
    const ThermalReactorState *initial_state,
    ThermalReactorState *state_out,
    ThermalReactorDerived *derived_out,
    const ThermalReactorParams *params
);

#ifdef __cplusplus
}
#endif

#endif
