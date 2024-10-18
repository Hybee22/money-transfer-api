import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, authenticateAdminToken } from '../../src/middleware/auth';
import { User, UserRole } from '../../src/entities/User';

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', async () => {
      await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if a valid token is provided', async () => {
      const mockUser: Partial<User> = { id: '1', username: 'testuser', role: UserRole.USER };
      mockRequest.headers = { authorization: 'Bearer valid_token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    });
  });

  describe('authenticateAdminToken', () => {
    it('should return 401 if no token is provided', async () => {
      await authenticateAdminToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should call next() if a valid admin token is provided', async () => {
      const mockAdmin: Partial<User> = { id: '1', username: 'admin', role: UserRole.ADMIN };
      mockRequest.headers = { authorization: 'Bearer valid_admin_token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockAdmin);
      });

      await authenticateAdminToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockAdmin);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 403 if token is for a non-admin user', async () => {
      const mockUser: Partial<User> = { id: '2', username: 'user', role: UserRole.USER };
      mockRequest.headers = { authorization: 'Bearer valid_user_token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      await authenticateAdminToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: Admin access required' });
    });

    it('should return 403 if token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      await authenticateAdminToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    });
  });
});
