const fetch = require("node-fetch");

module.exports = async function () {
  try {
    const [kpRes, windRes, magRes, fluxRes] = await Promise.all([
      fetch("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"),
      fetch("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"),
      fetch("https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json"),
      fetch("https://services.swpc.noaa.gov/products/summary/10cm-flux.json"),
    ]);

    const kpData = await kpRes.json();
    const windData = await windRes.json();
    const magData = await magRes.json();
    const fluxData = await fluxRes.json();

    const latestKp = [...kpData].reverse().find((d) => d.kp_index != null);
    const latestWind = [...windData].reverse().find((d) => d.speed != null);
    const latestMag = [...magData].reverse().find((d) => d.bt != null);

    const kp = latestKp ? parseFloat(latestKp.kp_index).toFixed(1) : "N/A";
    const wind = latestWind ? Math.round(latestWind.speed) : "N/A";
    const bt = latestMag ? parseFloat(latestMag.bt).toFixed(1) : "N/A";
    const bz = latestMag ? parseFloat(latestMag.bz_gsm).toFixed(1) : "N/A";
    const flux = fluxData && fluxData.Flux ? fluxData.Flux : "N/A";

    return {
      kp,
      wind,
      bt,
      bz,
      flux,
      lastUpdated: new Date().toUTCString(),
    };
  } catch (err) {
    console.warn("[spaceweather] Fetch failed:", err.message);
    return {
      kp: "N/A",
      wind: "N/A",
      bt: "N/A",
      bz: "N/A",
      flux: "N/A",
      lastUpdated: new Date().toUTCString(),
    };
  }
};
