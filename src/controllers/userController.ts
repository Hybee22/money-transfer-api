import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { AppError } from "../utils/customErrors";

const userService = new UserService();

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({
        message: "User fetched successfully",
        id: user.id,
        username: user.username,
        balance: user.balance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({
        message: "User fetched successfully",
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNonAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const isUsername = req.query.isUsername as string;

      const [users, total] = await userService.getNonAdminUsers(
        page,
        limit,
        search,
        isUsername
      );

      res.json({
        message: "Users fetched successfully",
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      if (req.user) {
        // Ensure the requesting user is authorized to view this balance
        if (req.user.id !== userId) {
          throw new AppError("Unauthorized to view this user's balance", 403);
        }
      }

      const balance = await userService.getUserBalance(userId);

      res.json({
        message: "User balance fetched successfully",
        id: userId,
        balance: balance,
      });
    } catch (error) {
      next(error);
    }
  }
}
