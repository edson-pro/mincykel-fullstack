import express from "express";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  googleLogin,
  login,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/auth";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *
 *     GoogleLoginInput:
 *       type: object
 *       required:
 *         - token
 *         - platform
 *       properties:
 *         token:
 *           type: string
 *           description: Google OAuth token
 *         platform:
 *           type: string
 *           description: Platform identifier
 *
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - password
 *         - token
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *           description: New password
 *         token:
 *           type: string
 *           description: Reset password token
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 */
import {
  googleLoginSchema,
  emailLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailRegisterSchema,
} from "../validators/auth";
import { validateSchema } from "../middleware/validation.middleware";
import { authorization } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = express.Router();

// More strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per hour
  message: "Too many login attempts, please try again later",
  handler: function (req, res /*, next*/) {
    res
      .status(429)
      .json({ message: "Too many login attempts, please try again later" });
  },
});

router.post("/login", authLimiter, validateSchema(emailLoginSchema), login);

router.post("/register", validateSchema(emailRegisterSchema), register);

router.post("/google-login", validateSchema(googleLoginSchema), googleLogin);

router.get("/current", authorization, getCurrentUser);

router.post(
  "/forgot-password",
  validateSchema(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  validateSchema(resetPasswordSchema),
  resetPassword
);

// update user
router.put("/update-profile", authorization, updateProfile);

// change-password
router.put("/change-password", authorization, changePassword);

router.post("/refresh-token", refreshToken);

export default router;
