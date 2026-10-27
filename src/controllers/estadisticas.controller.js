import db from "../firebase.js";

const COLECCION = "huespedes";

export const calcularEstadisticas = async () => {
  const snapshot = await db.collection(COLECCION).get();

  const huespedes = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (huespedes.length === 0) {
    return {
      total: 0,
      porLugarOrigen: {},
      porMes: {},
      huespedes,
    };
  }

  // Total de huéspedes
  const total = huespedes.length;

  // Distribución por lugar de origen
  const porLugarOrigen = {};
  huespedes.forEach((h) => {
    const origen = h.lugar_origen ? h.lugar_origen.trim() : "No especificado";
    porLugarOrigen[origen] = (porLugarOrigen[origen] || 0) + 1;
  });

  // Distribución por mes de registro (si tus documentos guardan fecha, de lo contrario puedes omitirlo o ajustarlo)
  const porMes = {};
  huespedes.forEach((h) => {
    if (!h.fecha) return;
    const fecha = new Date(h.fecha);
    if (!isNaN(fecha.getTime())) {
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      porMes[mes] = (porMes[mes] || 0) + 1;
    }
  });

  return {
    total,
    porLugarOrigen,
    porMes,
    huespedes, // Lista completa por si se necesita
  };
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();

    const { huespedes, ...resumen } = stats;

    res.status(200).json({
      mensaje: "Estadísticas del hotel generadas correctamente",
      ...resumen,
      // Detalle porcentual por lugar de origen
      detalleLugarOrigen: Object.entries(stats.porLugarOrigen).map(([origen, cantidad]) => ({
        origen,
        cantidad,
        porcentaje: stats.total > 0 ? Number(((cantidad / stats.total) * 100).toFixed(1)) : 0,
      })),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de huéspedes:", error);
    res.status(500).json({
      mensaje: "Error al generar las estadísticas de huéspedes.",
      error: error.message,
    });
  }
};