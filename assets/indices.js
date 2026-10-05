const TEXT = "#e6e9ef";
const MUTED = "#8b95a5";
const GRID = "#2a3340";
const COLORS = ["#4f9cf9", "#f0a742", "#f85149", "#3fb950", "#a371f7", "#2dd4bf", "#f472b6"];

function renderLastUpdate(isoString) {
  const date = new Date(isoString);
  document.getElementById("last-update").textContent =
    `Dernière mise à jour : ${date.toLocaleString("fr-FR")}`;
}

function renderBase100(canvasId, history) {
  const datasets = Object.entries(history.series).map(([name, series], index) => {
    const base = series.find((value) => value != null);
    return {
      label: name,
      data: series.map((value) => (value == null ? null : Number((value / base * 100).toFixed(2)))),
      prices: series,
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
      pointRadius: 0,
      tension: 0.2,
      spanGaps: true,
    };
  });
  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: { labels: history.dates, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: TEXT } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.dataset.label} : ${ctx.parsed.y} (${ctx.dataset.prices[ctx.dataIndex]})` },
        },
      },
      scales: {
        x: { ticks: { color: MUTED, maxRotation: 0, autoSkip: true }, grid: { color: GRID } },
        y: { ticks: { color: MUTED }, grid: { color: GRID } },
      },
    },
  });
}

function addOptgroup(select, label, names) {
  const group = document.createElement("optgroup");
  group.label = label;
  names.forEach((name) => group.appendChild(new Option(name, name)));
  select.appendChild(group);
}

function setupInstrumentHistory(indicesHistory, etfsHistory) {
  const registry = {};
  Object.entries(indicesHistory.series).forEach(([name, values]) => {
    registry[name] = { dates: indicesHistory.dates, values };
  });
  Object.entries(etfsHistory.series).forEach(([name, values]) => {
    registry[name] = { dates: etfsHistory.dates, values };
  });

  const select = document.getElementById("select-instrument");
  addOptgroup(select, "Indices", Object.keys(indicesHistory.series));
  addOptgroup(select, "ETF", Object.keys(etfsHistory.series));

  const chart = new Chart(document.getElementById("chart-instrument"), {
    type: "line",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: MUTED, maxRotation: 0, autoSkip: true }, grid: { color: GRID } },
        y: { ticks: { color: MUTED }, grid: { color: GRID } },
      },
    },
  });

  function update() {
    const { dates, values } = registry[select.value];
    chart.data.labels = dates;
    chart.data.datasets = [{
      label: select.value,
      data: values,
      borderColor: COLORS[0],
      backgroundColor: COLORS[0],
      pointRadius: 0,
      tension: 0.2,
      spanGaps: true,
    }];
    chart.update();
  }

  select.addEventListener("change", update);
  update();
}

async function loadJson(path) {
  const response = await fetch(path);
  return response.json();
}

async function main() {
  try {
    const [meta, indicesHistory, etfsHistory] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson("data/indices_history.json"),
      loadJson("data/etfs_history.json"),
    ]);
    renderLastUpdate(meta.last_update);
    renderBase100("chart-indices-history", indicesHistory);
    renderBase100("chart-etfs-history", etfsHistory);
    setupInstrumentHistory(indicesHistory, etfsHistory);
  } catch (error) {
    console.error("Impossible de charger les données :", error);
  }
}

main();
