(function () {
  const form = document.getElementById("simulation-form");
  const primaryChart = document.getElementById("primary-chart");
  const secondaryChart = document.getElementById("secondary-chart");
  const microbeSelect = document.getElementById("microbe_id");
  const substrateSelect = document.getElementById("substrate_id");
  const presetNote = document.getElementById("preset-note");

  if (!form || !primaryChart || !secondaryChart || !microbeSelect || !substrateSelect) {
    return;
  }

  const metrics = {
    biomass: document.getElementById("metric-biomass"),
    product: document.getElementById("metric-product"),
    substrate: document.getElementById("metric-substrate"),
    volume: document.getElementById("metric-volume"),
  };

  const insight = document.getElementById("simulation-insight");
  const api = {
    microbes: "/api/simulation/microbes/",
    run: "/api/simulation/run/",
  };

  const fieldMap = {
    X0: "x0",
    S0: "s0",
    DO0: "do0",
    T0: "t0",
    mu_max: "mu_max",
    Ks: "ks",
    Yxs: "yxs",
    Ypx: "ypx",
    feed_rate: "feed_rate",
    feed_start: "feed_start",
    volume: "volume",
    agitation_speed: "agitation_speed",
    feed_mode: "feed_mode",
    t_end: "t_end",
  };

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Request failed");
    }
    return data;
  }

  function setFieldValue(name, value) {
    const field = form.elements.namedItem(name);
    if (field && value !== undefined && value !== null) {
      field.value = value;
    }
  }

  function applyPresetDefaults(defaults) {
    Object.entries(fieldMap).forEach(([apiKey, fieldName]) => {
      if (Object.prototype.hasOwnProperty.call(defaults, apiKey)) {
        setFieldValue(fieldName, defaults[apiKey]);
      }
    });
  }

  function getPayload() {
    const tEnd = Math.max(Number(form.t_end.value) || 24, 0.1);
    const x0 = Math.max(Number(form.x0.value) || 0.5, 0.01);
    const s0 = Math.max(Number(form.s0.value) || 20, 0.01);
    const do0 = Math.max(Number(form.do0.value) || 0.005, 0.0001);
    const t0 = Math.max(Number(form.t0.value) || 30, 0.1);
    const muMax = Math.max(Number(form.mu_max.value) || 0.4, 0.0001);
    const ks = Math.max(Number(form.ks.value) || 0.1, 0.0001);
    const yxs = Math.max(Number(form.yxs.value) || 0.5, 0.0001);
    const ypx = Math.max(Number(form.ypx.value) || 0.1, 0);
    const feedRate = Math.max(Number(form.feed_rate.value) || 0, 0);
    const feedStart = Math.max(Number(form.feed_start.value) || 0, 0);
    const volume = Math.max(Number(form.volume.value) || 5, 0.1);
    const agitationSpeed = Math.max(Number(form.agitation_speed.value) || 300, 1);

    return {
      mode: form.mode.value,
      microbe_id: microbeSelect.value,
      substrate_id: substrateSelect.value,
      t_end: tEnd,
      X0: x0,
      S0: s0,
      P0: 0,
      DO0: do0,
      T0: t0,
      mu_max: muMax,
      Ks: ks,
      Yxs: yxs,
      Ypx: ypx,
      feed_rate: feedRate,
      feed_start: feedStart,
      volume: volume,
      agitation_speed: agitationSpeed,
      feed_mode: form.feed_mode.value,
      n_points: 241,
    };
  }

  function buildChart(svg, seriesList) {
    const width = 720;
    const height = 320;
    const padding = { top: 20, right: 18, bottom: 30, left: 44 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const allValues = seriesList.flatMap((series) => series.values);
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);
    const range = Math.max(maxValue - minValue, 1);
    const pointCount = Math.max(seriesList[0].values.length - 1, 1);

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const y = padding.top + innerHeight * ratio;
        return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid-line" />`;
      })
      .join("");

    const axis = `
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" class="chart-axis" />
      <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-axis" />
    `;

    const labels = `
      <text x="${padding.left}" y="${height - 8}" class="chart-label">0 h</text>
      <text x="${width - padding.right - 28}" y="${height - 8}" class="chart-label">end</text>
      <text x="12" y="${padding.top + 2}" class="chart-label">${maxValue.toFixed(1)}</text>
      <text x="12" y="${height - padding.bottom}" class="chart-label">${minValue.toFixed(1)}</text>
    `;

    const paths = seriesList
      .map((series) => {
        const points = series.values
          .map((value, index) => {
            const x = padding.left + (index / pointCount) * innerWidth;
            const y =
              padding.top + innerHeight - ((value - minValue) / range) * innerHeight;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ");

        return `<polyline points="${points}" fill="none" stroke="${series.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
      })
      .join("");

    svg.innerHTML = `<rect x="0" y="0" width="${width}" height="${height}" rx="24" class="chart-bg" />${gridLines}${axis}${labels}${paths}`;
  }

  function updateMetrics(result, payload) {
    const lastIndex = result.time.length - 1;
    metrics.biomass.textContent = `${result.states.X[lastIndex].toFixed(2)} g/L`;
    metrics.product.textContent = `${result.states.P[lastIndex].toFixed(2)} g/L`;
    metrics.substrate.textContent = `${Math.max(payload.S0 - result.states.S[lastIndex], 0).toFixed(2)} g/L`;
    metrics.volume.textContent = `${Math.max(...result.states.V).toFixed(2)} L`;

    const peakBiomass = Math.max(...result.states.X);
    const minDO = Math.min(...result.states.DO);
    const request = result.meta.request;
    const label = [payload.microbe_id, payload.substrate_id].filter(Boolean).join(" / ");
    insight.textContent = `${label} ran in ${result.meta.mode} mode for ${request.t_end.toFixed(1)} h. Peak biomass reached ${peakBiomass.toFixed(2)} g/L and dissolved oxygen dropped to ${minDO.toFixed(4)} g/L.`;
  }

  async function loadSubstrates() {
    const data = await fetchJson(`/api/simulation/microbes/${encodeURIComponent(microbeSelect.value)}/substrates/`);
    substrateSelect.innerHTML = data.substrates
      .map((item) => `<option value="${item.id}">${item.label}</option>`)
      .join("");
  }

  async function loadPreset() {
    presetNote.textContent = "Loading preset details...";
    const data = await fetchJson(
      `/api/simulation/microbes/${encodeURIComponent(microbeSelect.value)}/substrates/${encodeURIComponent(substrateSelect.value)}/`
    );
    applyPresetDefaults(data.defaults);
    presetNote.textContent = data.label;
  }

  async function runSimulation() {
    const payload = getPayload();
    const result = await fetchJson(`${api.run}?mode=${encodeURIComponent(payload.mode)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    buildChart(primaryChart, [
      { values: result.states.X, color: "#22d3ee" },
      { values: result.states.S, color: "#fb923c" },
      { values: result.states.P, color: "#4ade80" },
    ]);

    buildChart(secondaryChart, [
      { values: result.states.DO, color: "#60a5fa" },
      { values: result.states.T, color: "#f472b6" },
      { values: result.states.V, color: "#facc15" },
    ]);

    updateMetrics(result, payload);
  }

  async function initialize() {
    const data = await fetchJson(api.microbes);
    microbeSelect.innerHTML = data.microbes
      .map((item) => `<option value="${item.id}">${item.label}</option>`)
      .join("");
    await loadSubstrates();
    await loadPreset();
    await runSimulation();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      presetNote.textContent = "Running simulation...";
      await runSimulation();
      presetNote.textContent = "Simulation completed with the real FermentationSim backend.";
    } catch (error) {
      presetNote.textContent = error.message;
      insight.textContent = error.message;
    }
  });

  microbeSelect.addEventListener("change", async function () {
    try {
      await loadSubstrates();
      await loadPreset();
      await runSimulation();
    } catch (error) {
      presetNote.textContent = error.message;
    }
  });

  substrateSelect.addEventListener("change", async function () {
    try {
      await loadPreset();
      await runSimulation();
    } catch (error) {
      presetNote.textContent = error.message;
    }
  });

  initialize().catch(function (error) {
    presetNote.textContent = error.message;
    insight.textContent = error.message;
  });
})();
