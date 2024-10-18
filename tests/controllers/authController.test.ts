import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../src/controllers/authController';
import { AuthService } from '../../src/services/authService';
import { AppError } from '../../src/utils/customErrors';

// Mock AuthService
jest.mock('../../src/services/authService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockUser = { id: '1', username: 'testuser' };
      mockRequest.body = { username: 'testuser', password: 'password123' };
      (AuthService.prototype.registerUser as jest.Mock).mockResolvedValue(mockUser);

      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.prototype.registerUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        id: '1',
        username: 'testuser',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error if registration fails', async () => {
      const error = new AppError('Registration failed', 400);
      mockRequest.body = { username: 'testuser', password: 'password123' };
      (AuthService.prototype.registerUser as jest.Mock).mockRejectedValue(error);

      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.prototype.registerUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const mockToken = 'mock.jwt.token';
      mockRequest.body = { username: 'testuser', password: 'password123' };
      (AuthService.prototype.authenticateUser as jest.Mock).mockResolvedValue(mockToken);

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.prototype.authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User logged in successfully',
        token: mockToken,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error if login fails', async () => {
      const error = new AppError('Invalid credentials', 401);
      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      (AuthService.prototype.authenticateUser as jest.Mock).mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(AuthService.prototype.authenticateUser).toHaveBeenCalledWith('testuser', 'wrongpassword');
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
