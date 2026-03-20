import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

function VolumeChart({ result }) {
  if (!result || !result.states?.V) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1">Volume Profile</Typography>
          <Typography variant="body2" color="text.secondary">
            Run a fed-batch to see dilution and volume growth.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const data = result.time.map((t, i) => ({
    t,
    V: result.states.V[i]
  }));

  return (
    <Card variant="outlined" sx={{ minHeight: 260 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Volume Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Track feed-driven volume changes.
        </Typography>
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="t" tick={{ fill: "#9fb2d1" }} label={{ value: "Time (h)", position: "insideBottomRight", offset: -5, fill: "#9fb2d1" }} />
              <YAxis tick={{ fill: "#9fb2d1" }} label={{ value: "Volume (L)", angle: -90, position: "insideLeft", fill: "#9fb2d1" }} />
              <Tooltip contentStyle={{ background: "rgba(12,18,38,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="V" stroke="#ab47bc" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default VolumeChart;
