const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("El proxy de fútbol está activo y funcionando 🚀");
});

app.use("/api/football", async (req, res) => {
  try {
    const apiKey = process.env.API_SPORTS_KEY;

    // DETECTOR: Si Vercel está ciego y no lee la variable, frenamos acá
    if (!apiKey) {
      return res.status(500).json({
        error:
          "EL PROXY NO ESTA LEYENDO LA CLAVE DE VERCEL. Revisar Environment Variables.",
      });
    }

    const endpoint = req.url;

    const response = await axios({
      method: req.method,
      url: `https://v3.football.api-sports.io${endpoint}`,
      headers: {
        "x-apisports-key": apiKey,
        "x-rapidapi-key": apiKey, // Por si tu cuenta viene de RapidAPI
        "x-apisports-host": "v3.football.api-sports.io",
      },
    });

    // Cache-Control: diferenciado según si el endpoint es de partidos en vivo o no.
    // - Endpoints "live": caché corta (60s) porque los datos cambian frecuentemente.
    // - Resto (fixtures por fecha, standings, etc.): caché de 1 hora.
    const isLive = endpoint.includes("live") || endpoint.includes("fixture") && endpoint.includes("live");
    const cacheControl = isLive
      ? "s-maxage=60, stale-while-revalidate=300"
      : "s-maxage=3600, stale-while-revalidate=86400";

    res.set("Cache-Control", cacheControl);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con la API de fútbol" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));

module.exports = app;
