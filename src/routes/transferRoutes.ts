import express, { RequestHandler } from "express";
import { TransferController } from "../controllers/transferController";
import { authenticateToken, authenticateAdminToken } from "../middleware/auth";
import { transferValidators } from "../validators/routeValidators";
import { validate } from "../middleware/validate";

// Create an Express router for handling transfer-related routes
const router = express.Router();

// Initialize the TransferController
// This controller contains the logic for transfer operations
const transferController = new TransferController();

// POST /
// Create a new transfer
// Requires user authentication
router.post(
  "/",
  authenticateToken,
  transferValidators.createTransfer,
  validate,
  transferController.createTransfer as RequestHandler
);

// GET /admin
// Retrieve all transfers (admin only)
// Requires admin authentication
router.get(
  "/admin",
  authenticateAdminToken,
  transferValidators.getTransfers,
  validate,
  transferController.getTransfers as RequestHandler
);

// GET /user
// Retrieve transfers for the authenticated user
// Requires user authentication
router.get(
  "/user",
  authenticateToken,
  transferValidators.getTransfers,
  validate,
  transferController.getUserTransfers as RequestHandler
);

// POST /funding
// Fund a user's account (admin only)
// Requires admin authentication
router.post(
  "/funding",
  authenticateAdminToken,
  transferValidators.fundUserAccount,
  validate,
  transferController.fundUserAccount as RequestHandler
);

// Export the router as 'transferRouter' for use in the main application
export { router as transferRouter };
