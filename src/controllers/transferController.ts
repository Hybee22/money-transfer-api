import { Request, Response, NextFunction } from "express";
import { TransferService } from "../services/transferService";
import { UserService } from "../services/userService";
import { TransferType } from "../entities/Transfer";

const transferService = new TransferService();
const userService = new UserService();

export class TransferController {
  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientUsername, amount } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const senderId = req.user.id;
      await transferService.createTransfer(senderId, recipientUsername, amount);

      res.status(201).json({
        message: "Transfer successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const username = req.query.username as string | undefined;
      const transferType = req.query.transferType as TransferType | undefined;

      const [transfers, total] = await transferService.getTransfers(
        userId,
        page,
        limit,
        startDate,
        endDate,
        username,
        transferType
      );

      res.json({
        message: "Transfer records fetched successfully",
        transfers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async fundUserAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const adminId = req.user.id;

      // Fund the user's balance
      await userService.fundUserBalance(adminId, userId, amount);

      // Record the funding transaction
      await transferService.recordAdminFunding(adminId, userId, amount);

      res.status(200).json({
        message: "Account funded successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const senderId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const status = req.query.status as string | undefined;

      const { transfers, total } = await transferService.getUserTransfers(
        senderId,
        page,
        limit,
        startDate,
        endDate,
        status
      );

      res.status(200).json({
        message: "Transfer records fetched successfully",
        transfers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransfers: total,
      });
    } catch (error) {
      next(error);
    }
  }
}
