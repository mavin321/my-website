(function () {
  const api = {
    scenes: "/api/scientific-visuals/scenes/",
    run: "/api/scientific-visuals/run/",
  };

  const sceneList = document.getElementById("science-scene-list");
  const mainCanvas = document.getElementById("science-main-canvas");
  const projectionCanvas = document.getElementById("science-projection-canvas");
  const traceChart = document.getElementById("science-trace-chart");
  const sceneTitle = document.getElementById("science-scene-title");
  const insight = document.getElementById("science-insight");
  const playButton = document.getElementById("science-play-btn");
  const speedSelect = document.getElementById("science-speed");
  const toggleGrid = document.getElementById("science-toggle-grid");
  const toggleProjection = document.getElementById("science-toggle-projection");
  const toggleTrace = document.getElementById("science-toggle-trace");
  const toggleLabels = document.getElementById("science-toggle-labels");

  if (!sceneList || !mainCanvas || !projectionCanvas || !traceChart) {
    return;
  }

  const metrics = {
    scale: document.getElementById("science-metric-scale"),
    a: document.getElementById("science-metric-a"),
    b: document.getElementById("science-metric-b"),
    c: document.getElementById("science-metric-c"),
  };

  const state = {
    scenes: [],
    currentSceneId: null,
    currentScene: null,
    frameIndex: 0,
    playing: true,
    speed: 1,
    lastTimestamp: 0,
    frameAccumulator: 0,
    animationId: null,
    traceHistory: [],
  };

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Request failed");
    }
    return data;
  }

  function buildChart(svg, values, color) {
    const width = 520;
    const height = 340;
    const padding = { top: 20, right: 18, bottom: 30, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = Math.max(maxValue - minValue, 1e-6);
    const count = Math.max(values.length - 1, 1);

    const points = values
      .map((value, index) => {
        const x = padding.left + (index / count) * innerWidth;
        const y = padding.top + innerHeight - ((value - minValue) / range) * innerHeight;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

    svg.innerHTML =
      `<rect x="0" y="0" width="${width}" height="${height}" rx="24" class="chart-bg" />` +
      `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" class="chart-axis" />` +
      `<line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-axis" />` +
      `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
  }

  function sceneAccentColor(accent) {
    const map = {
      cyan: "#22d3ee",
      rose: "#fb7185",
      orange: "#fb923c",
      violet: "#a78bfa",
      amber: "#facc15",
      blue: "#60a5fa",
      emerald: "#34d399",
      teal: "#2dd4bf",
      red: "#f87171",
      sky: "#38bdf8",
      indigo: "#818cf8",
      pink: "#f472b6",
      lime: "#a3e635",
    };
    return map[accent] || "#22d3ee";
  }

  function intensityColor(intensity, accent) {
    const base = sceneAccentColor(accent);
    const alpha = 0.18 + 0.72 * Math.max(0, Math.min(intensity, 1));
    if (base.startsWith("#")) {
      const r = parseInt(base.slice(1, 3), 16);
      const g = parseInt(base.slice(3, 5), 16);
      const b = parseInt(base.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return base;
  }

  function renderSceneButtons() {
    sceneList.innerHTML = state.scenes
      .map(
        (scene) => `
          <button class="science-scene-card${scene.id === state.currentSceneId ? " is-active" : ""}" data-scene-id="${scene.id}" type="button">
            <span class="science-scene-accent science-accent-${scene.accent}"></span>
            <strong>${scene.label}</strong>
            <p>${scene.id.replaceAll("_", " ")}</p>
          </button>
        `
      )
      .join("");

    sceneList.querySelectorAll("[data-scene-id]").forEach((button) => {
      button.addEventListener("click", function () {
        loadScene(button.getAttribute("data-scene-id"));
      });
    });
  }

  function updateMetrics() {
    if (!state.currentScene) {
      return;
    }
    metrics.scale.textContent = state.currentScene.summary.scale.toFixed(2);
    metrics.a.textContent = state.currentScene.summary.metric_a.toFixed(2);
    metrics.b.textContent = state.currentScene.summary.metric_b.toFixed(2);
    metrics.c.textContent = state.currentScene.summary.metric_c.toFixed(2);
  }

  function renderProjection(frame) {
    const context = projectionCanvas.getContext("2d");
    if (!context) {
      return;
    }
    const width = projectionCanvas.width;
    const height = projectionCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.18 / Math.max(state.currentScene.summary.scale, 0.3);

    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(3, 7, 18, 0.98)";
    context.fillRect(0, 0, width, height);

    for (const point of frame) {
      const x = centerX + point.x * scale;
      const y = centerY - point.y * scale;
      context.fillStyle = intensityColor(point.intensity, state.currentScene.scene.accent);
      context.beginPath();
      context.arc(x, y, 1 + 3 * point.intensity, 0, Math.PI * 2);
      context.fill();
    }

    if (toggleLabels.checked) {
      context.fillStyle = "rgba(226, 232, 240, 0.9)";
      context.font = "12px Montserrat, sans-serif";
      context.fillText("orthographic x-y projection", 16, height - 14);
    }
  }

  function renderMain(frame) {
    const context = mainCanvas.getContext("2d");
    if (!context) {
      return;
    }
    const width = mainCanvas.width;
    const height = mainCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.2 / Math.max(state.currentScene.summary.scale, 0.3);
    const angle = state.frameIndex * 0.08;
    const cosY = Math.cos(angle);
    const sinY = Math.sin(angle);
    const cosX = Math.cos(0.48);
    const sinX = Math.sin(0.48);

    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(4, 10, 24, 0.98)");
    gradient.addColorStop(1, "rgba(2, 6, 18, 1)");
    context.fillStyle = gradient;
    context.beginPath();
    context.roundRect(0, 0, width, height, 26);
    context.fill();

    if (toggleGrid.checked) {
      context.strokeStyle = "rgba(148, 163, 184, 0.08)";
      context.lineWidth = 1;
      for (let x = 40; x < width; x += 36) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 40; y < height; y += 36) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
    }

    const projected = frame.map((point) => {
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const perspective = 1 / (1 + z2 / 5);
      return {
        x: centerX + x1 * scale * perspective,
        y: centerY - y1 * scale * perspective,
        z: z2,
        intensity: point.intensity,
      };
    });
    projected.sort((a, b) => a.z - b.z);

    for (const point of projected) {
      const radius = 1 + 4 * point.intensity;
      context.fillStyle = intensityColor(point.intensity, state.currentScene.scene.accent);
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }

    if (toggleProjection.checked) {
      context.strokeStyle = "rgba(226, 232, 240, 0.14)";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(36, centerY);
      context.lineTo(width - 36, centerY);
      context.moveTo(centerX, 36);
      context.lineTo(centerX, height - 36);
      context.stroke();
    }

    if (toggleLabels.checked) {
      context.fillStyle = "rgba(226, 232, 240, 0.88)";
      context.font = "13px Montserrat, sans-serif";
      context.fillText(state.currentScene.scene.label, 24, 34);
      context.fillText(`frame ${state.frameIndex + 1} / ${state.currentScene.meta.frame_count}`, 24, height - 20);
    }
  }

  function updateTrace(frame) {
    const avgIntensity = frame.reduce((sum, point) => sum + point.intensity, 0) / Math.max(frame.length, 1);
    state.traceHistory.push(avgIntensity);
    if (state.traceHistory.length > 48) {
      state.traceHistory.shift();
    }
    if (toggleTrace.checked) {
      buildChart(traceChart, state.traceHistory, sceneAccentColor(state.currentScene.scene.accent));
    } else {
      buildChart(traceChart, new Array(24).fill(0), "rgba(148, 163, 184, 0.35)");
    }
  }

  function updateInsight(frame) {
    const avgIntensity = frame.reduce((sum, point) => sum + point.intensity, 0) / Math.max(frame.length, 1);
    insight.textContent =
      `${state.currentScene.scene.label} is playing at ${Number(speedSelect.value).toFixed(1)}x. ` +
      `Average frame intensity is ${avgIntensity.toFixed(3)} and the scene scale is ${state.currentScene.summary.scale.toFixed(2)}.`;
  }

  function renderCurrentFrame() {
    if (!state.currentScene) {
      return;
    }
    const frame = state.currentScene.frames[state.frameIndex % state.currentScene.frames.length];
    renderMain(frame);
    renderProjection(frame);
    updateTrace(frame);
    updateMetrics();
    updateInsight(frame);
  }

  function tick(timestamp) {
    if (!state.currentScene) {
      state.animationId = requestAnimationFrame(tick);
      return;
    }
    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
    }
    const dt = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;

    if (state.playing) {
      state.frameAccumulator += dt * state.speed;
      if (state.frameAccumulator >= 80) {
        const stepCount = Math.floor(state.frameAccumulator / 80);
        state.frameAccumulator -= stepCount * 80;
        state.frameIndex = (state.frameIndex + stepCount) % state.currentScene.frames.length;
      }
    }

    renderCurrentFrame();
    state.animationId = requestAnimationFrame(tick);
  }

  async function loadScene(sceneId) {
    state.currentSceneId = sceneId;
    renderSceneButtons();
    sceneTitle.textContent = "Loading scene...";
    insight.textContent = "Loading native scene frames...";
    const data = await fetchJson(api.run, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scene_id: sceneId,
        frame_count: 32,
        points_per_frame: 180,
      }),
    });
    state.currentScene = data;
    state.frameIndex = 0;
    state.traceHistory = [];
    sceneTitle.textContent = data.scene.label;
    renderSceneButtons();
    renderCurrentFrame();
  }

  async function initialize() {
    const data = await fetchJson(api.scenes);
    state.scenes = data.scenes;
    renderSceneButtons();
    await loadScene(state.scenes[0].id);
    state.animationId = requestAnimationFrame(tick);
  }

  playButton.addEventListener("click", function () {
    state.playing = !state.playing;
    playButton.textContent = state.playing ? "Pause" : "Play";
  });

  speedSelect.addEventListener("change", function () {
    state.speed = Math.max(Number(speedSelect.value) || 1, 0.25);
  });

  [toggleGrid, toggleProjection, toggleTrace, toggleLabels].forEach((toggle) => {
    toggle.addEventListener("change", function () {
      renderCurrentFrame();
    });
  });

  initialize().catch(function (error) {
    insight.textContent = error.message;
  });
})();
