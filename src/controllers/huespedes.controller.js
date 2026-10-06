import db from "../config/faribase.js";
import { supabase } from "../config/supabase.js";
// ==========================================
// REGISTRAR HUÉSPED
// POST /api/huespedes
// ==========================================

export const registrarHuesped = async (req, res) => {
    try {

        const {
            cedula_pasaporte,
            correo,
            lugar_origen,
            primer_apellido,
            primer_nombre,
            segundo_apellido,
            segundo_nombre,
            telefono
        } = req.body || {};


        // ==========================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // ==========================================

        if (
            !cedula_pasaporte ||
            !lugar_origen ||
            !primer_apellido ||
            !primer_nombre
        ) {
            return res.status(400).json({
                mensaje:
                    "Los campos cedula_pasaporte, lugar_origen, primer_apellido y primer_nombre son obligatorios."
            });
        }


        // ==========================================
        // CREAR ID DEL HUÉSPED
        // ==========================================

        const idHuesped = `HUE-${String(Date.now()).slice(-6)}`;


        // ==========================================
        // REFERENCIA AL DOCUMENTO
        // ==========================================

        const docRef = db
            .collection("huespedes")
            .doc(idHuesped);


        // ==========================================
        // GUARDAR HUÉSPED
        // ==========================================

        await docRef.set({

            cedula_pasaporte,

            correo: correo || "",

            lugar_origen,

            primer_apellido,

            primer_nombre,

            segundo_apellido: segundo_apellido || "",

            segundo_nombre: segundo_nombre || "",

            telefono: telefono || "",

            fecha_registro: new Date().toISOString()

        });


        // ==========================================
        // RESPUESTA
        // ==========================================

        res.status(201).json({

            mensaje: "¡Huésped registrado con éxito!",

            id: idHuesped

        });

    } catch (error) {

        console.error(
            "Error al registrar huésped:",
            error
        );

        res.status(500).json({

            mensaje: "Error al registrar el huésped.",

            error: error.message

        });
    }
};



// ==========================================
// OBTENER TODOS LOS HUÉSPEDES
// GET /api/huespedes
// ==========================================

export const getHuespedes = async (req, res) => {

    try {

        const snapshot = await db
            .collection("huespedes")
            .get();


        const huespedes = snapshot.docs.map((doc) => ({

            id: doc.id,

            ...doc.data()

        }));


        res.status(200).json(huespedes);

    } catch (error) {

        console.error(
            "Error al obtener huéspedes:",
            error
        );

        res.status(500).json({

            mensaje: "Error al obtener los huéspedes.",

            error: error.message

        });
    }
};



// ==========================================
// OBTENER UN HUÉSPED
// GET /api/huespedes/:id
// ==========================================

export const getHuesped = async (req, res) => {

    try {

        const { id } = req.params;


        const docRef = db
            .collection("huespedes")
            .doc(id);


        const doc = await docRef.get();


        if (!doc.exists) {

            return res.status(404).json({

                mensaje: "Huésped no encontrado."

            });
        }


        res.status(200).json({

            id: doc.id,

            ...doc.data()

        });

    } catch (error) {

        console.error(
            "Error al obtener huésped:",
            error
        );

        res.status(500).json({

            mensaje: "Error al obtener el huésped.",

            error: error.message

        });
    }
};



// ==========================================
// ACTUALIZAR HUÉSPED
// PUT /api/huespedes/:id
// ==========================================

export const actualizarHuesped = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            cedula_pasaporte,
            correo,
            lugar_origen,
            primer_apellido,
            primer_nombre,
            segundo_apellido,
            segundo_nombre,
            telefono
        } = req.body || {};


        // ==========================================
        // VALIDAR CAMPOS
        // ==========================================

        if (
            !cedula_pasaporte ||
            !lugar_origen ||
            !primer_apellido ||
            !primer_nombre
        ) {

            return res.status(400).json({

                mensaje:
                    "Los campos cedula_pasaporte, lugar_origen, primer_apellido y primer_nombre son obligatorios."

            });
        }


        // ==========================================
        // REFERENCIA
        // ==========================================

        const docRef = db
            .collection("huespedes")
            .doc(id);


        // ==========================================
        // COMPROBAR EXISTENCIA
        // ==========================================

        const doc = await docRef.get();


        if (!doc.exists) {

            return res.status(404).json({

                mensaje: "Huésped no encontrado."

            });
        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        await docRef.update({

            cedula_pasaporte,

            correo: correo || "",

            lugar_origen,

            primer_apellido,

            primer_nombre,

            segundo_apellido:
                segundo_apellido || "",

            segundo_nombre:
                segundo_nombre || "",

            telefono: telefono || ""

        });


        res.status(200).json({

            mensaje:
                "¡Huésped actualizado con éxito!",

            id

        });

    } catch (error) {

        console.error(
            "Error al actualizar huésped:",
            error
        );

        res.status(500).json({

            mensaje:
                "Error al actualizar el huésped.",

            error: error.message

        });
    }
};



// ==========================================
// ELIMINAR HUÉSPED
// DELETE /api/huespedes/:id
// ==========================================

export const eliminarHuesped = async (req, res) => {

    try {

        const { id } = req.params;


        const docRef = db
            .collection("huespedes")
            .doc(id);


        const doc = await docRef.get();


        if (!doc.exists) {

            return res.status(404).json({

                mensaje:
                    "Huésped no encontrado."

            });
        }


        await docRef.delete();


        res.status(200).json({

            mensaje:
                "Huésped eliminado con éxito.",

            id

        });

    } catch (error) {

        console.error(
            "Error al eliminar huésped:",
            error
        );

        res.status(500).json({

            mensaje:
                "Error al eliminar el huésped.",

            error: error.message

        });
    }
};