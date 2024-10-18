import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import logger from './utils/logger';

// Load environment variables from .env file
dotenv.config();

/**
 * The port number on which the server will listen.
 * Defaults to 3000 if PORT is not set in the environment.
 */
const PORT = process.env.PORT ?? 3000;

/**
 * Starts the server and initializes the database connection.
 * This function handles the startup process for the application.
 * 
 * @async
 * @throws {Error} If there's an issue connecting to the database or starting the server.
 */
const startServer = async () => {
  try {
    // Attempt to connect to the database
    await connectDatabase();
    logger.info('Connected to database');

    // Start the Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

/**
 * Initiates the server startup process.
 * This is the entry point of the application.
 */
startServer();
