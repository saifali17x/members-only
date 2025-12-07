import { body, validationResult } from "express-validator";

// Validation middleware function
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.render(
      req.route.path.includes("signup")
        ? "auth/signup"
        : req.route.path.includes("login")
        ? "auth/login"
        : req.route.path.includes("join")
        ? "membership/join"
        : "messages/create",
      {
        error: firstError,
        formData: req.body,
      }
    );
  }
  next();
};

// Signup validation rules
export const signupValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .escape(),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

// Login validation rules
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Join club validation rules
export const joinClubValidation = [
  body("passcode")
    .trim()
    .notEmpty()
    .withMessage("Passcode is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Invalid passcode format"),
];

// Create message validation rules
export const createMessageValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters")
    .escape(),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be between 10 and 5000 characters")
    .escape(),
];
