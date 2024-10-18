import { Request, Response, NextFunction } from "express";
import { UserController } from "../../src/controllers/userController";
import { UserService } from "../../src/services/userService";
import { AppError } from "../../src/utils/customErrors";
import { UserRole } from "../../src/entities/User";

jest.mock("../../src/services/userService");

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    userController = new UserController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        balance: 100,
        password: "hashedpassword",
        role: "user" as UserRole,
        sentTransfers: [],
        receivedTransfers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockRequest.params = { id: "1" };

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 404 when user not found", async () => {
      mockUserService.getUserById.mockResolvedValue(null);
      mockRequest.params = { id: "1" };

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });
  });

  // Similar tests for getUserByUsername and getNonAdminUsers...

  describe("getUserBalance", () => {
    it("should return balance for authorized user", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.user = {
        id: "1",
        username: "testuser",
        balance: 100,
        password: "hashedpassword",
        role: "user" as UserRole,
        sentTransfers: [],
        receivedTransfers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.getUserBalance.mockResolvedValue(100);

      await userController.getUserBalance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should throw error for unauthorized user", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.user = {
        id: "2",
        username: "user",
        balance: 100,
        password: "hashedpassword",
        role: "user" as UserRole,
        sentTransfers: [],
        receivedTransfers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userController.getUserBalance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
