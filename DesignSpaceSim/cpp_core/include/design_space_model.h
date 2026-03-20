#ifndef DESIGN_SPACE_MODEL_H
#define DESIGN_SPACE_MODEL_H

#ifdef _WIN32
#  ifdef DESIGN_SPACE_BUILD_DLL
#    define DESIGN_SPACE_API __declspec(dllexport)
#  else
#    define DESIGN_SPACE_API __declspec(dllimport)
#  endif
#else
#  define DESIGN_SPACE_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double temp_min;
    double temp_max;
    double tau_min;
    double tau_max;
    double feed_concentration;
    double coolant_temp;
    double pre_exponential_main;
    double activation_energy_main;
    double pre_exponential_side;
    double activation_energy_side;
    double delta_h_main;
    double delta_h_side;
    double ua;
    double rho_cp;
    double reactor_volume;
    double product_price;
    double utility_cost;
    int temp_points;
    int tau_points;
} DesignSpaceParams;

typedef struct {
    double temperature;
    double residence_time;
    double conversion;
    double selectivity;
    double yield_value;
    double heat_release;
    double heat_duty;
    double space_time_yield;
    double profitability;
    double safety_index;
} DesignSpacePoint;

typedef struct {
    double best_yield;
    double best_profitability;
    double best_space_time_yield;
    double lowest_heat_duty;
    int pareto_count;
} DesignSpaceSummary;

DESIGN_SPACE_API int simulate_design_space(
    const DesignSpaceParams *params,
    DesignSpacePoint *points_out,
    int *pareto_flags_out,
    DesignSpaceSummary *summary_out
);

#ifdef __cplusplus
}
#endif

#endif
