#include "fermentation_model.h"
#include "rk4_solver.h"
#include <math.h>
#include <string.h>

typedef struct {
    KineticParams params;
    OperatingConditions ops;
} ModelContext;

static double compute_feed_rate(double t, const OperatingConditions *ops, double DO) {
    if (t < ops->feed_start) {
        return 0.0;
    }
    double fr0 = ops->feed_rate;
    double fr1 = ops->feed_rate_end;
    switch (ops->feed_mode) {
        case 1: { // ramp
            double dt = t - ops->feed_start;
            if (fr1 > fr0 && ops->feed_tau > 0) {
                double slope = (fr1 - fr0) / ops->feed_tau;
                return fr0 + slope * dt > fr1 ? fr1 : fr0 + slope * dt;
            }
            return fr0;
        }
        case 2: { // exponential
            double dt = t - ops->feed_start;
            double tau = ops->feed_tau > 1e-6 ? ops->feed_tau : 1e-6;
            double target = fr1 > 0 ? fr1 : fr0;
            double fr = target + (fr0 - target) * exp(-dt / tau);
            return fr;
        }
        case 3: { // DO control (proportional)
            double error = ops->do_setpoint - DO;
            double fr = fr0 + ops->do_Kp * error;
            return fr < 0.0 ? 0.0 : fr;
        }
        default:
            return fr0;
    }
}

static void fermentation_ode_wrapper(
    double t,
    const double *state,
    double *dstate_dt,
    void *user_data
) {
    (void)t; // unused
    ModelContext *ctx = (ModelContext *)user_data;
    fermentation_odes(t, state, dstate_dt, &ctx->params, &ctx->ops);
}

void fermentation_odes(
    double t,
    const double *state,
    double *dstate_dt,
    const KineticParams *params,
    const OperatingConditions *ops
) {
    double X  = state[0];
    double S  = state[1];
    double P  = state[2];
    double DO = state[3];
    double T  = state[4];
    double V  = state[5];

    double V_safe = fmax(V, 1e-6);
    // Avoid division by zero
double DO_safe = fmax(DO, 1e-8);
double S_safe = fmax(S, 1e-8);

    double temp_factor = pow(params->Q10, (T - params->T_ref) / 10.0);
    if (temp_factor < 0.0) temp_factor = 0.0;

    double mu_monod = params->mu_max * temp_factor * S_safe / (params->Ks + S_safe);

    double o2_factor = DO_safe / (params->Kio + DO_safe);

    double product_factor = 1.0 / (1.0 + P / params->Kp);

    double mu = mu_monod * o2_factor * product_factor;

    double feed_rate = compute_feed_rate(t, ops, DO_safe);
    double D = feed_rate / V_safe;

    double rX = (mu - params->kd - D) * X;
    double rS = -(1.0 / params->Yxs) * mu * X - params->maintenance * X + D * (ops->feed_substrate_conc - S);
    double rP = params->Ypx * mu * X - D * P;

    // Oxygen uptake rate
    double OUR = params->O2_maintenance * X;
    double Kla = params->Kla;
    double C_star = params->C_star;
    double kla_corr = Kla * pow(fmax(ops->aeration_rate, 1e-6), 0.5) * pow(fmax(ops->agitation_speed, 1e-6) / 300.0, 0.7);
    if (kla_corr < 0.0) kla_corr = 0.0;
    double OTR = kla_corr * fmax(C_star - DO, 0.0);

    double dXdt  = rX;
    double dSdt  = rS;
    double dPdt  = rP;
    double dDOdt = OTR - OUR - D * DO;

    // Heat balance (simplified)
    double Q_gen = params->delta_H * mu * X * V_safe;
    double Q_loss = params->U * params->A * (T - ops->cooling_temp);

    // Agitation heat input (mechanical power -> heat)
    double agit_power = ops->agit_power_coeff * V_safe * pow(fmax(ops->agitation_speed, 0.0), 3.0);
    double Q_agit = ops->agit_heat_eff * agit_power;

    double dTdt = (Q_gen + Q_agit - Q_loss) / (params->rho * V_safe * params->Cp);
    double dVdt = feed_rate;

    dstate_dt[0] = dXdt;
    dstate_dt[1] = dSdt;
    dstate_dt[2] = dPdt;
    dstate_dt[3] = dDOdt;
    dstate_dt[4] = dTdt;
    dstate_dt[5] = dVdt;
}

int integrate_fermentation_rk4(
    const double *time_points,
    size_t n_points,
    const double *y0,
    double *y_out,
    const KineticParams *params,
    const OperatingConditions *ops
) {
    ModelContext ctx;
    memcpy(&ctx.params, params, sizeof(KineticParams));
    memcpy(&ctx.ops, ops, sizeof(OperatingConditions));

    size_t state_dim = 6;

    return rk4_integrate(
        fermentation_ode_wrapper,
        (void *)&ctx,
        time_points,
        n_points,
        y0,
        state_dim,
        y_out
    );
}
