import express from "express";
import { AuthController } from "../controllers/authController";
import { authValidators } from "../validators/routeValidators";
import { validate } from "../middleware/validate";

// Create an Express router for authentication routes
const router = express.Router();

// Initialize the AuthController
const authController = new AuthController();

// POST /register - User registration endpoint
router.post("/register", authValidators.register, validate, authController.register);

// POST /login - User login endpoint
router.post("/login", authValidators.login, validate, authController.login);

// Export the router for use in the main application
export { router as authRouter };
