import { AppDataSource } from "../config/database";
import { Transfer, TransferType } from "../entities/Transfer";
import { User } from "../entities/User";
import { AppError } from "../utils/customErrors";
import moment from "moment";

/**
 * Service class for handling transfer-related operations.
 */
export class TransferService {
  private readonly transferRepository = AppDataSource.getRepository(Transfer);
  // private readonly userRepository = AppDataSource.getRepository(User);

  /**
   * Creates a new transfer between two users.
   * @param senderId - The ID of the user sending the money.
   * @param recipientId - The ID of the user receiving the money.
   * @param amount - The amount of money to transfer.
   * @returns A Promise that resolves to the created Transfer object.
   * @throws {AppError} If the sender or recipient is not found, or if there are insufficient funds.
   */
  async createTransfer(
    senderId: string,
    recipientId: string,
    amount: number
  ): Promise<Transfer> {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const sender = await transactionalEntityManager.findOne(User, {
        where: { id: senderId },
        lock: { mode: "pessimistic_write" },
      });
      if (!sender) throw new AppError("Sender not found", 404);

      const recipient = await transactionalEntityManager.findOne(User, {
        where: { id: recipientId },
        lock: { mode: "pessimistic_write" },
      });
      if (!recipient) throw new AppError("Recipient not found", 404);

      if (sender.balance < amount)
        throw new AppError("Insufficient funds", 400);

      sender.balance -= amount;
      recipient.balance += amount;

      await transactionalEntityManager.save(User, [sender, recipient]);

      const transfer = transactionalEntityManager.create(Transfer, {
        sender,
        recipient,
        amount,
        type: TransferType.TRANSFER,
      });

      return transactionalEntityManager.save(Transfer, transfer);
    });
  }

  /**
   * Retrieves transfers based on various filter criteria.
   * @param userId - The ID of the user whose transfers to retrieve.
   * @param page - The page number for pagination (default: 1).
   * @param limit - The number of transfers per page (default: 10).
   * @param startDate - The start date for filtering transfers.
   * @param endDate - The end date for filtering transfers.
   * @param username - The username to filter transfers by sender or recipient.
   * @param transferType - The type of transfer to filter by.
   * @returns A Promise that resolves to an array of Transfer objects and the total count.
   */
  async getTransfers(
    userId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    username?: string,
    transferType?: TransferType
  ): Promise<[Transfer[], number]> {
    const queryBuilder = this.transferRepository
      .createQueryBuilder("transfer")
      .leftJoinAndSelect("transfer.sender", "sender")
      .leftJoinAndSelect("transfer.recipient", "recipient")
      .where(
        "(transfer.senderId = :userId OR transfer.recipientId = :userId)",
        { userId }
      );

    if (startDate && endDate) {
      const start = new Date(
        moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
      );
      const end = new Date(
        moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
      );
      queryBuilder.andWhere("transfer.createdAt BETWEEN :start AND :end", {
        start,
        end,
      });
    }

    if (username) {
      queryBuilder.andWhere(
        "(sender.username ILIKE :username OR recipient.username ILIKE :username)",
        { username: `%${username}%` }
      );
    }

    if (transferType) {
      queryBuilder.andWhere("transfer.type = :transferType", { transferType });
    }

    queryBuilder
      .select([
        "transfer.id",
        "transfer.amount",
        "transfer.type",
        "transfer.createdAt",
        "sender.username",
        "recipient.username",
      ])
      .orderBy("transfer.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Records an admin funding transaction.
   * @param adminId - The ID of the admin performing the funding.
   * @param userId - The ID of the user being funded.
   * @param amount - The amount of money being added to the user's account.
   * @returns A Promise that resolves to the created Transfer object.
   * @throws {AppError} If the admin or recipient is not found.
   */
  async recordAdminFunding(
    adminId: string,
    userId: string,
    amount: number
  ): Promise<Transfer> {
    return await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const admin = await transactionalEntityManager.findOneBy(User, {
          id: adminId,
        });
        const recipient = await transactionalEntityManager.findOneBy(User, {
          id: userId,
        });

        if (!admin || !recipient) {
          throw new AppError("Admin or recipient not found", 404);
        }

        const transfer = new Transfer();
        transfer.sender = admin;
        transfer.recipient = recipient;
        transfer.amount = amount;
        transfer.type = TransferType.FUNDING;

        return await transactionalEntityManager.save(Transfer, transfer);
      }
    );
  }

  /**
   * Retrieves transfers for a specific user.
   * @param senderId - The ID of the user whose transfers to retrieve.
   * @param page - The page number for pagination (default: 1).
   * @param limit - The number of transfers per page (default: 10).
   * @param startDate - The start date for filtering transfers.
   * @param endDate - The end date for filtering transfers.
   * @param status - The status to filter transfers by.
   * @returns A Promise that resolves to an object containing the transfers and total count.
   */
  async getUserTransfers(
    senderId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    status?: string
  ): Promise<{ transfers: Transfer[]; total: number }> {
    const queryBuilder = this.transferRepository
      .createQueryBuilder("transfer")
      .where("transfer.sender.id = :senderId", { senderId });

    const start = new Date(
      moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    const end = new Date(
      moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );

    if (startDate && endDate) {
      queryBuilder.andWhere("transfer.createdAt BETWEEN :start AND :end", {
        start,
        end,
      });
    }

    const [transfers, total] = await queryBuilder
      .leftJoinAndSelect("transfer.sender", "sender")
      .leftJoinAndSelect("transfer.recipient", "recipient")
      .select([
        "transfer.id",
        "transfer.amount",
        "transfer.type",
        "transfer.createdAt",
        "recipient.username",
      ])
      .orderBy("transfer.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { transfers, total };
  }
}
