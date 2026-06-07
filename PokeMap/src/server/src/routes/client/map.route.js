import express from "express";
import * as mapController from "../../controllers/client/map.controller.js";
import { verifyToken } from "../../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/state", verifyToken, mapController.getMapState);
router.post("/state", verifyToken, mapController.saveMapState);
router.delete("/state", verifyToken, mapController.clearMapState);

export default router;

