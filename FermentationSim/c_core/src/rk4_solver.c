#include "rk4_solver.h"
#include <stdlib.h>
#include <string.h>

int rk4_integrate(
    ode_func f,
    void *user_data,
    const double *time_points,
    size_t n_points,
    const double *y0,
    size_t state_dim,
    double *y_out
) {
    if (n_points < 2 || state_dim == 0) {
        return -1;
    }

    double *y = (double *)malloc(state_dim * sizeof(double));
    double *k1 = (double *)malloc(state_dim * sizeof(double));
    double *k2 = (double *)malloc(state_dim * sizeof(double));
    double *k3 = (double *)malloc(state_dim * sizeof(double));
    double *k4 = (double *)malloc(state_dim * sizeof(double));
    double *tmp = (double *)malloc(state_dim * sizeof(double));

    if (!y || !k1 || !k2 || !k3 || !k4 || !tmp) {
        free(y); free(k1); free(k2); free(k3); free(k4); free(tmp);
        return -2;
    }

    memcpy(y, y0, state_dim * sizeof(double));
    memcpy(&y_out[0], y0, state_dim * sizeof(double));

    for (size_t i = 1; i < n_points; ++i) {
        double t = time_points[i - 1];
        double dt = time_points[i] - time_points[i - 1];

        f(t, y, k1, user_data);

        for (size_t j = 0; j < state_dim; ++j) {
            tmp[j] = y[j] + 0.5 * dt * k1[j];
        }
        f(t + 0.5 * dt, tmp, k2, user_data);

        for (size_t j = 0; j < state_dim; ++j) {
            tmp[j] = y[j] + 0.5 * dt * k2[j];
        }
        f(t + 0.5 * dt, tmp, k3, user_data);

        for (size_t j = 0; j < state_dim; ++j) {
            tmp[j] = y[j] + dt * k3[j];
        }
        f(t + dt, tmp, k4, user_data);

        for (size_t j = 0; j < state_dim; ++j) {
            y[j] += dt * (k1[j] + 2.0 * k2[j] + 2.0 * k3[j] + k4[j]) / 6.0;
        }

        memcpy(&y_out[i * state_dim], y, state_dim * sizeof(double));
    }

    free(y); free(k1); free(k2); free(k3); free(k4); free(tmp);
    return 0;
}
