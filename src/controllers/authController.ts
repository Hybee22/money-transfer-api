import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const user = await authService.registerUser(username, password);
      res.status(201).json({
        message: "User created successfully",
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const token = await authService.authenticateUser(username, password);
      res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
      next(error);
    }
  }
}
