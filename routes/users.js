import express from "express";
import * as controller from "../controllers/controller.js";

const router = express.Router();

// User routes
router.get("/profile", controller.getUserProfile);

export default router;
