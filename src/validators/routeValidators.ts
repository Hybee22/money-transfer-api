import { body, param, query } from 'express-validator';

export const authValidators = {
  register: [
    body('username')
      .isString()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  login: [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
};

export const userValidators = {
  getUserById: [
    param('id').isUUID().withMessage('Invalid user ID'),
  ],
  getUserByUsername: [
    param('username').isString().notEmpty().withMessage('Username is required'),
  ],
  getNonAdminUsers: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ],
  getUserBalance: [
    param('id').isUUID().withMessage('Invalid user ID'),
  ],
};

export const transferValidators = {
  createTransfer: [
    body('recipientId').isUUID().withMessage('Invalid recipient ID'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number with at most two decimal places'),
  ],
  getTransfers: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('username').optional().isString().withMessage('Username must be a string'),
    query('transferType').optional().isIn(['TRANSFER', 'FUNDING']).withMessage('Invalid transfer type'),
  ],
  fundUserAccount: [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number with at most two decimal places'),
  ],
};
