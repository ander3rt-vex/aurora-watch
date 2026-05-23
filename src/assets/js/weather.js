/* Aurora Watch — live space weather updater
   Fetches fresh NOAA SWPC data client-side every 5 minutes */

const NOAA = {
  kp:   "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
  wind: "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
  mag:  "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
  flux: "https://services.swpc.noaa.gov/products/summary/10cm-flux.json",
};

function kpClass(kp) {
  const v = parseFloat(kp);
  if (isNaN(v)) return "";
  if (v >= 7) return "kp-high";
  if (v >= 5) return "kp-mid";
  return "kp-low";
}

function setAll(selector, text) {
  document.querySelectorAll(selector).forEach(el => { el.textContent = text; });
}

function setKpClass(kp) {
  const cls = kpClass(kp);
  document.querySelectorAll(".kp-dynamic").forEach(el => {
    el.classList.remove("kp-low", "kp-mid", "kp-high");
    if (cls) el.classList.add(cls);
  });
}

async function fetchWeather() {
  try {
    const [kpRes, windRes, magRes, fluxRes] = await Promise.all([
      fetch(NOAA.kp),
      fetch(NOAA.wind),
      fetch(NOAA.mag),
      fetch(NOAA.flux),
    ]);

    const kpData   = await kpRes.json();
    const windData = await windRes.json();
    const magData  = await magRes.json();
    const fluxData = await fluxRes.json();

    const latestKp   = [...kpData].reverse().find(d => d.kp_index != null);
    const latestWind = [...windData].reverse().find(d => d.speed != null);
    const latestMag  = [...magData].reverse().find(d => d.bt != null);

    if (latestKp) {
      const kp = parseFloat(latestKp.kp_index).toFixed(1);
      setAll(".kp-dynamic", kp);
      setKpClass(kp);
    }

    if (latestWind) {
      const wind = Math.round(latestWind.speed);
      document.querySelectorAll(".wind-dynamic").forEach(el => {
        el.innerHTML = wind + ' <small>km/s</small>';
      });
      const windBarEl = document.getElementById("wind-bar-val");
      if (windBarEl) windBarEl.textContent = wind + " km/s";
    }

    if (latestMag) {
      const bt = parseFloat(latestMag.bt).toFixed(1);
      const bz = parseFloat(latestMag.bz_gsm).toFixed(1);
      setAll(".bt-dynamic", bt);
      setAll(".bz-dynamic", bz);
      const bzBar = document.getElementById("bz-bar-val");
      if (bzBar) bzBar.textContent = bz + " nT";
    }

    if (fluxData && fluxData.Flux) {
      document.querySelectorAll(".flux-dynamic").forEach(el => {
        el.innerHTML = fluxData.Flux + ' <small>sfu</small>';
      });
    }

  } catch (err) {
    console.warn("[Aurora Watch] Live weather update failed:", err.message);
  }
}

fetchWeather();
setInterval(fetchWeather, 5 * 60 * 1000);
