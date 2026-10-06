import { Router } from "express";
import {
    getHuespedes,
    registrarHuesped
} from "../controllers/huespedes.controller.js";

const router = Router();

router.get("/", getHuespedes);

router.post("/", registrarHuesped);

export default router;