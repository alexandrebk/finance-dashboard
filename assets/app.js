const COLORS = ["#4f9cf9", "#f0a742", "#f85149", "#3fb950", "#a371f7", "#2dd4bf", "#f472b6"];
const TEXT = "#e6e9ef";
const MUTED = "#8b95a5";
const GRID = "#2a3340";

function percentOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: TEXT } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label} : ${ctx.parsed.y}%` } },
    },
    scales: {
      x: { ticks: { color: MUTED, maxRotation: 0, autoSkip: true }, grid: { color: GRID } },
      y: { ticks: { color: MUTED, callback: (value) => `${value}%` }, grid: { color: GRID } },
    },
  };
}

function renderLastUpdate(isoString) {
  const date = new Date(isoString);
  document.getElementById("last-update").textContent =
    `Dernière mise à jour : ${date.toLocaleString("fr-FR")}`;
}

function renderPolicyHistory(policy) {
  const datasets = Object.entries(policy.banks).map(([bank, series], index) => ({
    label: bank,
    data: series,
    borderColor: COLORS[index % COLORS.length],
    backgroundColor: COLORS[index % COLORS.length],
    stepped: true,
    pointRadius: 0,
  }));
  new Chart(document.getElementById("chart-policy-history"), {
    type: "line",
    data: { labels: policy.dates, datasets },
    options: percentOptions(),
  });
}

function currentValue(countryData, maturity) {
  const series = countryData[maturity];
  return series[series.length - 1];
}

const MATURITY_YEARS = { "6M": 0.5, "1Y": 1, "2Y": 2, "3Y": 3, "4Y": 4, "5Y": 5, "10Y": 10, "30Y": 30 };

function renderSovereignCurve(sovereign) {
  const years = sovereign.maturities.map((maturity) => MATURITY_YEARS[maturity]);
  const labelByYear = Object.fromEntries(sovereign.maturities.map((maturity) => [MATURITY_YEARS[maturity], maturity]));

  const datasets = Object.entries(sovereign.countries).map(([country, countryData], index) => ({
    label: country,
    data: sovereign.maturities.map((maturity) => ({ x: MATURITY_YEARS[maturity], y: currentValue(countryData, maturity) })),
    borderColor: COLORS[index % COLORS.length],
    backgroundColor: COLORS[index % COLORS.length],
    tension: 0.3,
    spanGaps: true,
  }));

  new Chart(document.getElementById("chart-sovereign-curve"), {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { labels: { color: TEXT } },
        tooltip: {
          callbacks: {
            title: (items) => labelByYear[items[0].parsed.x] ?? `${items[0].parsed.x}Y`,
            label: (ctx) => `${ctx.dataset.label} : ${ctx.parsed.y}%`,
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: 0,
          afterBuildTicks: (axis) => { axis.ticks = years.map((value) => ({ value })); },
          ticks: { color: MUTED, callback: (value) => labelByYear[value] ?? value },
          grid: { color: GRID },
        },
        y: { ticks: { color: MUTED, callback: (value) => `${value}%` }, grid: { color: GRID } },
      },
    },
  });
}

function setupSovereignHistory(sovereign) {
  const countrySelect = document.getElementById("select-country");
  const maturitySelect = document.getElementById("select-maturity");

  Object.keys(sovereign.countries).forEach((country) => {
    countrySelect.add(new Option(country, country));
  });
  sovereign.maturities.forEach((maturity) => {
    maturitySelect.add(new Option(maturity, maturity));
  });
  maturitySelect.value = sovereign.maturities.includes("10Y") ? "10Y" : sovereign.maturities[0];

  const chart = new Chart(document.getElementById("chart-sovereign-history"), {
    type: "line",
    data: { labels: sovereign.dates, datasets: [] },
    options: percentOptions(),
  });

  function update() {
    const country = countrySelect.value;
    const maturity = maturitySelect.value;
    chart.data.datasets = [{
      label: `${country} ${maturity}`,
      data: sovereign.countries[country][maturity],
      borderColor: COLORS[0],
      backgroundColor: COLORS[0],
      tension: 0.2,
      pointRadius: 0,
    }];
    chart.update();
  }

  countrySelect.addEventListener("change", update);
  maturitySelect.addEventListener("change", update);
  update();
}

async function loadJson(path) {
  const response = await fetch(path);
  return response.json();
}

async function main() {
  try {
    const [meta, policy, sovereign] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson("data/policy_history.json"),
      loadJson("data/sovereign_history.json"),
    ]);
    renderLastUpdate(meta.last_update);
    renderPolicyHistory(policy);
    renderSovereignCurve(sovereign);
    setupSovereignHistory(sovereign);
  } catch (error) {
    console.error("Impossible de charger les données :", error);
  }
}

main();
