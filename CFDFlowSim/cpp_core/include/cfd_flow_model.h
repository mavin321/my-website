#ifndef CFD_FLOW_MODEL_H
#define CFD_FLOW_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(CFD_FLOW_BUILD_DLL)
#define CFD_FLOW_API __declspec(dllexport)
#elif defined(_WIN32)
#define CFD_FLOW_API __declspec(dllimport)
#else
#define CFD_FLOW_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double length;
    double diameter;
    double mass_flow;
    double density;
    double viscosity;
    double roughness;
    double inlet_temp;
    double wall_temp;
    double cp;
    double conductivity;
    int axial_points;
    int radial_points;
} CFDFlowParams;

typedef struct {
    double x;
    double r;
    double velocity;
    double temperature;
    double pressure;
    double turbulence_intensity;
} CFDFlowPoint;

typedef struct {
    double reynolds;
    double friction_factor;
    double pressure_drop;
    double nusselt;
    double heat_transfer_coeff;
    double bulk_velocity;
    double max_velocity;
} CFDFlowSummary;

CFD_FLOW_API int simulate_pipe_flow(
    const CFDFlowParams *params,
    CFDFlowPoint *points_out,
    CFDFlowSummary *summary_out
);

#ifdef __cplusplus
}
#endif

#endif
