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
  const cfdForm = document.getElementById("cfd-form");
  const cfdPreset = document.getElementById("cfd_preset");
  const cfdRunButton = document.getElementById("cfd-run-btn");
  const cfdNote = document.getElementById("cfd-note");
  const cfdInsight = document.getElementById("cfd-insight");
  const cfdCanvas = document.getElementById("cfd-3d-canvas");
  const cfdPrimaryChart = document.getElementById("cfd-primary-chart");
  const cfdSecondaryChart = document.getElementById("cfd-secondary-chart");
  const fusionForm = document.getElementById("fusion-form");
  const fusionPreset = document.getElementById("fusion_preset");
  const fusionRunButton = document.getElementById("fusion-run-btn");
  const fusionNote = document.getElementById("fusion-note");
  const fusionInsight = document.getElementById("fusion-insight");
  const fusionCanvas = document.getElementById("fusion-3d-canvas");
  const fusionPrimaryChart = document.getElementById("fusion-primary-chart");
  const fusionSecondaryChart = document.getElementById("fusion-secondary-chart");
  const designSpaceForm = document.getElementById("design-space-form");
  const designSpacePreset = document.getElementById("ds_preset");
  const designSpaceRunButton = document.getElementById("ds-run-btn");
  const designSpaceNote = document.getElementById("ds-note");
  const designSpaceInsight = document.getElementById("ds-insight");
  const designSpaceCanvas = document.getElementById("ds-3d-canvas");
  const designSpacePrimaryChart = document.getElementById("ds-primary-chart");
  const designSpaceSecondaryChart = document.getElementById("ds-secondary-chart");
  const vizForm = document.getElementById("viz-form");
  const vizPreset = document.getElementById("viz_preset");
  const vizRunButton = document.getElementById("viz-run-btn");
  const vizNote = document.getElementById("viz-note");
  const vizInsight = document.getElementById("viz-insight");
  const vizCanvas = document.getElementById("viz-3d-canvas");
  const vizPrimaryChart = document.getElementById("viz-primary-chart");
  const vizSecondaryChart = document.getElementById("viz-secondary-chart");

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
  const cfdMetrics = {
    re: document.getElementById("cfd-metric-re"),
    dp: document.getElementById("cfd-metric-dp"),
    h: document.getElementById("cfd-metric-h"),
    vmax: document.getElementById("cfd-metric-vmax"),
  };
  const fusionMetrics = {
    temp: document.getElementById("fusion-metric-temp"),
    power: document.getElementById("fusion-metric-power"),
    q: document.getElementById("fusion-metric-q"),
    triple: document.getElementById("fusion-metric-triple"),
  };
  const designSpaceMetrics = {
    yield: document.getElementById("ds-metric-yield"),
    profit: document.getElementById("ds-metric-profit"),
    sty: document.getElementById("ds-metric-sty"),
    pareto: document.getElementById("ds-metric-pareto"),
  };
  const vizMetrics = {
    concentration: document.getElementById("viz-metric-conc"),
    temperature: document.getElementById("viz-metric-temp"),
    speed: document.getElementById("viz-metric-speed"),
    radius: document.getElementById("viz-metric-radius"),
  };
  const orbital3DState = {
    animationId: null,
    points: [],
    radialMax: 1,
    angleX: 0.55,
    angleY: 0,
  };
  const cfd3DState = {
    animationId: null,
    points: [],
    length: 1,
    radius: 1,
    angleY: 0,
    angleX: 0.42,
  };
  const fusion3DState = {
    animationId: null,
    points: [],
    majorRadius: 6.2,
    minorRadius: 2.0,
    angleY: 0,
    angleX: 0.48,
  };
  const design3DState = {
    animationId: null,
    points: [],
    angleY: 0,
    angleX: 0.52,
    tempMin: 320,
    tempRange: 100,
    tauMin: 0.4,
    tauRange: 5,
    yieldScale: 1,
  };
  const viz3DState = {
    animationId: null,
    points: [],
    angleY: 0,
    angleX: 0.46,
    domain: 12,
  };
  const api = {
    microbes: "/api/simulation/microbes/",
    run: "/api/simulation/run/",
    reactorRun: "/api/reactor/run/",
    separationRun: "/api/separation/run/",
    orbitalRun: "/api/atomic-orbital/run/",
    cfdRun: "/api/cfd/run/",
    fusionRun: "/api/fusion/run/",
    designSpaceRun: "/api/design-space/run/",
    vizLabRun: "/api/visualization-lab/run/",
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
  const cfdPresets = {
    laminar: {
      cfd_length: 6,
      cfd_diameter: 0.1,
      cfd_mass_flow: 0.25,
      cfd_density: 998,
      cfd_viscosity: 0.0012,
      cfd_roughness: 0.00001,
      cfd_inlet_temp: 295,
      cfd_wall_temp: 325,
      cfd_cp: 4180,
      cfd_k: 0.60,
    },
    transition: {
      cfd_length: 8,
      cfd_diameter: 0.14,
      cfd_mass_flow: 1.8,
      cfd_density: 998,
      cfd_viscosity: 0.0010,
      cfd_roughness: 0.00003,
      cfd_inlet_temp: 298,
      cfd_wall_temp: 332,
      cfd_cp: 4180,
      cfd_k: 0.60,
    },
    turbulent: {
      cfd_length: 10,
      cfd_diameter: 0.18,
      cfd_mass_flow: 5.5,
      cfd_density: 998,
      cfd_viscosity: 0.00085,
      cfd_roughness: 0.000045,
      cfd_inlet_temp: 295,
      cfd_wall_temp: 335,
      cfd_cp: 4180,
      cfd_k: 0.60,
    },
  };
  const fusionPresets = {
    baseline: {
      fusion_major_radius: 6.2,
      fusion_minor_radius: 2.0,
      fusion_bfield: 5.3,
      fusion_current: 15.0,
      fusion_density: 8.5e19,
      fusion_temp: 12.0,
      fusion_tau: 3.5,
      fusion_aux: 45000000,
      fusion_fueling: 1.4e18,
      fusion_impurity: 0.015,
      fusion_time_end: 18,
      fusion_wall_reflectivity: 0.25,
    },
    high_q: {
      fusion_major_radius: 6.6,
      fusion_minor_radius: 2.1,
      fusion_bfield: 5.7,
      fusion_current: 16.5,
      fusion_density: 9.0e19,
      fusion_temp: 15.0,
      fusion_tau: 4.8,
      fusion_aux: 38000000,
      fusion_fueling: 1.1e18,
      fusion_impurity: 0.012,
      fusion_time_end: 20,
      fusion_wall_reflectivity: 0.32,
    },
    ignition_edge: {
      fusion_major_radius: 6.4,
      fusion_minor_radius: 2.0,
      fusion_bfield: 5.9,
      fusion_current: 17.2,
      fusion_density: 1.05e20,
      fusion_temp: 18.0,
      fusion_tau: 5.4,
      fusion_aux: 29000000,
      fusion_fueling: 1.0e18,
      fusion_impurity: 0.018,
      fusion_time_end: 16,
      fusion_wall_reflectivity: 0.35,
    },
  };
  const designSpacePresets = {
    balanced: {
      ds_temp_min: 320,
      ds_temp_max: 430,
      ds_tau_min: 0.4,
      ds_tau_max: 6.0,
      ds_feed_conc: 2.8,
      ds_coolant_temp: 305,
      ds_main_k0: 8500000,
      ds_main_ea: 68000,
      ds_side_k0: 12000000,
      ds_side_ea: 76000,
      ds_ua: 240,
      ds_product_price: 1500,
    },
    selectivity: {
      ds_temp_min: 315,
      ds_temp_max: 405,
      ds_tau_min: 0.6,
      ds_tau_max: 5.5,
      ds_feed_conc: 2.2,
      ds_coolant_temp: 300,
      ds_main_k0: 7200000,
      ds_main_ea: 65000,
      ds_side_k0: 17000000,
      ds_side_ea: 80500,
      ds_ua: 285,
      ds_product_price: 1650,
    },
    throughput: {
      ds_temp_min: 330,
      ds_temp_max: 450,
      ds_tau_min: 0.25,
      ds_tau_max: 4.5,
      ds_feed_conc: 3.6,
      ds_coolant_temp: 308,
      ds_main_k0: 10200000,
      ds_main_ea: 70000,
      ds_side_k0: 13600000,
      ds_side_ea: 77000,
      ds_ua: 210,
      ds_product_price: 1425,
    },
  };
  const vizPresets = {
    plume: {
      viz_domain: 12,
      viz_time: 4.5,
      viz_diffusivity: 0.18,
      viz_strength: 48,
      viz_sigma: 0.95,
      viz_vortex: 6.5,
      viz_adv_x: 0.55,
      viz_adv_y: -0.18,
      viz_adv_z: 0.10,
      viz_thermal: 24,
    },
    shear: {
      viz_domain: 14,
      viz_time: 3.8,
      viz_diffusivity: 0.12,
      viz_strength: 42,
      viz_sigma: 0.75,
      viz_vortex: 4.2,
      viz_adv_x: 0.90,
      viz_adv_y: 0.25,
      viz_adv_z: 0.05,
      viz_thermal: 18,
    },
    mixing: {
      viz_domain: 10,
      viz_time: 5.2,
      viz_diffusivity: 0.24,
      viz_strength: 54,
      viz_sigma: 1.15,
      viz_vortex: 8.2,
      viz_adv_x: 0.30,
      viz_adv_y: -0.10,
      viz_adv_z: 0.18,
      viz_thermal: 28,
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

  function applyCFDPreset(name) {
    const preset = cfdPresets[name];
    if (!cfdForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = cfdForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    cfdNote.textContent = `${cfdPreset.options[cfdPreset.selectedIndex].text} loaded.`;
  }

  function getCFDPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = cfdForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };
    return {
      length: Math.max(getNumber("cfd_length", 8) || 8, 0.1),
      diameter: Math.max(getNumber("cfd_diameter", 0.18) || 0.18, 0.01),
      mass_flow: Math.max(getNumber("cfd_mass_flow", 5.5) || 5.5, 0.01),
      density: Math.max(getNumber("cfd_density", 998) || 998, 1),
      viscosity: Math.max(getNumber("cfd_viscosity", 0.001) || 0.001, 0.000001),
      roughness: Math.max(getNumber("cfd_roughness", 0.000045) || 0.000045, 0),
      inlet_temp: Math.max(getNumber("cfd_inlet_temp", 295) || 295, 200),
      wall_temp: Math.max(getNumber("cfd_wall_temp", 335) || 335, 200),
      cp: Math.max(getNumber("cfd_cp", 4180) || 4180, 1),
      conductivity: Math.max(getNumber("cfd_k", 0.6) || 0.6, 0.001),
      axial_points: 60,
      radial_points: 26,
    };
  }

  function renderCFDCanvas(points, params) {
    if (!cfdCanvas) {
      return;
    }
    const context = cfdCanvas.getContext("2d");
    if (!context) {
      return;
    }
    if (cfd3DState.animationId) {
      cancelAnimationFrame(cfd3DState.animationId);
      cfd3DState.animationId = null;
    }
    cfd3DState.points = points;
    cfd3DState.length = params.length;
    cfd3DState.radius = params.diameter / 2;
    cfd3DState.angleY = 0;

    const width = cfdCanvas.width;
    const height = cfdCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const lengthScale = (width * 0.68) / Math.max(params.length, 1);
    const radiusScale = (height * 0.22) / Math.max(cfd3DState.radius, 1e-6);

    function drawFrame() {
      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(15, 23, 42, 0.96)");
      background.addColorStop(1, "rgba(2, 6, 23, 0.99)");
      context.fillStyle = background;
      context.beginPath();
      context.roundRect(0, 0, width, height, 24);
      context.fill();

      const cosY = Math.cos(cfd3DState.angleY);
      const sinY = Math.sin(cfd3DState.angleY);
      const cosX = Math.cos(cfd3DState.angleX);
      const sinX = Math.sin(cfd3DState.angleX);
      const maxVelocity = Math.max(...cfd3DState.points.map((point) => point.velocity), 1e-6);

      const projected = cfd3DState.points.map((point, index) => {
        const theta = ((index % 17) / 17) * Math.PI * 2;
        const localY = point.r * Math.cos(theta);
        const localZ = point.r * Math.sin(theta);
        const xShift = point.x - cfd3DState.length / 2;

        const x1 = xShift * cosY - localZ * sinY;
        const z1 = xShift * sinY + localZ * cosY;
        const y1 = localY * cosX - z1 * sinX;
        const z2 = localY * sinX + z1 * cosX;
        const perspective = 1 / (1 + z2 / (cfd3DState.radius * 8 + 1));
        return {
          x: centerX + x1 * lengthScale * perspective,
          y: centerY - y1 * radiusScale * perspective,
          z: z2,
          velocityRatio: point.velocity / maxVelocity,
          temperatureRatio: (point.temperature - params.inlet_temp) /
            Math.max(params.wall_temp - params.inlet_temp, 1),
        };
      });

      projected.sort((a, b) => a.z - b.z);

      for (const point of projected) {
        const radius = 1.1 + 2.4 * point.velocityRatio;
        const hue = 205 - 145 * Math.max(0, Math.min(point.temperatureRatio, 1));
        const alpha = 0.18 + 0.65 * point.velocityRatio;
        context.fillStyle = `hsla(${hue}, 92%, ${54 + 16 * point.velocityRatio}%, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText("rotating CFD point cloud", 24, height - 18);

      cfd3DState.angleY += 0.012;
      cfd3DState.animationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function updateCFDResults(result) {
    cfdMetrics.re.textContent = `${result.summary.reynolds.toFixed(0)}`;
    cfdMetrics.dp.textContent = `${result.summary.pressure_drop.toFixed(1)} Pa`;
    cfdMetrics.h.textContent = `${result.summary.heat_transfer_coeff.toFixed(1)} W/m2K`;
    cfdMetrics.vmax.textContent = `${result.summary.max_velocity.toFixed(2)} m/s`;

    const regime =
      result.summary.reynolds < 2300
        ? "laminar"
        : result.summary.reynolds < 4000
          ? "transitional"
          : "turbulent";

    cfdInsight.textContent =
      `The pipe flow is ${regime} at Re = ${result.summary.reynolds.toFixed(0)}. ` +
      `Pressure drop is ${result.summary.pressure_drop.toFixed(1)} Pa with Nusselt ${result.summary.nusselt.toFixed(2)} and peak velocity ${result.summary.max_velocity.toFixed(2)} m/s.`;
  }

  function applyFusionPreset(name) {
    const preset = fusionPresets[name];
    if (!fusionForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = fusionForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    fusionNote.textContent = `${fusionPreset.options[fusionPreset.selectedIndex].text} loaded.`;
  }

  function getFusionPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = fusionForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };
    return {
      major_radius: Math.max(getNumber("fusion_major_radius", 6.2) || 6.2, 0.5),
      minor_radius: Math.max(getNumber("fusion_minor_radius", 2.0) || 2.0, 0.2),
      magnetic_field: Math.max(getNumber("fusion_bfield", 5.3) || 5.3, 0.1),
      plasma_current: Math.max((getNumber("fusion_current", 15.0) || 15.0) * 1e6, 1e4),
      density_0: Math.max(getNumber("fusion_density", 8.5e19) || 8.5e19, 1e18),
      temperature_0: Math.max(getNumber("fusion_temp", 12.0) || 12.0, 0.1),
      confinement_time: Math.max(getNumber("fusion_tau", 3.5) || 3.5, 0.05),
      auxiliary_power: Math.max(getNumber("fusion_aux", 45000000) || 45000000, 1e3),
      fueling_rate: Math.max(getNumber("fusion_fueling", 1.4e18) || 1.4e18, 0),
      impurity_fraction: Math.max(getNumber("fusion_impurity", 0.015) || 0.015, 0),
      time_end: Math.max(getNumber("fusion_time_end", 18) || 18, 1),
      wall_reflectivity: Math.max(getNumber("fusion_wall_reflectivity", 0.25) || 0.25, 0),
      helium_fraction_0: 0.02,
      radiation_coeff: 5.35e-37,
      alpha_heating_fraction: 0.88,
      n_points: 280,
    };
  }

  function renderFusionCanvas(result, payload) {
    if (!fusionCanvas) {
      return;
    }
    const context = fusionCanvas.getContext("2d");
    if (!context) {
      return;
    }
    if (fusion3DState.animationId) {
      cancelAnimationFrame(fusion3DState.animationId);
      fusion3DState.animationId = null;
    }

    const temperature = result.summary.peak_temperature;
    const density = result.summary.final_density;
    fusion3DState.majorRadius = payload.major_radius;
    fusion3DState.minorRadius = payload.minor_radius;
    fusion3DState.points = Array.from({ length: 1400 }, (_, index) => {
      const u = (index / 1400) * Math.PI * 2;
      const v = ((index * 13) % 1400) / 1400 * Math.PI * 2;
      const ripple = 0.75 + 0.25 * Math.sin(index * 0.17 + temperature * 0.2);
      const localMinor = fusion3DState.minorRadius * ripple;
      const x = (fusion3DState.majorRadius + localMinor * Math.cos(v)) * Math.cos(u);
      const z = (fusion3DState.majorRadius + localMinor * Math.cos(v)) * Math.sin(u);
      const y = localMinor * Math.sin(v) * 0.65;
      const intensity = 0.35 + 0.65 * ((index % 37) / 36) * Math.min(temperature / 25, 1.2);
      return { x, y, z, intensity };
    });

    const width = fusionCanvas.width;
    const height = fusionCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.10 / Math.max(fusion3DState.majorRadius, 1);

    function drawFrame() {
      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(12, 18, 33, 0.98)");
      background.addColorStop(1, "rgba(2, 6, 23, 1)");
      context.fillStyle = background;
      context.beginPath();
      context.roundRect(0, 0, width, height, 24);
      context.fill();

      const cosY = Math.cos(fusion3DState.angleY);
      const sinY = Math.sin(fusion3DState.angleY);
      const cosX = Math.cos(fusion3DState.angleX);
      const sinX = Math.sin(fusion3DState.angleX);

      const projected = fusion3DState.points.map((point) => {
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;
        const perspective = 1 / (1 + z2 / (fusion3DState.majorRadius * 3.5));
        return {
          x: centerX + x1 * scale * perspective,
          y: centerY - y1 * scale * perspective,
          z: z2,
          intensity: point.intensity,
        };
      });

      projected.sort((a, b) => a.z - b.z);
      for (const point of projected) {
        const alpha = Math.max(0.1, Math.min(point.intensity, 1));
        const radius = 1.0 + 2.8 * alpha;
        const hue = 220 - 180 * alpha;
        context.fillStyle = `hsla(${hue}, 95%, ${58 + 16 * alpha}%, ${0.2 + 0.65 * alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText(`tokamak torus | density ${density.toExponential(2)} m^-3`, 24, height - 18);

      fusion3DState.angleY += 0.008;
      fusion3DState.animationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function updateFusionResults(result) {
    fusionMetrics.temp.textContent = `${result.summary.peak_temperature.toFixed(2)} keV`;
    fusionMetrics.power.textContent = `${(result.summary.peak_fusion_power / 1e6).toFixed(2)} MW`;
    fusionMetrics.q.textContent = `${result.summary.max_q.toFixed(2)}`;
    fusionMetrics.triple.textContent = `${result.summary.triple_product_peak.toExponential(2)}`;

    const finalQ = result.states.q_value[result.states.q_value.length - 1];
    fusionInsight.textContent =
      `Peak plasma temperature reaches ${result.summary.peak_temperature.toFixed(2)} keV with peak fusion power ${(result.summary.peak_fusion_power / 1e6).toFixed(2)} MW. ` +
      `The pulse achieves max Q ${result.summary.max_q.toFixed(2)} and closes at Q ${finalQ.toFixed(2)}.`;
  }

  function applyDesignSpacePreset(name) {
    const preset = designSpacePresets[name];
    if (!designSpaceForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = designSpaceForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    designSpaceNote.textContent = `${designSpacePreset.options[designSpacePreset.selectedIndex].text} loaded.`;
  }

  function getDesignSpacePayload() {
    const getNumber = function (fieldName, fallback) {
      const field = designSpaceForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };
    const tempMin = Math.max(getNumber("ds_temp_min", 320) || 320, 250);
    const tempMax = Math.max(getNumber("ds_temp_max", 430) || 430, tempMin + 1);
    const tauMin = Math.max(getNumber("ds_tau_min", 0.4) || 0.4, 0.05);
    const tauMax = Math.max(getNumber("ds_tau_max", 6.0) || 6.0, tauMin + 0.05);
    return {
      temp_min: tempMin,
      temp_max: tempMax,
      tau_min: tauMin,
      tau_max: tauMax,
      feed_concentration: Math.max(getNumber("ds_feed_conc", 2.8) || 2.8, 0.01),
      coolant_temp: Math.max(getNumber("ds_coolant_temp", 305) || 305, 200),
      pre_exponential_main: Math.max(getNumber("ds_main_k0", 8500000) || 8500000, 1),
      activation_energy_main: Math.max(getNumber("ds_main_ea", 68000) || 68000, 1),
      pre_exponential_side: Math.max(getNumber("ds_side_k0", 12000000) || 12000000, 1),
      activation_energy_side: Math.max(getNumber("ds_side_ea", 76000) || 76000, 1),
      delta_h_main: -72000,
      delta_h_side: -98000,
      ua: Math.max(getNumber("ds_ua", 240) || 240, 1),
      rho_cp: 4200,
      reactor_volume: 1.0,
      product_price: Math.max(getNumber("ds_product_price", 1500) || 1500, 1),
      utility_cost: 0.02,
      temp_points: 24,
      tau_points: 20,
    };
  }

  function renderDesignSpaceCanvas(points, payload) {
    if (!designSpaceCanvas) {
      return;
    }
    const context = designSpaceCanvas.getContext("2d");
    if (!context) {
      return;
    }
    if (design3DState.animationId) {
      cancelAnimationFrame(design3DState.animationId);
      design3DState.animationId = null;
    }

    const maxProfit = Math.max(...points.map((point) => point.profitability), 1);
    design3DState.points = points.map((point) => ({
      x: point.temperature,
      y: point.yield_value,
      z: point.residence_time,
      pareto: point.pareto,
      profitRatio: Math.max(0, point.profitability / maxProfit),
    }));
    design3DState.tempMin = payload.temp_min;
    design3DState.tempRange = Math.max(payload.temp_max - payload.temp_min, 1);
    design3DState.tauMin = payload.tau_min;
    design3DState.tauRange = Math.max(payload.tau_max - payload.tau_min, 1);
    design3DState.yieldScale = 1;
    design3DState.angleY = 0;

    const width = designSpaceCanvas.width;
    const height = designSpaceCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    function drawFrame() {
      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(10, 20, 30, 0.98)");
      background.addColorStop(1, "rgba(4, 10, 20, 1)");
      context.fillStyle = background;
      context.beginPath();
      context.roundRect(0, 0, width, height, 24);
      context.fill();

      const cosY = Math.cos(design3DState.angleY);
      const sinY = Math.sin(design3DState.angleY);
      const cosX = Math.cos(design3DState.angleX);
      const sinX = Math.sin(design3DState.angleX);

      const projected = design3DState.points.map((point) => {
        const px = ((point.x - design3DState.tempMin) / design3DState.tempRange - 0.5) * 2.4;
        const py = (point.y / design3DState.yieldScale - 0.5) * 2.0;
        const pz = ((point.z - design3DState.tauMin) / design3DState.tauRange - 0.5) * 2.0;
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;
        const y1 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;
        const perspective = 1 / (1 + z2 / 5.5);
        return {
          x: centerX + x1 * 190 * perspective,
          y: centerY - y1 * 120 * perspective,
          z: z2,
          pareto: point.pareto,
          profitRatio: point.profitRatio,
        };
      });

      projected.sort((a, b) => a.z - b.z);
      for (const point of projected) {
        const alpha = point.pareto ? 0.92 : 0.22 + 0.4 * point.profitRatio;
        const radius = point.pareto ? 4.2 : 1.5 + 2.0 * point.profitRatio;
        const hue = point.pareto ? 48 : 195 - 120 * point.profitRatio;
        context.fillStyle = `hsla(${hue}, 95%, ${55 + 18 * point.profitRatio}%, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText("temperature x yield x residence-time landscape", 24, height - 18);

      design3DState.angleY += 0.01;
      design3DState.animationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function updateDesignSpaceResults(result) {
    designSpaceMetrics.yield.textContent = `${(result.summary.best_yield * 100).toFixed(1)} %`;
    designSpaceMetrics.profit.textContent = `${result.summary.best_profitability.toFixed(1)}`;
    designSpaceMetrics.sty.textContent = `${result.summary.best_space_time_yield.toFixed(2)}`;
    designSpaceMetrics.pareto.textContent = `${result.summary.pareto_count}`;

    const bestPoint = result.points.reduce((best, point) =>
      point.profitability > best.profitability ? point : best
    );

    designSpaceInsight.textContent =
      `The Pareto set contains ${result.summary.pareto_count} operating points. ` +
      `The strongest profitability occurs near ${bestPoint.temperature.toFixed(0)} K and ${bestPoint.residence_time.toFixed(2)} h, ` +
      `where yield reaches ${(bestPoint.yield_value * 100).toFixed(1)}% with safety index ${bestPoint.safety_index.toFixed(2)}.`;
  }

  function applyVizPreset(name) {
    const preset = vizPresets[name];
    if (!vizForm || !preset) {
      return;
    }
    Object.entries(preset).forEach(([key, value]) => {
      const field = vizForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    vizNote.textContent = `${vizPreset.options[vizPreset.selectedIndex].text} loaded.`;
  }

  function getVizPayload() {
    const getNumber = function (fieldName, fallback) {
      const field = vizForm.elements.namedItem(fieldName);
      return Number(field && field.value !== "" ? field.value : fallback);
    };
    return {
      domain_size: Math.max(getNumber("viz_domain", 12) || 12, 2),
      diffusivity: Math.max(getNumber("viz_diffusivity", 0.18) || 0.18, 0.0001),
      advection_x: getNumber("viz_adv_x", 0.55) || 0,
      advection_y: getNumber("viz_adv_y", -0.18) || 0,
      advection_z: getNumber("viz_adv_z", 0.10) || 0,
      source_strength: Math.max(getNumber("viz_strength", 48) || 48, 1),
      source_sigma: Math.max(getNumber("viz_sigma", 0.95) || 0.95, 0.01),
      vortex_strength: Math.max(getNumber("viz_vortex", 6.5) || 6.5, 0.01),
      thermal_gain: Math.max(getNumber("viz_thermal", 24) || 24, 0.1),
      time_value: Math.max(getNumber("viz_time", 4.5) || 4.5, 0.01),
      grid_points: 14,
    };
  }

  function renderVizCanvas(points, payload) {
    if (!vizCanvas) {
      return;
    }
    const context = vizCanvas.getContext("2d");
    if (!context) {
      return;
    }
    if (viz3DState.animationId) {
      cancelAnimationFrame(viz3DState.animationId);
      viz3DState.animationId = null;
    }
    const maxConc = Math.max(...points.map((point) => point.concentration), 1e-9);
    viz3DState.points = points
      .filter((point) => point.concentration > maxConc * 0.02)
      .map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
        intensity: point.concentration / maxConc,
        speed: point.speed,
      }));
    viz3DState.domain = payload.domain_size;
    viz3DState.angleY = 0;

    const width = vizCanvas.width;
    const height = vizCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.24 / Math.max(viz3DState.domain, 1);

    function drawFrame() {
      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(16, 16, 32, 0.98)");
      background.addColorStop(1, "rgba(2, 6, 23, 1)");
      context.fillStyle = background;
      context.beginPath();
      context.roundRect(0, 0, width, height, 24);
      context.fill();

      const cosY = Math.cos(viz3DState.angleY);
      const sinY = Math.sin(viz3DState.angleY);
      const cosX = Math.cos(viz3DState.angleX);
      const sinX = Math.sin(viz3DState.angleX);

      const projected = viz3DState.points.map((point) => {
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;
        const perspective = 1 / (1 + z2 / (viz3DState.domain * 1.6));
        return {
          x: centerX + x1 * scale * perspective,
          y: centerY - y1 * scale * perspective,
          z: z2,
          intensity: point.intensity,
          speed: point.speed,
        };
      });

      projected.sort((a, b) => a.z - b.z);
      for (const point of projected) {
        const alpha = 0.10 + 0.72 * point.intensity;
        const radius = 1.0 + 3.2 * point.intensity;
        const hue = 210 - 170 * point.intensity;
        context.fillStyle = `hsla(${hue}, 92%, ${54 + 18 * point.intensity}%, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText("advected scalar plume with vortex transport", 24, height - 18);

      viz3DState.angleY += 0.009;
      viz3DState.animationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  function updateVizResults(result) {
    vizMetrics.concentration.textContent = `${result.summary.max_concentration.toExponential(2)}`;
    vizMetrics.temperature.textContent = `${result.summary.max_temperature.toFixed(1)} K`;
    vizMetrics.speed.textContent = `${result.summary.mean_speed.toFixed(2)} m/s`;
    vizMetrics.radius.textContent = `${result.summary.plume_radius.toFixed(2)} m`;

    vizInsight.textContent =
      `The volumetric field peaks at ${result.summary.max_temperature.toFixed(1)} K with plume radius ${result.summary.plume_radius.toFixed(2)} m. ` +
      `Mean transport speed is ${result.summary.mean_speed.toFixed(2)} m/s as the source diffuses and curls under vortex forcing.`;
  }

  async function runFusionStudy() {
    const payload = getFusionPayload();
    const result = await fetchJson(api.fusionRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    buildChart(fusionPrimaryChart, [
      { values: result.states.temperature, color: "#fb923c" },
      { values: result.states.density.map((value) => value / 1e19), color: "#22d3ee" },
      { values: result.states.beta_n, color: "#f472b6" },
    ]);

    buildChart(fusionSecondaryChart, [
      { values: result.states.fusion_power.map((value) => value / 1e6), color: "#facc15" },
      { values: result.states.bremsstrahlung_loss.map((value) => value / 1e6), color: "#60a5fa" },
      { values: result.states.confinement_loss.map((value) => value / 1e6), color: "#4ade80" },
      { values: result.states.q_value, color: "#f97316" },
    ]);

    renderFusionCanvas(result, payload);
    updateFusionResults(result);
  }

  async function runDesignSpaceStudy() {
    const payload = getDesignSpacePayload();
    const result = await fetchJson(api.designSpaceRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const paretoPoints = result.points.filter((point) => point.pareto);
    const sortedPareto = paretoPoints
      .slice()
      .sort((a, b) => a.residence_time - b.residence_time);

    buildChart(designSpacePrimaryChart, [
      { values: sortedPareto.map((point) => point.yield_value * 100), color: "#22d3ee" },
      { values: sortedPareto.map((point) => point.selectivity * 100), color: "#facc15" },
      { values: sortedPareto.map((point) => point.conversion * 100), color: "#f472b6" },
    ]);

    buildChart(designSpaceSecondaryChart, [
      { values: sortedPareto.map((point) => point.heat_duty / 1000), color: "#fb923c" },
      { values: sortedPareto.map((point) => point.heat_release / 1000), color: "#60a5fa" },
      { values: sortedPareto.map((point) => point.profitability), color: "#4ade80" },
    ]);

    renderDesignSpaceCanvas(result.points, payload);
    updateDesignSpaceResults(result);
  }

  async function runVizStudy() {
    const payload = getVizPayload();
    const result = await fetchJson(api.vizLabRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const slice = result.points.filter((point) => Math.abs(point.y) < payload.domain_size / result.meta.grid_points);
    const sortedSlice = slice.slice().sort((a, b) => a.x - b.x);
    buildChart(vizPrimaryChart, [
      { values: sortedSlice.map((point) => point.concentration * 1e3), color: "#22d3ee" },
      { values: sortedSlice.map((point) => point.temperature), color: "#fb7185" },
    ]);
    buildChart(vizSecondaryChart, [
      { values: sortedSlice.map((point) => point.vx), color: "#60a5fa" },
      { values: sortedSlice.map((point) => point.vy), color: "#a78bfa" },
      { values: sortedSlice.map((point) => point.speed), color: "#4ade80" },
    ]);

    renderVizCanvas(result.points, payload);
    updateVizResults(result);
  }

  async function runCFDStudy() {
    const payload = getCFDPayload();
    const result = await fetchJson(api.cfdRun, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const lastSlice = result.points.slice(-result.meta.radial_points);
    const byAxial = result.points.filter((_, index) => index % result.meta.radial_points === 0);

    buildChart(cfdPrimaryChart, [
      { values: lastSlice.map((point) => point.velocity), color: "#22d3ee" },
      { values: lastSlice.map((point) => point.temperature), color: "#f97316" },
    ]);

    buildChart(cfdSecondaryChart, [
      { values: byAxial.map((point) => point.pressure), color: "#60a5fa" },
      { values: lastSlice.map((point) => point.turbulence_intensity * 100), color: "#f472b6" },
    ]);

    renderCFDCanvas(result.points, payload);
    updateCFDResults(result);
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
    if (cfdForm && cfdPreset && cfdRunButton) {
      applyCFDPreset(cfdPreset.value);
      await runCFDStudy();
    }
    if (fusionForm && fusionPreset && fusionRunButton) {
      applyFusionPreset(fusionPreset.value);
      await runFusionStudy();
    }
    if (designSpaceForm && designSpacePreset && designSpaceRunButton) {
      applyDesignSpacePreset(designSpacePreset.value);
      await runDesignSpaceStudy();
    }
    if (vizForm && vizPreset && vizRunButton) {
      applyVizPreset(vizPreset.value);
      await runVizStudy();
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

  if (cfdForm && cfdPreset && cfdRunButton) {
    cfdRunButton.addEventListener("click", async function () {
      try {
        cfdNote.textContent = "Running CFD native-core study...";
        await runCFDStudy();
        cfdNote.textContent = "CFD study completed with the native C++ core.";
      } catch (error) {
        cfdNote.textContent = error.message;
        cfdInsight.textContent = error.message;
      }
    });

    cfdPreset.addEventListener("change", async function () {
      try {
        applyCFDPreset(cfdPreset.value);
        await runCFDStudy();
      } catch (error) {
        cfdNote.textContent = error.message;
        cfdInsight.textContent = error.message;
      }
    });
  }

  if (fusionForm && fusionPreset && fusionRunButton) {
    fusionRunButton.addEventListener("click", async function () {
      try {
        fusionNote.textContent = "Running fusion pulse with the native C++ core...";
        await runFusionStudy();
        fusionNote.textContent = "Fusion pulse completed with the native C++ core.";
      } catch (error) {
        fusionNote.textContent = error.message;
        fusionInsight.textContent = error.message;
      }
    });

    fusionPreset.addEventListener("change", async function () {
      try {
        applyFusionPreset(fusionPreset.value);
        await runFusionStudy();
      } catch (error) {
        fusionNote.textContent = error.message;
        fusionInsight.textContent = error.message;
      }
    });
  }

  if (designSpaceForm && designSpacePreset && designSpaceRunButton) {
    designSpaceRunButton.addEventListener("click", async function () {
      try {
        designSpaceNote.textContent = "Running native design-space sweep...";
        await runDesignSpaceStudy();
        designSpaceNote.textContent = "Design-space sweep completed with the native C++ core.";
      } catch (error) {
        designSpaceNote.textContent = error.message;
        designSpaceInsight.textContent = error.message;
      }
    });

    designSpacePreset.addEventListener("change", async function () {
      try {
        applyDesignSpacePreset(designSpacePreset.value);
        await runDesignSpaceStudy();
      } catch (error) {
        designSpaceNote.textContent = error.message;
        designSpaceInsight.textContent = error.message;
      }
    });
  }

  if (vizForm && vizPreset && vizRunButton) {
    vizRunButton.addEventListener("click", async function () {
      try {
        vizNote.textContent = "Rendering volumetric field with the native C++ core...";
        await runVizStudy();
        vizNote.textContent = "Visualization lab completed with the native C++ core.";
      } catch (error) {
        vizNote.textContent = error.message;
        vizInsight.textContent = error.message;
      }
    });

    vizPreset.addEventListener("change", async function () {
      try {
        applyVizPreset(vizPreset.value);
        await runVizStudy();
      } catch (error) {
        vizNote.textContent = error.message;
        vizInsight.textContent = error.message;
      }
    });
  }

  initialize().catch(function (error) {
    presetNote.textContent = error.message;
    insight.textContent = error.message;
  });
})();
