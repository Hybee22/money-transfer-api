import { AuthService } from "../../src/services/authService";
import { User, UserRole } from "../../src/entities/User";
import { AppDataSource } from "../../src/config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../src/utils/customErrors";

// Mock external dependencies
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: any;

  beforeEach(() => {
    authService = new AuthService();
    userRepository = AppDataSource.getRepository(User);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      const username = "testuser";
      const password = "testpassword";
      const hashedPassword = "hashedpassword";

      userRepository.findOne.mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockReturnValue({
        username,
        password: hashedPassword,
        role: UserRole.USER,
        balance: 0,
      });
      userRepository.save.mockResolvedValue({ username });

      const result = await authService.registerUser(username, password);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username,
        password: hashedPassword,
        role: UserRole.USER,
        balance: 0,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        username,
        password: hashedPassword,
        role: UserRole.USER,
        balance: 0,
      });
      expect(result).toEqual({ username });
    });

    it("should throw an error if the username already exists", async () => {
      const username = "existinguser";
      userRepository.findOne.mockResolvedValue({ username });

      await expect(
        authService.registerUser(username, "password")
      ).rejects.toThrow(new AppError("Username already exists", 400));
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate a user and return a JWT token", async () => {
      const username = "testuser";
      const password = "testpassword";
      const hashedPassword = "hashedpassword";
      const user = {
        id: 1,
        username,
        password: hashedPassword,
        role: UserRole.USER,
      };
      const token = "valid-token";

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await authService.authenticateUser(username, password);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      expect(result).toBe(token);
    });

    it("should throw an error if the username is not found", async () => {
      const username = "nonexistentuser";
      const password = "testpassword";

      userRepository.findOne.mockResolvedValue(null); // No user found

      await expect(
        authService.authenticateUser(username, password)
      ).rejects.toThrow(new AppError("Invalid username or password", 401));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it("should throw an error if the password is incorrect", async () => {
      const username = "testuser";
      const password = "wrongpassword";
      const hashedPassword = "hashedpassword";
      const user = {
        id: 1,
        username,
        password: hashedPassword,
        role: UserRole.USER,
      };

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password comparison fails

      await expect(
        authService.authenticateUser(username, password)
      ).rejects.toThrow(new AppError("Invalid username or password", 401));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
