import express from "express";
import { userRouter } from "./routes/userRoutes";
import { transferRouter } from "./routes/transferRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/authRoutes";
import logger from "./utils/logger";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * The main Express application instance.
 * This sets up middleware, routes, and error handling for the API.
 */
const app = express();

// Enable JSON parsing for incoming requests
app.use(express.json());

/**
 * Helmet middleware for security.
 */
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);

/**
 * Logging middleware.
 * Logs information about each incoming request.
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

/**
 * API routes.
 * Each router is mounted on a specific path.
 */

/**
 * User-related routes.
 * Handles operations like user registration, profile retrieval, etc.
 */
app.use("/api/users", userRouter);

/**
 * Transfer-related routes.
 * Handles operations like creating transfers, viewing transfer history, etc.
 */
app.use("/api/transfers", transferRouter);

/**
 * Authentication-related routes.
 * Handles operations like user login, token refresh, etc.
 */
app.use("/api/auth", authRouter);

/**
 * Global error handling middleware.
 * Catches and processes any errors that occur during request handling.
 */
app.use(errorHandler);


/**
 * Exports the configured Express application.
 * This can be imported and used in other files, particularly for starting the server.
 */
export default app;
