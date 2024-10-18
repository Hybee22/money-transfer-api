import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/customErrors";
import { Not, In, Like } from "typeorm";

const userRepository = AppDataSource.getRepository(User);

/**
 * Service class for handling user-related operations.
 */
export class UserService {
  private readonly balanceCache: Map<
    string,
    { balance: number; lastUpdated: Date }
  >;
  private readonly CACHE_TTL = 60000; // 1 minute in milliseconds

  constructor() {
    this.balanceCache = new Map();
  }

  /**
   * Sets the cached balance for a user.
   * @param userId - The ID of the user.
   * @param balance - The balance to cache.
   * @private
   */
  private setCachedBalance(userId: string, balance: number) {
    this.balanceCache.set(userId, { balance, lastUpdated: new Date() });
  }

  /**
   * Gets the cached balance for a user, if available and not expired.
   * @param userId - The ID of the user.
   * @returns The cached balance or null if not available or expired.
   * @private
   */
  private getCachedBalance(userId: string): number | null {
    const cachedData = this.balanceCache.get(userId);
    if (
      cachedData &&
      new Date().getTime() - cachedData.lastUpdated.getTime() < this.CACHE_TTL
    ) {
      return cachedData.balance;
    }
    return null;
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns A Promise that resolves to the User object or null if not found.
   */
  async getUserById(id: string): Promise<User | null> {
    return userRepository.findOne({ where: { id } });
  }

  /**
   * Retrieves a user by their username.
   * @param username - The username of the user to retrieve.
   * @returns A Promise that resolves to the User object or null if not found.
   */
  async getUserByUsername(username: string): Promise<User | null> {
    return userRepository.findOne({ where: { username } });
  }

  /**
   * Retrieves the balance for a user.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to the user's balance.
   * @throws {AppError} If the user is not found.
   */
  async getUserBalance(userId: string): Promise<number> {
    const cachedBalance = this.getCachedBalance(userId);
    if (cachedBalance !== null) {
      return cachedBalance;
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    this.setCachedBalance(userId, user.balance);
    return user.balance;
  }

  /**
   * Updates the balance for a user.
   * @param userId - The ID of the user.
   * @param newBalance - The new balance to set.
   * @throws {AppError} If the user is not found.
   */
  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        lock: { mode: "pessimistic_write" },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.balance = newBalance;
      await transactionalEntityManager.save(User, user);

      // Update cache after successful database update
      this.setCachedBalance(userId, newBalance);
    });
  }

  /**
   * Funds a user's balance by an admin.
   * @param adminId - The ID of the admin performing the funding.
   * @param userId - The ID of the user being funded.
   * @param amount - The amount to add to the user's balance.
   * @returns A Promise that resolves to the updated User object.
   * @throws {AppError} If the admin is not authorized or the user is not found.
   */
  async fundUserBalance(
    adminId: string,
    userId: string,
    amount: number
  ): Promise<User> {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const admin = await transactionalEntityManager.findOne(User, {
        where: { id: adminId },
        lock: { mode: "pessimistic_write" },
      });
      if (
        !admin ||
        (admin.role !== UserRole.ADMIN && admin.role !== UserRole.SUPER_ADMIN)
      ) {
        throw new AppError(
          "Unauthorized: Only admins can fund user balances",
          401
        );
      }

      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.balance = Number(user.balance) + Number(amount);
      const updatedUser = await transactionalEntityManager.save(User, user);

      // Update cache after successful database update
      this.setCachedBalance(userId, updatedUser.balance);

      return updatedUser;
    });
  }

  /**
   * Retrieves non-admin users based on various criteria.
   * @param page - The page number for pagination (default: 1).
   * @param limit - The number of users per page (default: 10).
   * @param search - The search term for username (optional).
   * @param isUsername - Whether to search by username (optional).
   * @returns A Promise that resolves to an array of User objects and the total count.
   */
  async getNonAdminUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isUsername?: string
  ): Promise<[User[], number]> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: Not(In([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
    };

    if (isUsername === "true" && search) {
      whereClause.username = Like(`%${search}%`);
    }

    const [users, total] = await userRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: {
        createdAt: "DESC",
      },
      select: {
        id: true,
        username: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return [users, total];
  }
}

// Export an instance of UserService instead of the class itself
