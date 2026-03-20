import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Slider,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import ControlPanel from "../components/controls/ControlPanel.jsx";
import TimeSeriesCharts from "../components/visualization/TimeSeriesCharts.jsx";
import FermenterAnimation from "../components/visualization/FermenterAnimation.jsx";
import VolumeChart from "../components/visualization/VolumeChart.jsx";
import { useSimulation } from "../hooks/useSimulation.js";

const Pill = ({ label, value, accent }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      borderRadius: 2,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 700, color: accent || "inherit" }}>
      {value}
    </Typography>
  </Box>
);

function Dashboard() {
  const { loading, error, result, simulate } = useSimulation();
  const [frameIndex, setFrameIndex] = useState(0);

  const handleRun = async (payload, mode) => {
    const res = await simulate(payload, mode);
    setFrameIndex(0);
    return res;
  };

  useEffect(() => {
    if (!result) return;
    // simple animation: increase frameIndex over time
    const id = setInterval(() => {
      setFrameIndex((prev) => {
        const max = result.time.length - 1;
        return prev >= max ? max : prev + 1;
      });
    }, 200);
    return () => clearInterval(id);
  }, [result]);

  const latest = useMemo(() => {
    if (!result) return null;
    const last = Math.max(result.time.length - 1, 0);
    return {
      horizon: result.time[last],
      resolution: `${result.time.length} pts`,
      X: result.states.X[last],
      S: result.states.S[last],
      P: result.states.P[last],
      DO: result.states.DO[last],
      T: result.states.T[last]
    };
  }, [result]);

  const statusLabel = loading ? "Running simulation" : result ? "Latest run ready" : "Awaiting parameters";
  const accentColor = loading ? "#ffd54f" : "#64ffda";

  return (
    <Stack spacing={3}>
      <Card
        variant="outlined"
        sx={{
          background:
            "linear-gradient(120deg, rgba(77, 217, 247, 0.2), rgba(100, 255, 218, 0.08) 55%, rgba(6,9,18,0.9) 100%)"
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1.5} justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 30%, #7cf3e4, #2dd6ff)",
                    boxShadow: "0 10px 30px rgba(77, 217, 247, 0.35)"
                  }}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Digital Fermentation Studio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tune parameters, replay the batch, and track the biology with an R&D-grade cockpit.
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={statusLabel}
                color="secondary"
                variant="outlined"
                sx={{
                  borderColor: accentColor,
                  color: accentColor,
                  fontWeight: 600,
                  background: "rgba(100,255,218,0.08)"
                }}
              />
            </Box>

            <Grid container spacing={1.5}>
              <Grid item xs={6} md={3}>
                <Pill label="Time horizon" value={latest ? `${latest.horizon.toFixed(1)} h` : "—"} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Pill label="Resolution" value={latest ? latest.resolution : "—"} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Pill
                  label="Final biomass"
                  value={latest ? `${latest.X.toFixed(2)} g/L` : "—"}
                  accent="#64ffda"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Pill
                  label="Temperature"
                  value={latest ? `${latest.T.toFixed(1)} °C` : "—"}
                  accent="#ffb74d"
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <ControlPanel onRun={handleRun} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <FermenterAnimation result={result} frameIndex={frameIndex} />
            {result && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Playback
                  </Typography>
                  <Slider
                    size="medium"
                    sx={{
                      mt: 1,
                      "& .MuiSlider-thumb": {
                        boxShadow: "0 4px 14px rgba(100,255,218,0.35)"
                      }
                    }}
                    min={0}
                    max={result.time.length - 1}
                    value={frameIndex}
                    onChange={(_, value) => setFrameIndex(value)}
                  />
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <TimeSeriesCharts result={result} />
            <VolumeChart result={result} />
          </Stack>
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000}>
        <Alert severity="error" variant="filled">
          {String(error)}
        </Alert>
      </Snackbar>

      {loading && (
        <Snackbar open={true}>
          <Alert severity="info" variant="filled">
            Running simulation...
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default Dashboard;
