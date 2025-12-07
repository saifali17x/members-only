import express from "express";
import passport from "passport";
import * as controller from "../controllers/controller.js";
import {
  signupValidation,
  loginValidation,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Auth routes
router.get("/signup", controller.getSignup);
router.post(
  "/signup",
  signupValidation,
  handleValidationErrors,
  controller.postSignup
);
router.get("/login", controller.getLogin);
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);
router.get("/logout", controller.getLogout);

export default router;
