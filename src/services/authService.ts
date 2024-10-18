import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/customErrors";

const userRepository = AppDataSource.getRepository(User);

/**
 * Service class for handling authentication-related operations.
 */
export class AuthService {
  /**
   * Registers a new user.
   * @param username - The username of the new user.
   * @param password - The password of the new user.
   * @returns A Promise that resolves to the newly created User object.
   * @throws {AppError} If the username already exists.
   */
  async registerUser(username: string, password: string): Promise<User> {
    const existingUser = await userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new AppError("Username already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      role: UserRole.USER,
      balance: 0,
    });
    return userRepository.save(newUser);
  }

  /**
   * Authenticates a user and generates a JWT token.
   * @param username - The username of the user to authenticate.
   * @param password - The password of the user to authenticate.
   * @returns A Promise that resolves to the JWT token string.
   * @throws {AppError} If the username or password is invalid.
   */
  async authenticateUser(username: string, password: string): Promise<string> {
    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid username or password", 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return token;
  }
}
