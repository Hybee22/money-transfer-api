import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle errors with default status code and message', () => {
    const error = new Error();
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
      errors: undefined,
      stack: undefined,
    });
  });

  it('should handle errors with custom status code and message', () => {
    const error: any = new Error('Custom error message');
    error.statusCode = 400;
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error message',
      errors: undefined,
      stack: undefined,
    });
  });

  it('should include errors object if present', () => {
    const error: any = new Error('Validation error');
    error.statusCode = 422;
    error.errors = { field1: 'Invalid input', field2: 'Required field' };
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation error',
      errors: { field1: 'Invalid input', field2: 'Required field' },
      stack: undefined,
    });
  });

  it('should include stack trace in development environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Development error');
    error.stack = 'Error stack trace';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Development error',
      errors: undefined,
      stack: 'Error stack trace',
    });

    // Restore the original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not include stack trace in production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Production error');
    error.stack = 'Error stack trace';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Production error',
      errors: undefined,
      stack: undefined,
    });

    // Restore the original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});
