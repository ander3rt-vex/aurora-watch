/* Aurora Watch — live charts for the Info page
   Powered by Chart.js + NOAA SWPC JSON APIs */

Chart.defaults.color = "#ccc";
Chart.defaults.font.family = "'Karantina', sans-serif";
Chart.defaults.font.size = 14;

const PANEL_BG   = "#201d2c";
const GRID_COLOR = "rgba(255,255,255,0.08)";

/* colour-codes a Kp value */
function kpColor(v) {
  if (v >= 7) return "#ef14c6";
  if (v >= 5) return "#f5a623";
  return "#478f10";
}

/* format a UTC date string for axis labels */
function fmtUTC(isoString, opts) {
  return new Date(isoString.endsWith("Z") ? isoString : isoString + "Z")
    .toLocaleString("en-US", { timeZone: "UTC", ...opts });
}

/* ── Chart 1: Planetary Kp Index — 3-day history ─────────────────── */
async function renderKpChart() {
  const canvas = document.getElementById("kp-chart");
  if (!canvas) return;

  try {
    const res  = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
    const data = await res.json();

    /* 3-hourly data; last 24 entries = 72 hours */
    const rows   = data.slice(-24);
    const labels = rows.map(d => fmtUTC(d.time_tag, { month: "short", day: "numeric", hour: "2-digit", hour12: false }));
    const values = rows.map(d => parseFloat(d.Kp));
    const colors = values.map(kpColor);

    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Kp Index (3-hr)",
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0, max: 9,
            ticks: { stepSize: 1, color: "#ccc" },
            grid:  { color: GRID_COLOR },
            title: { display: true, text: "Kp", color: "#ccc" },
          },
          x: {
            ticks: { color: "#aaa", maxTicksLimit: 8, maxRotation: 40 },
            grid:  { color: "rgba(255,255,255,0.03)" },
          },
        },
        plugins: {
          legend: { labels: { color: "#fff" } },
          annotation: {
            annotations: {
              stormLine: {
                type: "line", yMin: 5, yMax: 5,
                borderColor: "#f5a623", borderWidth: 1, borderDash: [4, 4],
                label: { content: "G1 Storm", display: true, color: "#f5a623", position: "end", font: { size: 12 } },
              },
            },
          },
        },
      },
    });

  } catch (err) {
    canvas.closest(".chart-block__img-wrap").innerHTML =
      '<p class="chart-error">Kp chart unavailable — ' + err.message + "</p>";
  }
}

/* ── Chart 2: Solar Wind Speed + IMF Bz — last 24 hours ──────────── */
async function renderWindBzChart() {
  const canvas = document.getElementById("wind-chart");
  if (!canvas) return;

  try {
    const [windRes, magRes] = await Promise.all([
      fetch("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"),
      fetch("https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json"),
    ]);
    const windRaw = await windRes.json();
    const magRaw  = await magRes.json();

    /* sample every 10 min, last 144 points = 24 hours */
    const stride = 10;
    const wind = windRaw.filter((d, i) => i % stride === 0 && d.speed  !== null).slice(-144);
    const mag  = magRaw .filter((d, i) => i % stride === 0 && d.bz_gsm !== null).slice(-144);

    const labels    = wind.map(d => fmtUTC(d.time_tag, { hour: "2-digit", minute: "2-digit", hour12: false }));
    const windVals  = wind.map(d => d.speed);
    const bzVals    = mag.map(d => d.bz_gsm);

    new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Solar Wind (km/s)",
            data: windVals,
            borderColor: "#478f10",
            backgroundColor: "rgba(71,143,16,0.12)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: "yWind",
          },
          {
            label: "IMF Bz (nT)",
            data: bzVals,
            borderColor: "#ef14c6",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            yAxisID: "yBz",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
          yWind: {
            position: "left",
            ticks:  { color: "#478f10" },
            grid:   { color: GRID_COLOR },
            title:  { display: true, text: "Speed (km/s)", color: "#478f10" },
          },
          yBz: {
            position: "right",
            ticks:  { color: "#ef14c6" },
            grid:   { drawOnChartArea: false },
            title:  { display: true, text: "Bz (nT)", color: "#ef14c6" },
          },
          x: {
            ticks: { color: "#aaa", maxTicksLimit: 7, maxRotation: 0 },
            grid:  { color: "rgba(255,255,255,0.03)" },
          },
        },
        plugins: {
          legend: { labels: { color: "#fff" } },
        },
      },
    });

  } catch (err) {
    canvas.closest(".chart-block__img-wrap").innerHTML =
      '<p class="chart-error">Solar wind chart unavailable — ' + err.message + "</p>";
  }
}

renderKpChart();
renderWindBzChart();
