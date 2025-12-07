import express from "express";
import * as controller from "../controllers/controller.js";

const router = express.Router();

// Admin routes
router.get("/", controller.getAdminDashboard);

export default router;
