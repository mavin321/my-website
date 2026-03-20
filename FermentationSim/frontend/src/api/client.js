import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000
});

export async function runSimulation(payload, mode = "batch") {
  const resp = await api.post(`/simulation/run?mode=${mode}`, payload);
  return resp.data;
}

export async function getMetadata() {
  const resp = await api.get("/meta/variables");
  return resp.data;
}

export async function getMicrobes() {
  const resp = await api.get("/presets/microbes");
  return resp.data.microbes;
}

export async function getSubstrates(microbeId) {
  const resp = await api.get(`/presets/microbes/${microbeId}/substrates`);
  return resp.data.substrates;
}

export async function getPreset(microbeId, substrateId) {
  const resp = await api.get(`/presets/microbes/${microbeId}/substrates/${substrateId}`);
  return resp.data;
}

export async function healthCheck() {
  const resp = await api.get("/meta/health");
  return resp.data;
}
