import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticas.controller.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";
import { 
  exportarEstadisticasExcel, 
  exportarEstadisticasPDF, 
  exportarHuespedesCSV, 
  exportarHuespedesLista, 
  exportarHuespedesJSON, 
  exportarHuespedesSQL 
} from "../controllers/exportacion.controller.js";

const router = express.Router();

router.use(capturarInfoSolicitud);

// Estadísticas generales del hotel en JSON
router.get("/estadisticas", obtenerEstadisticas);

// Exportar estadísticas y reportes de huéspedes
router.get("/estadisticas/excel", exportarEstadisticasExcel);
router.get("/estadisticas/pdf", exportarEstadisticasPDF);
router.get("/estadisticas/csv", exportarHuespedesCSV);

// Rutas de listados adicionales
router.get("/lista", exportarHuespedesLista);
router.get("/json", exportarHuespedesJSON);
router.get("/sql", exportarHuespedesSQL);

export default router;