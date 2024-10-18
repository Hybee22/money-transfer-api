import express, { RequestHandler } from "express";
import { UserController } from "../controllers/userController";
import { authenticateToken, authenticateAdminToken } from "../middleware/auth";
import { userValidators } from "../validators/routeValidators";
import { validate } from "../middleware/validate";

// Create an Express router for handling user-related routes
const router = express.Router();

// Initialize the UserController
// This controller contains the logic for user operations
const userController = new UserController();

// GET /:id
// Retrieve a user by their ID
// Requires user authentication
router.get(
  "/:id",
  authenticateToken,
  userValidators.getUserById,
  validate,
  userController.getUserById as RequestHandler
);

// GET /username/:username
// Retrieve a user by their username
// Requires user authentication
router.get(
  "/username/:username",
  authenticateToken,
  userValidators.getUserByUsername,
  validate,
  userController.getUserByUsername as RequestHandler
);

// GET /
// Retrieve all non-admin users
// Requires admin authentication
router.get(
  "/",
  authenticateAdminToken,
  userValidators.getNonAdminUsers,
  validate,
  userController.getNonAdminUsers
);

// GET /balance/:id
// Retrieve the balance for a specific user
// Requires user authentication
router.get(
  "/balance/:id",
  authenticateToken,
  userValidators.getUserBalance,
  validate,
  userController.getUserBalance
);

// Export the router as 'userRouter' for use in the main application
export { router as userRouter };
