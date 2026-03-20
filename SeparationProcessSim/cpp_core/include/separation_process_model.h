#ifndef SEPARATION_PROCESS_MODEL_H
#define SEPARATION_PROCESS_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(SEPARATION_PROCESS_BUILD_DLL)
#define SEPARATION_PROCESS_API __declspec(dllexport)
#elif defined(_WIN32)
#define SEPARATION_PROCESS_API __declspec(dllimport)
#else
#define SEPARATION_PROCESS_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double feed_flow;
    double feed_z_light;
    double feed_temp;
    double feed_pressure;
    double reflux_ratio;
    double boilup_ratio;
    double tray_efficiency;
    double relative_volatility_ref;
    double alpha_temp_coeff;
    double condenser_ua;
    double reboiler_ua;
    double condenser_temp;
    double steam_temp;
    double top_holdup;
    double bottom_holdup;
    double top_tau;
    double bottom_tau;
    double cp_mixture;
} SeparationParams;

typedef struct {
    double top_x_light;
    double bottom_x_light;
    double top_temp;
    double bottom_temp;
} SeparationState;

typedef struct {
    double top_y_light;
    double bottom_y_light;
    double distillate_flow;
    double bottoms_flow;
    double condenser_duty;
    double reboiler_duty;
    double separation_index;
} SeparationDerived;

SEPARATION_PROCESS_API int integrate_separation_process_rk4(
    const double *time_points,
    size_t n_points,
    const SeparationState *initial_state,
    SeparationState *state_out,
    SeparationDerived *derived_out,
    const SeparationParams *params
);

#ifdef __cplusplus
}
#endif

#endif
