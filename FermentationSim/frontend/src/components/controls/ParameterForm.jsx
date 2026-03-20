import React from "react";
import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

const fieldGroups = [
  {
    title: "Initial & time",
    modes: ["batch", "fed_batch"],
    fields: [
      { name: "X0", label: "Biomass X0 (g/L)", defaultValue: 1 },
      { name: "S0", label: "Substrate S0 (g/L)", defaultValue: 20 },
      { name: "P0", label: "Product P0 (g/L)", defaultValue: 0 },
      { name: "DO0", label: "DO0 (g/L)", defaultValue: 0.005 },
      { name: "T0", label: "Temperature T0 (°C)", defaultValue: 30 },
      { name: "t_end", label: "Duration (h)", defaultValue: 24 },
      { name: "n_points", label: "Time points", defaultValue: 241 },
      { name: "volume", label: "Start volume (L)", defaultValue: 5 }
    ]
  },
  {
    title: "Kinetics & inhibition",
    modes: ["batch", "fed_batch"],
    fields: [
      { name: "mu_max", label: "µmax (1/h)", defaultValue: 0.4 },
      { name: "Ks", label: "Ks (g/L)", defaultValue: 0.1 },
      { name: "Yxs", label: "Yx/s", defaultValue: 0.5 },
      { name: "Ypx", label: "Yp/x", defaultValue: 0.1 },
      { name: "kd", label: "Decay kd (1/h)", defaultValue: 0.01 },
      { name: "Kio", label: "DO inhibition Kio (g/L)", defaultValue: 0.0001 },
      { name: "Kp", label: "Product inhib Kp (g/L)", defaultValue: 50 },
      { name: "maintenance", label: "Maintenance (g/gX/h)", defaultValue: 0.005 },
      { name: "Q10", label: "Q10", defaultValue: 2.0 },
      { name: "T_ref", label: "T_ref (°C)", defaultValue: 30 }
    ]
  },
  {
    title: "O2 & heat transfer",
    modes: ["batch", "fed_batch"],
    fields: [
      { name: "Kla", label: "Base kLa (1/h)", defaultValue: 200 },
      { name: "C_star", label: "DO saturation C*", defaultValue: 0.007 },
      { name: "O2_maintenance", label: "OUR maint (g/gX/h)", defaultValue: 0.0005 },
      { name: "delta_H", label: "Heat yield ΔH (J/gX)", defaultValue: 4e5 },
      { name: "Cp", label: "Cp (J/kg·K)", defaultValue: 4180 },
      { name: "U", label: "UA coeff (W/K)", defaultValue: 500 },
      { name: "A", label: "Area (m²)", defaultValue: 2 },
      { name: "rho", label: "Density (kg/m³)", defaultValue: 1000 },
      { name: "agit_power_coeff", label: "Agit power coeff", defaultValue: 2.0 },
      { name: "agit_heat_eff", label: "Agit heat eff (0-1)", defaultValue: 0.5 }
    ]
  },
  {
    title: "Feed strategy",
    modes: ["fed_batch"],
    fields: [
      { name: "feed_rate", label: "Feed rate start (L/h)", defaultValue: 0 },
      { name: "feed_rate_end", label: "Feed rate end (L/h)", defaultValue: 0 },
      { name: "feed_tau", label: "Feed tau (h)", defaultValue: 2 },
      { name: "feed_start", label: "Feed start (h)", defaultValue: 0 },
      { name: "feed_substrate_conc", label: "Feed substrate (g/L)", defaultValue: 500 },
      { name: "do_setpoint", label: "DO setpoint (g/L)", defaultValue: 0 },
      { name: "do_Kp", label: "DO Kp", defaultValue: 0 }
    ]
  },
  {
    title: "Aeration & cooling",
    modes: ["batch", "fed_batch"],
    fields: [
      { name: "aeration_rate", label: "Aeration (vvm)", defaultValue: 1 },
      { name: "agitation_speed", label: "Agitation (rpm)", defaultValue: 300 },
      { name: "cooling_temp", label: "Cooling temp (°C)", defaultValue: 25 },
      { name: "coolant_flow", label: "Coolant flow", defaultValue: 1 }
    ]
  }
];

function ParameterForm({ values, onChange, mode }) {
  const handleChange = (name) => (event) => {
    const val = parseFloat(event.target.value);
    onChange(name, Number.isNaN(val) ? "" : val);
  };

  const handleSelectChange = (name) => (event) => {
    onChange(name, event.target.value);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          Process Parameters
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Guardrails for batch physics and biology
        </Typography>
      </Box>
      {fieldGroups
        .filter((g) => !g.modes || g.modes.includes(mode))
        .map((group) => (
        <Box key={group.title} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            {group.title}
          </Typography>
          <Grid container spacing={1}>
            {group.fields.map((f) => (
              <Grid item xs={6} md={4} key={f.name}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={f.label}
                  value={values[f.name] ?? f.defaultValue}
                  onChange={handleChange(f.name)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.08)"
                      },
                      "&:hover fieldset": {
                        borderColor: "#4dd9f7"
                      }
                    }
                  }}
                />
              </Grid>
            ))}
            {group.title === "Feed strategy" && (
              <Grid item xs={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Feed mode"
                  value={values.feed_mode ?? "constant"}
                  onChange={handleSelectChange("feed_mode")}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderRadius: 2,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                      "&:hover fieldset": { borderColor: "#4dd9f7" }
                    }
                  }}
                >
                  <MenuItem value="constant">Constant</MenuItem>
                  <MenuItem value="ramp">Ramp</MenuItem>
                  <MenuItem value="exponential">Exponential</MenuItem>
                  <MenuItem value="do_control">DO control</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}
    </>
  );
}

export default ParameterForm;
