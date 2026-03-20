import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Chip
} from "@mui/material";

function AppLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        color: "text.primary",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 70% at 20% 20%, rgba(0, 189, 214, 0.1), transparent), radial-gradient(90% 80% at 80% 10%, rgba(255, 193, 7, 0.08), transparent)"
        }}
      />

      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(7, 12, 25, 0.8)",
          zIndex: 2
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, #7cf3e4, #2dd6ff)"
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Fermentation Studio
          </Typography>
          <Chip
            label="Virtual Fermenter · R&D"
            size="small"
            sx={{
              color: "text.secondary",
              borderColor: "rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)"
            }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
