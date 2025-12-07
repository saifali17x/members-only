import express from "express";
import * as controller from "../controllers/controller.js";
import {
  createMessageValidation,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Message routes
router.get("/", controller.getAllMessages);
router.get("/new", controller.getCreateMessage);
router.post(
  "/new",
  createMessageValidation,
  handleValidationErrors,
  controller.createMessage
);
router.get("/:id", controller.getMessageById);
router.post("/:id/delete", controller.deleteMessage);

export default router;
