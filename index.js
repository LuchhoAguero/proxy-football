const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

// Ruta principal para que no tire error si alguien entra directo a la URL
app.get("/", (req, res) => {
  res.send("El proxy de fútbol está activo y funcionando 🚀");
});

// ACA ESTA EL ARREGLO: Cambiamos /* por /:endpoint(.*)
app.get("/api/football/:endpoint(.*)", async (req, res) => {
  try {
    // Ahora leemos la variable por el nombre que le pusimos arriba
    const endpoint = req.params.endpoint;

    const response = await axios({
      method: "GET",
      url: `https://v3.football.api-sports.io/${endpoint}`,
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY,
        "x-apisports-host": "v3.football.api-sports.io",
      },
      params: req.query,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con la API de fútbol" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));

module.exports = app;
