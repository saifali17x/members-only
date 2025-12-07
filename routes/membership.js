import express from "express";
import * as controller from "../controllers/controller.js";
import {
  joinClubValidation,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Membership routes
router.get("/join-club", controller.getJoinClub);
router.post(
  "/join-club",
  joinClubValidation,
  handleValidationErrors,
  controller.postJoinClub
);

export default router;
