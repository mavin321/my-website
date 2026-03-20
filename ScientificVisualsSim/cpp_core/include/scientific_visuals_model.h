#ifndef SCIENTIFIC_VISUALS_MODEL_H
#define SCIENTIFIC_VISUALS_MODEL_H

#ifdef _WIN32
#  ifdef SCIENTIFIC_VISUALS_BUILD_DLL
#    define SCIENTIFIC_VISUALS_API __declspec(dllexport)
#  else
#    define SCIENTIFIC_VISUALS_API __declspec(dllimport)
#  endif
#else
#  define SCIENTIFIC_VISUALS_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int scene_index;
    int frame_count;
    int points_per_frame;
} ScientificVisualsParams;

typedef struct {
    double time_value;
    double x;
    double y;
    double z;
    double intensity;
    double scalar_a;
    double scalar_b;
    int category;
} ScientificVisualPoint;

typedef struct {
    double scale;
    double metric_a;
    double metric_b;
    double metric_c;
} ScientificVisualSummary;

SCIENTIFIC_VISUALS_API int generate_scientific_visual_scene(
    const ScientificVisualsParams *params,
    ScientificVisualPoint *points_out,
    ScientificVisualSummary *summary_out
);

#ifdef __cplusplus
}
#endif

#endif
