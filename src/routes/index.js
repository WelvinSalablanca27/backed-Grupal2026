import { Router } from "express";
import huespedes from "./huespedes.routes.js";

const router = Router();

router.use("/huespedes", huespedes);

export default router;
