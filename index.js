const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Habilitamos CORS para que tu Angular alojado en Firebase pueda pedirle datos a este proxy
app.use(cors());

// Esta es la ruta que va a escuchar tu proxy
app.get("/api/football/*", async (req, res) => {
  try {
    // Capturamos el endpoint exacto que querés consultar (ej: fixtures, leagues, etc)
    const endpoint = req.params[0];

    // Hacemos la petición a la API real de deportes
    const response = await axios({
      method: "GET",
      url: `https://v3.football.api-sports.io/${endpoint}`,
      headers: {
        // ACA ESTA LA MAGIA: Tu llave se lee del entorno, no queda visible en la web
        "x-apisports-key": process.env.API_SPORTS_KEY,
        "x-apisports-host": "v3.football.api-sports.io",
      },
      // Le pasamos cualquier parámetro que haya mandado tu Angular (ej: ?date=2026-06-18)
      params: req.query,
    });

    // Le devolvemos la info a tu Angular
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con la API de fútbol" });
  }
});

// Arrancamos el servidor (necesario para probar en local)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));

module.exports = app; // Vercel necesita esto
