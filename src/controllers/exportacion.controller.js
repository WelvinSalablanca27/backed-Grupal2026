import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import db from "../firebase.js";

const COLECCION = "huespedes";

const obtenerHuespedes = async () => {
  const snapshot = await db.collection(COLECCION).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const CAMPOS = [
  "cedula_pasaporte",
  "primer_nombre",
  "segundo_nombre",
  "primer_apellido",
  "segundo_apellido",
  "correo",
  "telefono",
  "lugar_origen",
];

const nombreCompleto = (h) => {
  return [
    h.primer_nombre,
    h.segundo_nombre,
    h.primer_apellido,
    h.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");
};

// ======================================
// 1. EXPORTAR HUÉSPEDES A CSV
// ======================================
export const exportarHuespedesCSV = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();

    const escapar = (valor) => {
      if (valor === null || valor === undefined) return "";
      const str = String(valor);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const encabezados = [
      "ID",
      "Cédula/Pasaporte",
      "Primer Nombre",
      "Segundo Nombre",
      "Primer Apellido",
      "Segundo Apellido",
      "Correo",
      "Teléfono",
      "Lugar de Origen",
    ];

    const lineas = [encabezados.join(",")];

    huespedes.forEach((h) => {
      const fila = [
        escapar(h.id),
        escapar(h.cedula_pasaporte),
        escapar(h.primer_nombre),
        escapar(h.segundo_nombre),
        escapar(h.primer_apellido),
        escapar(h.segundo_apellido),
        escapar(h.correo),
        escapar(h.telefono),
        escapar(h.lugar_origen),
      ];
      lineas.push(fila.join(","));
    });

    const csvContent = lineas.join("\n");
    const nombreArchivo = `huespedes-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    res.write("\uFEFF");
    res.end(csvContent);
  } catch (error) {
    console.error("Error al exportar huéspedes a CSV:", error);
    res.status(500).json({
      mensaje: "Error al generar el archivo CSV de huéspedes.",
      error: error.message,
    });
  }
};

// ======================================
// 2. EXPORTAR HUÉSPEDES A PDF
// ======================================
export const exportarHuespedesPDF = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "Listado de Huéspedes - Hotel Posada El Recuerdo",
        Author: "Sistema del Hotel",
      },
    });

    const nombreArchivo = `huespedes-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);

    doc.pipe(res);

    const colorPrincipal = "#4472C4";
    const colorTexto = "#333333";

    // Título
    doc
      .fontSize(20)
      .fillColor(colorPrincipal)
      .font("Helvetica-Bold")
      .text("Hotel Posada El Recuerdo", { align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(14)
      .fillColor(colorTexto)
      .text("Listado General de Huéspedes", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-NI")} | Total: ${huespedes.length}`, {
        align: "center",
      });

    doc.moveDown(1.5);

    if (huespedes.length === 0) {
      doc.fontSize(11).fillColor("#666").text("No hay huéspedes registrados.");
    } else {
      huespedes.forEach((h, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(11)
          .fillColor(colorPrincipal)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${nombreCompleto(h) || "Sin nombre"}`);

        doc
          .fontSize(10)
          .fillColor(colorTexto)
          .font("Helvetica")
          .text(`Cédula/Pasaporte: ${h.cedula_pasaporte || "—"}`)
          .text(`Correo: ${h.correo || "—"}`)
          .text(`Teléfono: ${h.telefono || "—"}`)
          .text(`Lugar de origen: ${h.lugar_origen || "—"}`);

        doc.moveDown(0.8);
      });
    }

    // Pie de página
    const rangoPaginas = doc.bufferedPageRange();
    for (let i = 0; i < rangoPaginas.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor("#999999")
        .text(
          `Página ${i + 1} de ${rangoPaginas.count}  |  Hotel Posada El Recuerdo`,
          50,
          doc.page.height - 40,
          { align: "center", width: 495 }
        );
    }

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF de huéspedes:", error);
    if (!res.headersSent) {
      res.status(500).json({
        mensaje: "Error al generar el archivo PDF.",
        error: error.message,
      });
    }
  }
};

// ======================================
// 3. EXPORTAR HUÉSPEDES A EXCEL
// ======================================
export const exportarHuespedesExcel = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hotel Posada El Recuerdo";
    workbook.created = new Date();

    const hoja = workbook.addWorksheet("Huéspedes", {
      properties: { tabColor: { argb: "FF4472C4" } },
    });

    const estiloTitulo = {
      font: { bold: true, size: 14, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const estiloEncabezado = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center" },
    };

    hoja.mergeCells("A1:I1");
    hoja.getCell("A1").value = "🏨 LISTADO DE HUÉSPEDES - HOTEL POSADA EL RECUERDO";
    hoja.getCell("A1").style = estiloTitulo;
    hoja.getRow(1).height = 30;

    hoja.addRow([]);
    const headers = [
      "ID",
      "Cédula/Pasaporte",
      "Primer Nombre",
      "Segundo Nombre",
      "Primer Apellido",
      "Segundo Apellido",
      "Correo",
      "Teléfono",
      "Lugar de Origen",
    ];

    hoja.addRow(headers).eachCell((cell) => {
      cell.style = estiloEncabezado;
    });

    huespedes.forEach((h) => {
      hoja.addRow([
        h.id,
        h.cedula_pasaporte ?? "",
        h.primer_nombre ?? "",
        h.segundo_nombre ?? "",
        h.primer_apellido ?? "",
        h.segundo_apellido ?? "",
        h.correo ?? "",
        h.telefono ?? "",
        h.lugar_origen ?? "",
      ]);
    });

    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 20;
    hoja.getColumn(3).width = 18;
    hoja.getColumn(4).width = 18;
    hoja.getColumn(5).width = 18;
    hoja.getColumn(6).width = 18;
    hoja.getColumn(7).width = 28;
    hoja.getColumn(8).width = 16;
    hoja.getColumn(9).width = 22;

    const nombreArchivo = `huespedes-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar Excel de huéspedes:", error);
    res.status(500).json({
      mensaje: "Error al generar el archivo Excel.",
      error: error.message,
    });
  }
};

// ======================================
// 4. EXPORTAR HUÉSPEDES A TXT (LISTA)
// ======================================
export const exportarHuespedesLista = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();

    if (huespedes.length === 0) {
      return res.status(200).type("text/plain").send("No hay huéspedes registrados.");
    }

    const lineas = huespedes.map((h, i) => {
      return [
        `${i + 1}. ${nombreCompleto(h) || "Sin nombre"}`,
        `   ID: ${h.id}`,
        `   Cédula/Pasaporte: ${h.cedula_pasaporte || "—"}`,
        `   Correo: ${h.correo || "—"}`,
        `   Teléfono: ${h.telefono || "—"}`,
        `   Lugar de origen: ${h.lugar_origen || "—"}`,
        "",
      ].join("\n");
    });

    const contenido =
      `HOTEL POSADA EL RECUERDO - LISTADO DE HUÉSPEDES (${huespedes.length})\n` +
      `Generado: ${new Date().toLocaleString("es-NI")}\n` +
      `${"─".repeat(45)}\n\n` +
      lineas.join("\n");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="huespedes-lista.txt"');
    res.send(contenido);
  } catch (error) {
    console.error("Error al exportar lista de huéspedes:", error);
    res.status(500).json({
      mensaje: "Error al generar el listado de huéspedes.",
      error: error.message,
    });
  }
};

// ======================================
// 5. EXPORTAR HUÉSPEDES A JSON
// ======================================
export const exportarHuespedesJSON = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();
    const jsonFormateado = JSON.stringify(huespedes, null, 2);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="huespedes.json"');
    res.send(jsonFormateado);
  } catch (error) {
    console.error("Error al exportar JSON de huéspedes:", error);
    res.status(500).json({
      mensaje: "Error al generar el JSON de huéspedes.",
      error: error.message,
    });
  }
};

