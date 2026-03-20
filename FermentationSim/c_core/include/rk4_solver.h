#ifndef RK4_SOLVER_H
#define RK4_SOLVER_H

#include <stddef.h>

typedef void (*ode_func)(
    double t,
    const double *state,
    double *dstate_dt,
    void *user_data
);

int rk4_integrate(
    ode_func f,
    void *user_data,
    const double *time_points,
    size_t n_points,
    const double *y0,
    size_t state_dim,
    double *y_out
);

#endif
