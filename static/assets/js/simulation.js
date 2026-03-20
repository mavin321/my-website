(function () {
  const form = document.getElementById("simulation-form");
  const primaryChart = document.getElementById("primary-chart");
  const secondaryChart = document.getElementById("secondary-chart");
  const microbeSelect = document.getElementById("microbe_id");
  const substrateSelect = document.getElementById("substrate_id");
  const presetNote = document.getElementById("preset-note");
  const reactorForm = document.getElementById("reactor-form");
  const reactorPrimaryChart = document.getElementById("reactor-primary-chart");
  const reactorSecondaryChart = document.getElementById("reactor-secondary-chart");
  const reactorNote = document.getElementById("reactor-note");
  const reactorInsight = document.getElementById("reactor-insight");
  const reactorPreset = document.getElementById("reactor_preset");
  const reactorRunButton = document.getElementById("reactor-run-btn");
  const separationForm = document.getElementById("separation-form");
  const separationPreset = document.getElementById("separation_preset");
  const separationRunButton = document.getElementById("separation-run-btn");
  const separationNote = document.getElementById("separation-note");
  const separationInsight = document.getElementById("separation-insight");
  const separationPrimaryChart = document.getElementById("separation-primary-chart");
  const separationSecondaryChart = document.getElementById("separation-secondary-chart");
  const orbitalForm = document.getElementById("orbital-form");
  const orbitalRunButton = document.getElementById("orbital-run-btn");
  const orbitalNote = document.getElementById("orbital-note");
  const orbitalInsight = document.getElementById("orbital-insight");
  const orbitalXYPlot = document.getElementById("orbital-xy-plot");
  const orbitalXZPlot = document.getElementById("orbital-xz-plot");
  const orbitalCanvas = document.getElementById("orbital-3d-canvas");

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
  const reactorMetrics = {
    peakTemp: document.getElementById("reactor-metric-peak-temp"),
    conversion: document.getElementById("reactor-metric-conversion"),
    heatRelease: document.getElementById("reactor-metric-heat-release"),
    margin: document.getElementById("reactor-metric-margin"),
  };
  const separationMetrics = {
    topPurity: document.getElementById("sep-metric-top-purity"),
    bottomImpurity: document.getElementById("sep-metric-bottom-impurity"),
    energy: document.getElementById("sep-metric-energy"),
    index: document.getElementById("sep-metric-index"),
  };
  const orbitalMetrics = {
    meanRadius: document.getElementById("orbital-metric-mean-radius"),
    maxRadius: document.getElementById("orbital-metric-max-radius"),
    meanIntensity: document.getElementById("orbital-metric-mean-intensity"),
    label: document.getElementById("orbital-metric-label"),
  };
  const orbital3DState = {
    animationId: null,
    points: [],
    radialMax: 1,
    angleX: 0.55,
    angleY: 0,
  };
  const api = {
    microbes: "/api/simulation/microbes/",
    run: "/api/simulation/run/",
    reactorRun: "/api/reactor/run/",
    separationRun: "/api/separation/run/",
    orbitalRun: "/api/atomic-orbital/run/",
  };
  const reactorPresets = {
    stable: {
      reactor_time: 60,
      reactor_points: 240,
      reactor_ca0: 2.4,
      reactor_t0: 335,
      reactor_tc0: 300,
      reactor_flow: 0.08,
      reactor_k0: 7200000,
      reactor_ea: 68000,
      reactor_delta_h: -85000,
      reactor_ua: 180,
      reactor_cp: 4200,
      reactor_coolant_gain: 0.03,
      reactor_feed_temp: 330,
    },
    intensified: {
      reactor_time: 75,
      reactor_points: 300,
      reactor_ca0: 2.8,
      reactor_t0: 342,
      reactor_tc0: 303,
      reactor_flow: 0.055,
      reactor_k0: 9200000,
      reactor_ea: 70000,
      reactor_delta_h: -93000,
      reactor_ua: 165,
      reactor_cp: 4050,
      reactor_coolant_gain: 0.026,
      reactor_feed_temp: 334,
    },
    runaway: {
      reactor_time: 40,
      reactor_points: 240,
      reactor_ca0: 3.1,
      reactor_t0: 356,
      reactor_tc0: 308,
      reactor_flow: 0.025,
      reactor_k0: 14000000,
      reactor_ea: 73500,
      reactor_delta_h: -110000,
      reactor_ua: 118,
      reactor_cp: 3920,
      reactor_coolant_gain: 0.018,
      reactor_feed_temp: 340,
    },
  };
  const separationPresets = {
    purification: {
      sep_horizon: 90,
      sep_points: 300,
      sep_feed_flow: 100,
      sep_feed_z: 0.55,
      sep_reflux: 2.4,
      sep_boilup: 1.7,
      sep_efficiency: 0.72,
      sep_alpha: 2.2,
      sep_feed_temp: 360,
      sep_condenser_temp: 305,
      sep_steam_temp: 420,
      sep_top_x: 0.92,
      sep_bottom_x: 0.12,
      sep_top_temp: 338,
      sep_bottom_temp: 392,
    },
    energy_saver: {
      sep_horizon: 100,
      sep_points: 320,
      sep_feed_flow: 90,
      sep_feed_z: 0.5,
      sep_reflux: 1.8,
      sep_boilup: 1.4,
      sep_efficiency: 0.69,
      sep_alpha: 2.05,
      sep_feed_temp: 354,
      sep_condenser_temp: 303,
      sep_steam_temp: 410,
      sep_top_x: 0.89,
      sep_bottom_x: 0.15,
      sep_top_temp: 336,
      sep_bottom_temp: 386,
    },
    throughput: {
      sep_horizon: 70,
      sep_points: 280,
      sep_feed_flow: 125,
      sep_feed_z: 0.6,
      sep_reflux: 2.7,
      sep_boilup: 1.9,
      sep_efficiency: 0.75,
      sep_alpha: 2.3,
      sep_feed_temp: 366,
      sep_condenser_temp: 307,
      sep_steam_temp: 426,
      sep_top_x: 0.94,
      sep_bottom_x: 0.14,
      sep_top_temp: 340,
      sep_bottom_temp: 398,
    },
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

  function applyReactorPreset(name) {
    const preset = reactorPresets[name];
    if (!reactorForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = reactorForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    reactorNote.textContent = `${reactorPreset.options[reactorPreset.selectedIndex].text} loaded.`;
  }

  function getReactorPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = reactorForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };

    return {
      horizon: Math.max(getNumber("reactor_time", 60) || 60, 1),
      n_points: Math.max(getNumber("reactor_points", 240) || 240, 20),
      ca0: Math.max(getNumber("reactor_ca0", 2.4) || 2.4, 0.01),
      t0: Math.max(getNumber("reactor_t0", 335) || 335, 250),
      tc0: Math.max(getNumber("reactor_tc0", 300) || 300, 240),
      ca_feed: Math.max(getNumber("reactor_ca0", 2.4) || 2.4, 0.01),
      flow_rate: Math.max(getNumber("reactor_flow", 0.08) || 0.08, 0),
      pre_exponential: Math.max(getNumber("reactor_k0", 7200000) || 7200000, 1),
      activation_energy: Math.max(getNumber("reactor_ea", 68000) || 68000, 1),
      delta_h: Math.min(getNumber("reactor_delta_h", -85000) || -85000, -1),
      rho_cp: Math.max(getNumber("reactor_cp", 4200) || 4200, 1),
      ua: Math.max(getNumber("reactor_ua", 180) || 180, 0.1),
      coolant_gain: Math.max(getNumber("reactor_coolant_gain", 0.03) || 0.03, 0),
      feed_temp: Math.max(getNumber("reactor_feed_temp", 330) || 330, 250),
      coolant_inlet_temp: Math.max(getNumber("reactor_tc0", 300) || 300, 240),
      ambient_temp: 298,
      ambient_ua: 10,
      reactor_volume: 1,
      jacket_tau: 6,
      order_a: 1,
      catalyst_factor: 1,
      product_decay: 0.01,
      safety_limit_temp: 450,
    };
  }

  function updateReactorResults(result, params) {
    const peakTemp = result.summary.peak_temp;
    const finalConversion = result.summary.final_conversion * 100;
    const maxHeatRelease = result.summary.peak_heat_release / 1000;
    const maxCoolantGap = Math.max(
      ...result.states.T.map((value, index) => value - result.states.Tc[index])
    );
    const safetyMargin = result.summary.safety_margin;

    reactorMetrics.peakTemp.textContent = `${peakTemp.toFixed(1)} K`;
    reactorMetrics.conversion.textContent = `${finalConversion.toFixed(1)} %`;
    reactorMetrics.heatRelease.textContent = `${maxHeatRelease.toFixed(2)} kW`;
    reactorMetrics.margin.textContent = `${safetyMargin.toFixed(1)} K`;

    const riskText =
      safetyMargin < 20
        ? "Runaway risk is severe and cooling authority is nearly exhausted."
        : safetyMargin < 60
          ? "Thermal headroom is narrow, so heat-removal tuning matters."
          : "Cooling capacity remains comfortably ahead of runaway onset.";

    reactorInsight.textContent =
      `The reactor peaks at ${peakTemp.toFixed(1)} K with a maximum reactor-to-coolant gap of ${maxCoolantGap.toFixed(1)} K. ` +
      `Final conversion reaches ${finalConversion.toFixed(1)}% over ${params.horizon.toFixed(0)} minutes. ${riskText}`;
  }

  function applySeparationPreset(name) {
    const preset = separationPresets[name];
    if (!separationForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = separationForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    separationNote.textContent = `${separationPreset.options[separationPreset.selectedIndex].text} loaded.`;
  }

  function getSeparationPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = separationForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };

    return {
      horizon: Math.max(getNumber("sep_horizon", 90) || 90, 1),
      n_points: Math.max(getNumber("sep_points", 300) || 300, 20),
      feed_flow: Math.max(getNumber("sep_feed_flow", 100) || 100, 0.1),
      feed_z_light: Math.min(Math.max(getNumber("sep_feed_z", 0.55) || 0.55, 0.01), 0.99),
      reflux_ratio: Math.max(getNumber("sep_reflux", 2.4) || 2.4, 0.1),
      boilup_ratio: Math.max(getNumber("sep_boilup", 1.7) || 1.7, 0.1),
      tray_efficiency: Math.min(Math.max(getNumber("sep_efficiency", 0.72) || 0.72, 0.1), 0.99),
      relative_volatility_ref: Math.max(getNumber("sep_alpha", 2.2) || 2.2, 1.01),
      feed_temp: Math.max(getNumber("sep_feed_temp", 360) || 360, 250),
      condenser_temp: Math.max(getNumber("sep_condenser_temp", 305) || 305, 200),
      steam_temp: Math.max(getNumber("sep_steam_temp", 420) || 420, 250),
      top_x_light: Math.min(Math.max(getNumber("sep_top_x", 0.92) || 0.92, 0.01), 0.99),
      bottom_x_light: Math.min(Math.max(getNumber("sep_bottom_x", 0.12) || 0.12, 0.01), 0.99),
      top_temp: Math.max(getNumber("sep_top_temp", 338) || 338, 250),
      bottom_temp: Math.max(getNumber("sep_bottom_temp", 392) || 392, 250),
      feed_pressure: 1.8,
      alpha_temp_coeff: 0.004,
      condenser_ua: 240,
      reboiler_ua: 280,
      top_holdup: 12,
      bottom_holdup: 18,
      top_tau: 8,
      bottom_tau: 10,
      cp_mixture: 3200,
    };
  }

  function updateSeparationResults(result) {
    separationMetrics.topPurity.textContent = `${(result.summary.top_purity * 100).toFixed(1)} %`;
    separationMetrics.bottomImpurity.textContent = `${(result.summary.bottom_impurity * 100).toFixed(1)} %`;
    separationMetrics.energy.textContent = `${result.summary.energy_intensity.toFixed(1)} kJ/kmol`;
    separationMetrics.index.textContent = `${result.summary.max_separation_index.toFixed(2)}`;

    separationInsight.textContent =
      `Top purity reaches ${(result.summary.top_purity * 100).toFixed(1)}% while bottom light-key slip falls to ${(result.summary.bottom_impurity * 100).toFixed(1)}%. ` +
      `Peak separation leverage is ${result.summary.max_separation_index.toFixed(2)} with an energy intensity of ${result.summary.energy_intensity.toFixed(1)} kJ/kmol distillate.`;
  }

  function getOrbitalPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = orbitalForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };
    return {
      n: Math.max(Math.round(getNumber("orbital_n", 3) || 3), 1),
      l: Math.max(Math.round(getNumber("orbital_l", 2) || 2), 0),
      m: Math.round(getNumber("orbital_m", 1) || 1),
      sample_count: Math.max(Math.round(getNumber("orbital_samples", 1400) || 1400), 200),
      radial_max: Math.max(getNumber("orbital_radial_max", 24) || 24, 1),
      seed: Math.max(Math.round(getNumber("orbital_seed", 12345) || 12345), 1),
    };
  }

  function orbitalLabel(n, l, m) {
    const letters = ["s", "p", "d", "f", "g", "h"];
    const shell = letters[l] || `l${l}`;
    return `${n}${shell}${m >= 0 ? `+${m}` : m}`;
  }

  function renderOrbitalProjection(svg, samples, xKey, yKey, radialMax) {
    const width = 520;
    const height = 360;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusScale = (Math.min(width, height) * 0.42) / Math.max(radialMax, 1);

    const axes = `
      <rect x="0" y="0" width="${width}" height="${height}" rx="24" class="chart-bg" />
      <line x1="20" y1="${centerY}" x2="${width - 20}" y2="${centerY}" class="chart-axis" />
      <line x1="${centerX}" y1="20" x2="${centerX}" y2="${height - 20}" class="chart-axis" />
    `;

    const points = samples
      .map((sample) => {
        const x = centerX + sample[xKey] * radiusScale;
        const y = centerY - sample[yKey] * radiusScale;
        const alpha = Math.max(0.1, Math.min(sample.normalized_intensity, 1));
        const r = 1.2 + 1.8 * alpha;
        const fill = `rgba(96, 165, 250, ${alpha.toFixed(3)})`;
        return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" />`;
      })
      .join("");

    svg.innerHTML = `${axes}${points}`;
  }

  function renderOrbitalCanvas(samples, radialMax) {
    if (!orbitalCanvas) {
      return;
    }

    const context = orbitalCanvas.getContext("2d");
    if (!context) {
      return;
    }

    if (orbital3DState.animationId) {
      cancelAnimationFrame(orbital3DState.animationId);
      orbital3DState.animationId = null;
    }

    orbital3DState.points = samples.slice(0, 1600);
    orbital3DState.radialMax = Math.max(radialMax, 1);
    orbital3DState.angleY = 0;

    const width = orbitalCanvas.width;
    const height = orbitalCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.23 / orbital3DState.radialMax;

    function drawFrame() {
      context.clearRect(0, 0, width, height);

      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(15, 23, 42, 0.96)");
      background.addColorStop(1, "rgba(2, 6, 23, 0.98)");
      context.fillStyle = background;
      context.beginPath();
      context.roundRect(0, 0, width, height, 24);
      context.fill();

      context.strokeStyle = "rgba(148, 163, 184, 0.18)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(24, centerY);
      context.lineTo(width - 24, centerY);
      context.moveTo(centerX, 24);
      context.lineTo(centerX, height - 24);
      context.stroke();

      const cosY = Math.cos(orbital3DState.angleY);
      const sinY = Math.sin(orbital3DState.angleY);
      const cosX = Math.cos(orbital3DState.angleX);
      const sinX = Math.sin(orbital3DState.angleX);

      const projected = orbital3DState.points.map((sample) => {
        const x1 = sample.x * cosY - sample.z * sinY;
        const z1 = sample.x * sinY + sample.z * cosY;
        const y1 = sample.y * cosX - z1 * sinX;
        const z2 = sample.y * sinX + z1 * cosX;
        const perspective = 1 / (1 + z2 / (orbital3DState.radialMax * 3.5));
        return {
          x: centerX + x1 * scale * perspective,
          y: centerY - y1 * scale * perspective,
          z: z2,
          intensity: sample.normalized_intensity,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      for (const point of projected) {
        const alpha = Math.max(0.08, Math.min(point.intensity, 1));
        const radius = 0.8 + 2.6 * alpha;
        const hue = 200 - 40 * alpha;
        context.fillStyle = `hsla(${hue}, 90%, ${58 + 24 * alpha}%, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(148, 163, 184, 0.8)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText("rotating 3D probability cloud", 24, height - 18);

      orbital3DState.angleY += 0.01;
      orbital3DState.animationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function updateOrbitalResults(result) {
    orbitalMetrics.meanRadius.textContent = `${result.summary.mean_radius.toFixed(2)} a0`;
    orbitalMetrics.maxRadius.textContent = `${result.summary.max_radius.toFixed(2)} a0`;
    orbitalMetrics.meanIntensity.textContent = `${result.summary.mean_intensity.toFixed(3)}`;
    orbitalMetrics.label.textContent = orbitalLabel(result.meta.n, result.meta.l, result.meta.m);

    orbitalInsight.textContent =
      `Sampled ${result.meta.sample_count} positions for the ${orbitalLabel(result.meta.n, result.meta.l, result.meta.m)} orbital. ` +
      `Brighter zones in the projections correspond to higher probability density from the sampled wavefunction.`;
  }

  async function runOrbitalStudy() {
    const payload = getOrbitalPayload();
    if (payload.l >= payload.n || Math.abs(payload.m) > payload.l) {
      throw new Error("Use valid quantum numbers: n > l and |m| <= l.");
    }
    const result = await fetchJson(api.orbitalRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    renderOrbitalProjection(orbitalXYPlot, result.samples, "x", "y", result.meta.radial_max);
    renderOrbitalProjection(orbitalXZPlot, result.samples, "x", "z", result.meta.radial_max);
    renderOrbitalCanvas(result.samples, result.meta.radial_max);
    updateOrbitalResults(result);
  }

  async function runSeparationStudy() {
    const payload = getSeparationPayload();
    const result = await fetchJson(api.separationRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    buildChart(separationPrimaryChart, [
      { values: result.states.x_top.map((value) => value * 100), color: "#22d3ee" },
      { values: result.states.x_bottom.map((value) => value * 100), color: "#facc15" },
      { values: result.states.T_top, color: "#f472b6" },
      { values: result.states.T_bottom, color: "#60a5fa" },
    ]);

    buildChart(separationSecondaryChart, [
      { values: result.derived.condenser_duty.map((value) => value / 1000), color: "#fb923c" },
      { values: result.derived.reboiler_duty.map((value) => value / 1000), color: "#4ade80" },
      { values: result.derived.distillate_flow, color: "#60a5fa" },
      { values: result.derived.separation_index, color: "#f472b6" },
    ]);

    updateSeparationResults(result);
  }

  async function runReactorStudy() {
    const params = getReactorPayload();
    const result = await fetchJson(api.reactorRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    buildChart(reactorPrimaryChart, [
      { values: result.states.T, color: "#f472b6" },
      { values: result.states.Tc, color: "#60a5fa" },
      { values: result.states.CA, color: "#22d3ee" },
    ]);

    buildChart(reactorSecondaryChart, [
      { values: result.derived.heat_release.map((value) => value / 1000), color: "#fb923c" },
      { values: result.derived.heat_removal.map((value) => value / 1000), color: "#4ade80" },
      { values: result.derived.conversion.map((value) => value * 100), color: "#facc15" },
    ]);

    updateReactorResults(result, params);
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
    if (reactorForm && reactorPreset) {
      applyReactorPreset(reactorPreset.value);
      await runReactorStudy();
    }
    if (separationForm && separationPreset) {
      applySeparationPreset(separationPreset.value);
      await runSeparationStudy();
    }
    if (orbitalForm && orbitalRunButton) {
      await runOrbitalStudy();
    }
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

  if (reactorForm && reactorPreset && reactorRunButton) {
    reactorForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
        reactorNote.textContent = "Running thermal reactor study...";
        await runReactorStudy();
        reactorNote.textContent = "Thermal reactor study completed with the native C++ core.";
      } catch (error) {
        reactorNote.textContent = error.message;
        reactorInsight.textContent = error.message;
      }
    });

    reactorRunButton.addEventListener("click", async function () {
      try {
        reactorNote.textContent = "Running thermal reactor study...";
        await runReactorStudy();
        reactorNote.textContent = "Thermal reactor study completed with the native C++ core.";
      } catch (error) {
        reactorNote.textContent = error.message;
        reactorInsight.textContent = error.message;
      }
    });

    reactorPreset.addEventListener("change", async function () {
      try {
        applyReactorPreset(reactorPreset.value);
        await runReactorStudy();
      } catch (error) {
        reactorNote.textContent = error.message;
        reactorInsight.textContent = error.message;
      }
    });
  }

  if (separationForm && separationPreset && separationRunButton) {
    separationRunButton.addEventListener("click", async function () {
      try {
        separationNote.textContent = "Running separation process model...";
        await runSeparationStudy();
        separationNote.textContent = "Separation process completed with the native C++ core.";
      } catch (error) {
        separationNote.textContent = error.message;
        separationInsight.textContent = error.message;
      }
    });

    separationPreset.addEventListener("change", async function () {
      try {
        applySeparationPreset(separationPreset.value);
        await runSeparationStudy();
      } catch (error) {
        separationNote.textContent = error.message;
        separationInsight.textContent = error.message;
      }
    });
  }

  if (orbitalForm && orbitalRunButton) {
    orbitalRunButton.addEventListener("click", async function () {
      try {
        orbitalNote.textContent = "Sampling orbital with the native C++ core...";
        await runOrbitalStudy();
        orbitalNote.textContent = "Orbital sampling completed.";
      } catch (error) {
        orbitalNote.textContent = error.message;
        orbitalInsight.textContent = error.message;
      }
    });
  }

  initialize().catch(function (error) {
    presetNote.textContent = error.message;
    insight.textContent = error.message;
  });
})();
