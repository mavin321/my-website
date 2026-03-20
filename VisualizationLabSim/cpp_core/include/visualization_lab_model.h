#ifndef VISUALIZATION_LAB_MODEL_H
#define VISUALIZATION_LAB_MODEL_H

#ifdef _WIN32
#  ifdef VISUALIZATION_LAB_BUILD_DLL
#    define VISUALIZATION_LAB_API __declspec(dllexport)
#  else
#    define VISUALIZATION_LAB_API __declspec(dllimport)
#  endif
#else
#  define VISUALIZATION_LAB_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double domain_size;
    double diffusivity;
    double advection_x;
    double advection_y;
    double advection_z;
    double source_strength;
    double source_sigma;
    double vortex_strength;
    double thermal_gain;
    double time_value;
    int grid_points;
} VisualizationLabParams;

typedef struct {
    double x;
    double y;
    double z;
    double concentration;
    double temperature;
    double vx;
    double vy;
    double vz;
    double speed;
} VisualizationLabPoint;

typedef struct {
    double max_concentration;
    double max_temperature;
    double mean_speed;
    double plume_radius;
} VisualizationLabSummary;

VISUALIZATION_LAB_API int simulate_visualization_lab(
    const VisualizationLabParams *params,
    VisualizationLabPoint *points_out,
    VisualizationLabSummary *summary_out
);

#ifdef __cplusplus
}
#endif

#endif
