#ifndef FERMENTATION_MODEL_H
#define FERMENTATION_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(FERMENTATION_BUILD_DLL)
#define FERMENTATION_API __declspec(dllexport)
#elif defined(_WIN32)
#define FERMENTATION_API __declspec(dllimport)
#else
#define FERMENTATION_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double mu_max;
    double Ks;
    double Yxs;
    double Ypx;
    double kd;
    double Kio;    // oxygen inhibition
    double Kp;     // product inhibition
    double maintenance; // substrate maintenance (g/gX/h)
    double Q10;    // temperature factor
    double T_ref;  // reference temperature (C)
    double Kla;    // volumetric mass transfer coefficient
    double C_star; // saturation DO
    double O2_maintenance;
    double delta_H; // heat generation per biomass
    double Cp;      // heat capacity
    double U;       // overall heat transfer coefficient
    double A;       // heat transfer area
    double rho;
} KineticParams;

typedef struct {
    double volume;     // L
    double feed_rate;  // L/h
    double feed_substrate_conc; // g/L
    double feed_start; // h, time when feed begins
    double feed_rate_end; // L/h, target feed rate (for ramp/exp)
    double feed_tau; // h, time constant for exponential
    int feed_mode; // 0=constant,1=ramp,2=exp,3=do_control
    double do_setpoint; // g/L
    double do_Kp;
    double aeration_rate;       // vvm
    double agitation_speed;     // rpm
    double cooling_temp;        // °C
    double coolant_flow;        // kg/s
    double agit_power_coeff; // W/(L*rpm^3)
    double agit_heat_eff;   // fraction to heat
} OperatingConditions;

/**
 * Computes derivatives for a state vector:
 * state[0] = X (biomass, g/L)
 * state[1] = S (substrate, g/L)
 * state[2] = P (product, g/L)
 * state[3] = DO (dissolved oxygen, g/L)
 * state[4] = T (temperature, °C)
 * state[5] = V (volume, L)
 */
FERMENTATION_API void fermentation_odes(
    double t,
    const double *state,
    double *dstate_dt,
    const KineticParams *params,
    const OperatingConditions *ops
);

/**
 * Generic fixed-step RK4 integrator for the fermentation model.
 * time_points – array of times (monotonic increasing)
 * n_points    – length of time_points
 * y0          – initial state (length 5)
 * y_out       – output (n_points x 5 flattened row-major)
 */
FERMENTATION_API int integrate_fermentation_rk4(
    const double *time_points,
    size_t n_points,
    const double *y0,
    double *y_out,
    const KineticParams *params,
    const OperatingConditions *ops
);

#ifdef __cplusplus
}
#endif

#endif
