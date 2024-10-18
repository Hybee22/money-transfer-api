import { UserService } from "../../src/services/userService";
import { AppDataSource } from "../../src/config/database";
import { AppError } from "../../src/utils/customErrors";
import { User } from "../../src/entities/User";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockUserRepository = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// Ensure that the AppDataSource is mocked to return the mock repository with findOne
jest.mock("../../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    }),
    transaction: jest.fn(),
  },
}));

describe("UserService", () => {
  let userService: UserService;
  let userRepository: any;

  beforeEach(() => {
    userService = new UserService();
    userRepository = AppDataSource.getRepository(User);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserBalance", () => {
    it("should return cached balance if available", async () => {
      const userId = "1";
      const cachedBalance = 100;
      jest
        .spyOn(userService as any, "getCachedBalance")
        .mockReturnValue(cachedBalance);

      const balance = await userService.getUserBalance(userId);

      expect(balance).toBe(cachedBalance);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it("should fetch and cache the balance if not cached", async () => {
      const userId = "1";
      const user = { id: "1", balance: 200 };
      // Spy on getCachedBalance to return null (simulate cache miss)
      jest.spyOn(userService as any, "getCachedBalance").mockReturnValue(null);
      // Mock the repository findOne method to return a user object
      // const mockFindOne = jest.fn().mockResolvedValue(user);
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(userService as any, "setCachedBalance").mockReturnValue(user);

      // Fetch the user balance
      const balance = await userService.getUserBalance(userId);

      // Verify that findOne was called with the correct arguments
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });

      // Ensure the correct balance is returned
      expect(balance).toBe(user.balance);

      // Verify that the balance was cached
      expect((userService as any).setCachedBalance).toHaveBeenCalledWith(
        userId,
        user.balance
      );
    });
  });

  describe("updateUserBalance", () => {
    it("should update the user's balance and cache it", async () => {
      const userId = "user1";
      const newBalance = 500;
      const user = { id: userId, balance: 200 };

      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (transactionCallback) => {
          await transactionCallback({
            findOne: jest.fn().mockResolvedValue(user),
            save: jest.fn(),
          });
        }
      );

      jest.spyOn(userService as any, "setCachedBalance").mockReturnValue(user);

      await userService.updateUserBalance(userId, newBalance);

      expect(AppDataSource.transaction).toHaveBeenCalled();
      expect(user.balance).toBe(newBalance);
      expect((userService as any).setCachedBalance).toHaveBeenCalledWith(
        userId,
        newBalance
      );
    });

    it("should throw an error if the user is not found", async () => {
      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (transactionCallback) => {
          await transactionCallback({
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          });
        }
      );

      await expect(
        userService.updateUserBalance("invalidId", 500)
      ).rejects.toThrow(AppError);
    });
  });

  describe("getNonAdminUsers", () => {
    it("should return a paginated list of non-admin users", async () => {
      const users = [
        { id: "user1", username: "user1", balance: 100 },
        { id: "user2", username: "user2", balance: 200 },
      ];

      userRepository.findAndCount.mockResolvedValue([users, users.length]);

      const [result, total] = await userService.getNonAdminUsers(1, 10);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: { role: expect.any(Object) },
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
        select: {
          id: true,
          username: true,
          balance: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(users);
      expect(total).toBe(users.length);
    });

    it("should apply search criteria if provided", async () => {
      const users = [{ id: "user1", username: "searchUser", balance: 100 }];
      userRepository.findAndCount.mockResolvedValue([users, users.length]);

      const [result, total] = await userService.getNonAdminUsers(
        1,
        10,
        "search",
        "true"
      );

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: { role: expect.any(Object), username: expect.any(Object) },
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
        select: {
          id: true,
          username: true,
          balance: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(users);
      expect(total).toBe(users.length);
    });
  });
});
