# FermenterX

FermenterX is a virtual fermentation workbench for batch and fed-batch processes. It combines a C-based ODE core, a FastAPI backend, and a React/Vite frontend. Users can pick microbes/substrates from presets, auto-fill realistic kinetics and thermal parameters, and still override anything in “expert mode.” Accuracy today is an “educated simulator” (not a calibrated digital twin) but is structured for future model calibration.

## Architecture

- **C core (`c_core/`)**: RK4 integrator with a 6-state model (X, S, P, DO, T, V) supporting feed/dilution, product inhibition, temperature factor (Q10), maintenance, dynamic kLa correlation, and heat balance with agitator power.
- **Backend (`backend/`)**: FastAPI service that wraps the C library and includes a Python RK4 fallback. `SimulationRequest` is Pydantic-based and accepts microbe/substrate selectors plus kinetic/thermal/operating parameters. Preset merging respects user overrides.
- **Frontend (`frontend/`)**: React + Vite + MUI + Recharts dashboard with control panel, microbe/substrate presets, parameter form, time-series plots, and volume chart. Users can load presets, tweak parameters, and run batch/fed-batch simulations.

## Features

- Batch and fed-batch modes with feed strategies (constant/ramp/exponential/DO control).
- Microbe/substrate presets with realistic defaults for kinetics, mass transfer, and thermal parameters.
- Dynamic volume, dilution, product inhibition, temperature effect (Q10), maintenance demand, and agitation heat input.
- API endpoints to list microbes, substrates, and fetch presets; simulation endpoint accepts preset selectors and overrides.
- Frontend preset loader plus manual override (“expert mode”).

## Getting started

### Prerequisites
- Python 3.12+ (uses `fermenv` virtualenv in repo)
- Node 18+
- GCC/Make for the C core

### Build the C core
```bash
cd c_core
make  # produces libfermentation.so
```

### Backend (FastAPI)
```bash
cd backend/src
uvicorn fermentation_sim.api.main:app --reload
```

Key endpoints:
- `POST /simulation/run?mode=batch|fed_batch` — body: `SimulationRequest`
- `GET /presets/microbes`
- `GET /presets/microbes/{microbe_id}/substrates`
- `GET /presets/microbes/{microbe_id}/substrates/{substrate_id}` — returns flattened defaults and sections
- `GET /meta/health`, `GET /meta/variables`

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Use the control panel to pick microbe/substrate, load preset, and run simulations. All fields remain editable.

## Microbe/substrate presets
- Defined in `backend/src/fermentation_sim/data/microbe_database.py` as an in-memory “database” with many organism/substrate pairs (E. coli, S. cerevisiae, B. subtilis, Pichia pastoris, Lactococcus lactis, Clostridium acetobutylicum, Aspergillus niger, etc.).
- Each preset contains:
  - `default_initials`: X0, S0, P0, DO0, T0
  - `kinetics`: mu_max, Ks, Yxs, Ypx, kd, Kio, Kp, maintenance, O2_maintenance
  - `thermal`: delta_H, Cp, U, A, rho
  - `mass_transfer`: Kla, C_star
- The backend merges presets into `SimulationRequest`, filling missing fields; any user-specified fields override presets.

## Tests
- Backend: `./fermenv/bin/pytest backend/tests -q`
  - Covers batch/fed-batch model shapes and preset merging.
- Frontend: `cd frontend && npm test -- --watch=false` (requires writable env for Vitest cache).

## Accuracy and calibration
- Current fidelity is ~3–4/10 without calibration. Structure supports future calibration per microbe/substrate/reactor. To increase accuracy:
  - Fit µmax, Ks, Yxs, Ypx, Kp, maintenance, Q10, kLa base/correlation, UA/heat inputs to lab data.
  - Add regression tests against experimental datasets.

## Repository layout
- `c_core/` — C ODE model, RK4 integrator, makefile
- `backend/` — FastAPI app, models, services, presets data
- `frontend/` — React dashboard, control panel, charts
- `requirements.txt` — backend deps
- `pyproject.toml` — Python project metadata

## Notes
- Default C core is used when feasible; Python fallback handles edge cases.
- Frontend assumes backend available at `/api` (proxy/serve accordingly).
- You can extend presets or swap the in-memory store for a database without changing the merging contract.

![alt text](<Screenshot 2025-11-29 172649.png>)