import React, { useMemo } from "react";
import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Props:
 *   result: simulation result
 *   frameIndex: index in the time array to visualize
 */
function FermenterAnimation({ result, frameIndex }) {
  if (!result) return null;

  const { states } = result;
  const idx = Math.min(frameIndex, states.X.length - 1);

  const X = states.X[idx];
  const DO = states.DO[idx];
  const T = states.T[idx];

  const { fillHeight, bubbleCount, liquidColor, glow, oxygenLevel, tempLevel, growthLevel } = useMemo(() => {
    const maxX = Math.max(...states.X);
    const maxDO = Math.max(...states.DO);
    const maxT = Math.max(...states.T);

    const fillHeight = 30 + (X / (maxX || 1)) * 60; // 30–90%
    const bubbleCount = 5 + Math.round((DO / (maxDO || 1)) * 20);
    const liquidColor = DO < 0.001 ? "#ff7043" : "#26c6da";
    const glow = T > 35 ? "0 0 20px rgba(255, 82, 82, 0.8)" : "0 0 10px rgba(38, 198, 218, 0.7)";

    return {
      fillHeight,
      bubbleCount,
      liquidColor,
      glow,
      oxygenLevel: Math.min((DO / (maxDO || 1)) * 100, 100),
      tempLevel: Math.min((T / (maxT || 1)) * 100, 120),
      growthLevel: Math.min((X / (maxX || 1)) * 100, 120)
    };
  }, [states.X, states.DO, states.T, frameIndex]);

  const bubbles = Array.from({ length: bubbleCount });

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        background: "linear-gradient(180deg, rgba(18, 28, 54, 0.9), rgba(10, 17, 34, 0.95))",
        borderColor: "rgba(255,255,255,0.08)"
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Virtual Fermenter
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Live bioreactor snapshot
              </Typography>
            </Box>
            <Chip
              label="Realtime rendering"
              size="small"
              sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.secondary" }}
              variant="outlined"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              alignItems: "center"
            }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{
                position: "relative",
                width: "100%",
                height: 280,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.12)",
                overflow: "hidden",
                background: "linear-gradient(180deg, #0e172f 0%, #0a1225 80%)",
                boxShadow: glow,
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.45))"
              }}
            >
            {/* Liquid phase */}
            <motion.div
              animate={{ height: `${fillHeight}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                background: `linear-gradient(to top, ${liquidColor}, #4dd0e1)`,
                borderTop: "1px solid rgba(255,255,255,0.2)"
              }}
            />

            {/* Bubbles */}
            {bubbles.map((_, i) => {
              const delay = (i % 5) * 0.3;
              const left = 30 + (i % 5) * 25;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -60] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    delay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    bottom: 40,
                    left,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "1px solid #e0f7fa",
                    background: "rgba(224,247,250,0.2)"
                  }}
                />
              );
            })}

            {/* Impeller */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transformOrigin: "center",
                width: 40,
                height: 40,
                marginLeft: -20,
                borderRadius: "50%",
                border: "2px solid #b0bec5"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 30,
                  height: 2,
                  background: "#b0bec5",
                  transform: "translate(-50%, -50%)"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 2,
                  height: 30,
                  background: "#b0bec5",
                  transform: "translate(-50%, -50%)"
                }}
              />
            </motion.div>
          </Box>

            {/* Numeric indicators */}
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  Snapshot
                </Typography>
                <Typography variant="body2">
                  {result.time[idx].toFixed(2)} h
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Cell density
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#64ffda" }}>
                  {X.toFixed(2)} g/L
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    mt: 0.5
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: `${growthLevel}%`,
                      background: "linear-gradient(90deg, #4dd9f7, #64ffda)",
                      boxShadow: "0 6px 16px rgba(77,217,247,0.25)"
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Dissolved oxygen
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7acbff" }}>
                  {DO.toExponential(2)} g/L
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    mt: 0.5
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: `${oxygenLevel}%`,
                      background: "linear-gradient(90deg, #26c6da, #00acc1)"
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Jacket temperature
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffb74d" }}>
                  {T.toFixed(2)} °C
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    mt: 0.5
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: `${tempLevel}%`,
                      background: "linear-gradient(90deg, #ffb74d, #ff8f00)"
                    }}
                  />
                </Box>
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} mt={1}>
                <Box
                  sx={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Substrate
                  </Typography>
                  <Typography variant="body2">{states.S[idx].toFixed(2)} g/L</Typography>
                </Box>
                <Box
                  sx={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Product
                  </Typography>
                  <Typography variant="body2">{states.P[idx].toFixed(2)} g/L</Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default FermenterAnimation;
