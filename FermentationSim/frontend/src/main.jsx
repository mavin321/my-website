import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App.jsx";
import "./styles/global.css";

const theme = createTheme({
  shape: { borderRadius: 16 },
  palette: {
    mode: "dark",
    primary: { main: "#4dd9f7" },
    secondary: { main: "#64ffda" },
    background: {
      default: "transparent",
      paper: "rgba(12, 18, 38, 0.86)"
    },
    text: {
      primary: "#e7edff",
      secondary: "#9fb2d1"
    },
    divider: "rgba(255,255,255,0.08)"
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600 },
    body2: { color: "#9fb2d1" }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
          backdropFilter: "blur(14px)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: 0.2
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
