import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { Box, Card, CardContent, Typography } from "@mui/material";

function TimeSeriesCharts({ result }) {
  if (!result) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 1
          }}
        >
          <Typography variant="subtitle1">Time Series</Typography>
          <Typography variant="body2" color="text.secondary">
            Run a simulation to see growth, substrate, DO, and thermal trends.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { time, states } = result;
  const data = time.map((t, i) => ({
    t,
    X: states.X[i],
    S: states.S[i],
    P: states.P[i],
    DO: states.DO[i],
    T: states.T[i],
    V: states.V ? states.V[i] : null
  }));

  return (
    <Card variant="outlined" sx={{ flex: 1 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Time Series
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Monitor parallel signals and spot deviations quickly.
        </Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="t"
                tick={{ fill: "#9fb2d1" }}
                label={{ value: "Time (h)", position: "insideBottomRight", offset: -5, fill: "#9fb2d1" }}
              />
              <YAxis
                yAxisId={0}
                tick={{ fill: "#9fb2d1" }}
                label={{ value: "Concentration (g/L)", angle: -90, position: "insideLeft", fill: "#9fb2d1" }}
              />
              <YAxis
                yAxisId={1}
                orientation="right"
                tick={{ fill: "#9fb2d1" }}
                label={{ value: "Temperature (°C)", angle: 90, position: "insideRight", fill: "#9fb2d1" }}
              />
              {states.V && (
                <YAxis
                  yAxisId={2}
                  orientation="right"
                  tick={{ fill: "#9fb2d1" }}
                  label={{ value: "Volume (L)", angle: 90, position: "outsideRight", fill: "#9fb2d1" }}
                />
              )}
              <Tooltip
                contentStyle={{
                  background: "rgba(12,18,38,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="X" stroke="#64ffda" dot={false} strokeWidth={2} yAxisId={0} />
              <Line type="monotone" dataKey="S" stroke="#ffeb3b" dot={false} strokeWidth={2} yAxisId={0} />
              <Line type="monotone" dataKey="P" stroke="#ff9800" dot={false} strokeWidth={2} yAxisId={0} />
              <Line type="monotone" dataKey="DO" stroke="#29b6f6" dot={false} strokeWidth={2} yAxisId={0} />
              <Line type="monotone" dataKey="T" stroke="#ef5350" dot={false} strokeWidth={2} yAxisId={1} />
              {states.V && (
                <Line type="monotone" dataKey="V" stroke="#ab47bc" dot={false} strokeWidth={2} yAxisId={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TimeSeriesCharts;
