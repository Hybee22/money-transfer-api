import winston from 'winston';

/**
 * Custom logger configuration using winston.
 * This logger is set up to log messages to the console and two separate files:
 * - error.log: for error level messages
 * - combined.log: for all log levels
 */
const logger = winston.createLogger({
  /**
   * The minimum log level to record.
   */
  level: 'info',

  /**
   * The format for log messages.
   * Combines timestamp and JSON formatting.
   */
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  /**
   * An array of transports (output destinations) for the logger.
   */
  transports: [
    /**
     * Console transport: Outputs log messages to the console.
     */
    new winston.transports.Console(),

    /**
     * File transport: Outputs error level messages to 'error.log'.
     */
    new winston.transports.File({ filename: 'error.log', level: 'error' }),

    /**
     * File transport: Outputs all log messages to 'combined.log'.
     */
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
