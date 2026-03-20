import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import ParameterForm from "./ParameterForm.jsx";
import { getMicrobes, getPreset, getSubstrates } from "../../api/client.js";

const defaultState = {
  X0: 1,
  S0: 20,
  P0: 0,
  DO0: 0.005,
  T0: 30,
  t_start: 0,
  t_end: 24,
  n_points: 241,
  mu_max: 0.4,
  Ks: 0.1,
  Yxs: 0.5,
  Ypx: 0.1,
  kd: 0.01,
  Kio: 0.0001,
  Kp: 50,
  maintenance: 0.005,
  Q10: 2.0,
  T_ref: 30,
  Kla: 200,
  C_star: 0.007,
  O2_maintenance: 0.0005,
  delta_H: 4e5,
  Cp: 4180,
  U: 500,
  A: 2,
  rho: 1000,
  volume: 5,
  feed_rate: 0,
  feed_rate_end: 0,
  feed_tau: 2,
  feed_mode: "constant",
  feed_start: 0,
  feed_substrate_conc: 500,
  do_setpoint: 0,
  do_Kp: 0,
  aeration_rate: 1,
  agitation_speed: 300,
  cooling_temp: 25,
  coolant_flow: 1,
  agit_power_coeff: 2.0,
  agit_heat_eff: 0.5,
  microbe_id: "",
  substrate_id: ""
};

function ControlPanel({ onRun }) {
  const [values, setValues] = useState(defaultState);
  const [mode, setMode] = useState("batch");
  const [microbes, setMicrobes] = useState([]);
  const [substrates, setSubstrates] = useState([]);
  const [loadingPreset, setLoadingPreset] = useState(false);

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleSubmit = () => {
    onRun(values, mode);
  };

  const loadMicrobes = async () => {
    try {
      const list = await getMicrobes();
      setMicrobes(list);
      if (list.length > 0) {
        const first = list[0].id;
        handleMicrobeChange(first);
      }
    } catch (err) {
      console.error("Failed to load microbes", err);
    }
  };

  const handleMicrobeChange = async (microbeId) => {
    setValues((prev) => ({ ...prev, microbe_id: microbeId, substrate_id: "" }));
    if (!microbeId) {
      setSubstrates([]);
      return;
    }
    try {
      const subs = await getSubstrates(microbeId);
      setSubstrates(subs);
      if (subs.length > 0) {
        const first = subs[0].id;
        setValues((prev) => ({ ...prev, substrate_id: first }));
      }
    } catch (err) {
      console.error("Failed to load substrates", err);
    }
  };

  const handleSubstrateChange = (substrateId) => {
    setValues((prev) => ({ ...prev, substrate_id: substrateId }));
  };

  const handleLoadPreset = async () => {
    if (!values.microbe_id || !values.substrate_id) return;
    try {
      setLoadingPreset(true);
      const resp = await getPreset(values.microbe_id, values.substrate_id);
      const preset = resp?.preset?.defaults || {};
      setValues((prev) => ({
        ...prev,
        ...preset,
        microbe_id: values.microbe_id,
        substrate_id: values.substrate_id
      }));
    } catch (err) {
      console.error("Failed to load preset", err);
    } finally {
      setLoadingPreset(false);
    }
  };

  useEffect(() => {
    loadMicrobes();
  }, []);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        background:
          "linear-gradient(160deg, rgba(12, 18, 38, 0.95), rgba(12, 20, 46, 0.85))"
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
                Simulation Control
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Configure the run
              </Typography>
            </Box>
            <Chip
              label="Realtime"
              size="small"
              color="secondary"
              sx={{ bgcolor: "rgba(100,255,218,0.12)", border: "1px solid rgba(100,255,218,0.3)" }}
              variant="outlined"
            />
          </Box>

          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                label="Mode"
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
              >
                <MenuItem value="batch">Batch</MenuItem>
                <MenuItem value="fed_batch">Fed-batch</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Microbe</InputLabel>
              <Select
                label="Microbe"
                value={values.microbe_id}
                onChange={(e) => handleMicrobeChange(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {microbes.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }} disabled={!values.microbe_id}>
              <InputLabel>Substrate</InputLabel>
              <Select
                label="Substrate"
                value={values.substrate_id}
                onChange={(e) => handleSubstrateChange(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {substrates.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="medium"
              onClick={handleSubmit}
              sx={{
                px: 2.8,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 10px 30px rgba(77, 217, 247, 0.4)",
                background: "linear-gradient(135deg, #4dd9f7, #64ffda)"
              }}
            >
              Run Simulation
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleLoadPreset}
              disabled={!values.microbe_id || !values.substrate_id || loadingPreset}
              sx={{ borderRadius: 2 }}
            >
              {loadingPreset ? "Loading..." : "Load Preset"}
            </Button>
          </Box>

          <ParameterForm values={values} onChange={handleFieldChange} mode={mode} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ControlPanel;