// ======================================
// 6. EXPORTAR HUÉSPEDES A SQL
// ======================================
export const exportarHuespedesSQL = async (req, res) => {
  try {
    const huespedes = await obtenerHuespedes();

    const escaparSQL = (valor) => {
      if (valor === null || valor === undefined) return "NULL";
      if (typeof valor === "number") return valor;
      return `'${String(valor).replace(/'/g, "''")}'`;
    };

    let sql = `-- Script de inserción de huéspedes - Hotel Posada El Recuerdo\n`;
    sql += `-- Generado: ${new Date().toLocaleString("es-NI")}\n`;
    sql += `-- Total registros: ${huespedes.length}\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS huespedes (\n`;
    sql += `  id VARCHAR(50) PRIMARY KEY,\n`;
    sql += `  cedula_pasaporte VARCHAR(50),\n`;
    sql += `  primer_nombre VARCHAR(100) NOT NULL,\n`;
    sql += `  segundo_nombre VARCHAR(100),\n`;
    sql += `  primer_apellido VARCHAR(100) NOT NULL,\n`;
    sql += `  segundo_apellido VARCHAR(100),\n`;
    sql += `  correo VARCHAR(150),\n`;
    sql += `  telefono VARCHAR(30),\n`;
    sql += `  lugar_origen VARCHAR(150)\n`;
    sql += `);\n\n`;

    if (huespedes.length === 0) {
      sql += `-- No hay registros para insertar\n`;
    } else {
      huespedes.forEach((h) => {
        sql += `INSERT INTO huespedes (id, cedula_pasaporte, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, telefono, lugar_origen) VALUES (\n`;
        sql += `  ${escaparSQL(h.id)},\n`;
        sql += `  ${escaparSQL(h.cedula_pasaporte)},\n`;
        sql += `  ${escaparSQL(h.primer_nombre)},\n`;
        sql += `  ${escaparSQL(h.segundo_nombre)},\n`;
        sql += `  ${escaparSQL(h.primer_apellido)},\n`;
        sql += `  ${escaparSQL(h.segundo_apellido)},\n`;
        sql += `  ${escaparSQL(h.correo)},\n`;
        sql += `  ${escaparSQL(h.telefono)},\n`;
        sql += `  ${escaparSQL(h.lugar_origen)}\n`;
        sql += `);\n\n`;
      });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="huespedes-insert.sql"');
    res.send(sql);
  } catch (error) {
    console.error("Error al exportar SQL de huéspedes:", error);
    res.status(500).json({
      mensaje: "Error al generar el script SQL.",
      error: error.message,
    });
  }
};