import express from "express";
import cors from "cors";
import huespedesRoutes from "./src/routes/huespedes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal de huéspedes
app.use("/api/huespedes", huespedesRoutes);

// Ruta principal para comprobar el servidor
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de Hotel Posada El Recuerdo funcionando correctamente."
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no registrada en Hotel Posada El Recuerdo."
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});