import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import db from "./src/config/faribase.js"; // Para el registro de la bitácora / auditoría
import apiRouter from "./src/routes/index.js";

const app = express();

// ==========================================
// MIDDLEWARES GENERALES
// ==========================================
app.use(cors()); // Permite peticiones desde el frontend

// 💡 Aumentar el límite del body parser (por si se envían fotos, JSON grandes, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// RATE LIMIT PARA RUTA DE HUÉSPEDES
// ==========================================
const limiterHuespedes = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Límite de peticiones por minuto (ajustable según necesidad)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.",
  },
  handler: async (req, res, next, options) => {
    try {
      await db.collection("auditoria_huespedes").add({
        accion: "rate_limit_bloqueado",
        fecha: new Date().toISOString(),
        ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip,
        userAgent: req.headers["user-agent"],
        ruta: req.originalUrl,
        metodo: req.method,
      });
    } catch (e) {
      console.error("Error al registrar auditoría de rate limit:", e);
    }
    res.status(options.statusCode).json(options.message);
  },
});

// ==========================================
// CONFIGURACIÓN DE RUTAS
// ==========================================

// Aplicar rate limit específicamente a las rutas críticas de huéspedes si lo deseas
app.use("/api/huespedes", limiterHuespedes);
app.use("/huespedes", limiterHuespedes);

// Rutas principales centralizadas (ej. /api/huespedes, /api/estadisticas, etc.)
app.use('/api', apiRouter);

// O si prefieres montarlas directo (según cómo tengas estructurado tu proyecto):
// app.use(huespedesRoutes);
// app.use(estadisticasRoutes);
// app.use(climaRoutes);

// ==========================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ==========================================
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no registrada en Hotel Posada El Recuerdo." });
});

export default app;