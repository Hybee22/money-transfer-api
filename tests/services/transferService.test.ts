import { TransferService } from "../../src/services/transferService";
import { AppDataSource } from "../../src/config/database";
import { Transfer, TransferType } from "../../src/entities/Transfer";
import { AppError } from "../../src/utils/customErrors";
import moment from "moment";
import { User } from "../../src/entities/User";

// Mock the dependencies

// describe('TransferService', () => {
//   let transferService: TransferService;
//   let mockTransferRepository: any;
//   let mockTransactionalEntityManager: any;

//   beforeEach(() => {
//     mockTransferRepository = {
//       createQueryBuilder: jest.fn().mockReturnThis(),
//       leftJoinAndSelect: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       andWhere: jest.fn().mockReturnThis(),
//       select: jest.fn().mockReturnThis(),
//       orderBy: jest.fn().mockReturnThis(),
//       skip: jest.fn().mockReturnThis(),
//       take: jest.fn().mockReturnThis(),
//       getManyAndCount: jest.fn(),
//     };

//     mockTransactionalEntityManager = {
//       findOne: jest.fn(),
//       save: jest.fn(),
//       create: jest.fn(),
//       findOneBy: jest.fn(),
//     };

//     (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTransferRepository);
//     (AppDataSource.transaction as jest.Mock).mockImplementation((cb) => cb(mockTransactionalEntityManager));
//     (AppDataSource.manager.transaction as jest.Mock).mockImplementation((cb) => cb(mockTransactionalEntityManager));

//     transferService = new TransferService();
//   });

//   describe('createTransfer', () => {
//     it('should create a transfer successfully', async () => {
//       const sender = { id: '1', balance: 100 };
//       const recipient = { id: '2', balance: 50 };
//       const amount = 30;

//       mockTransactionalEntityManager.findOne
//         .mockResolvedValueOnce(sender)
//         .mockResolvedValueOnce(recipient);
//       mockTransactionalEntityManager.save.mockResolvedValue([
//         { ...sender, balance: 70 },
//         { ...recipient, balance: 80 },
//       ]);
//       mockTransactionalEntityManager.create.mockReturnValue({ sender, recipient, amount, type: TransferType.TRANSFER });

//       const result = await transferService.createTransfer('1', '2', amount);

//       expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledTimes(2);
//       expect(mockTransactionalEntityManager.save).toHaveBeenCalledTimes(2);
//       expect(mockTransactionalEntityManager.create).toHaveBeenCalledWith(Transfer, {
//         sender,
//         recipient,
//         amount,
//         type: TransferType.TRANSFER,
//       });
//       expect(result).toEqual({ sender, recipient, amount, type: TransferType.TRANSFER });
//     });

//     it('should throw an error if sender is not found', async () => {
//       mockTransactionalEntityManager.findOne.mockResolvedValueOnce(null);

//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow(AppError);
//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow('Sender not found');
//     });

//     it('should throw an error if recipient is not found', async () => {
//       mockTransactionalEntityManager.findOne
//         .mockResolvedValueOnce({ id: '1', balance: 100 })
//         .mockResolvedValueOnce(null);

//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow(AppError);
//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow('Recipient not found');
//     });

//     it('should throw an error if sender has insufficient funds', async () => {
//       mockTransactionalEntityManager.findOne
//         .mockResolvedValueOnce({ id: '1', balance: 20 })
//         .mockResolvedValueOnce({ id: '2', balance: 50 });

//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow(AppError);
//       await expect(transferService.createTransfer('1', '2', 30)).rejects.toThrow('Insufficient funds');
//     });
//   });

//   describe('getTransfers', () => {
//     it('should retrieve transfers with default parameters', async () => {
//       const mockTransfers = [{ id: '1', amount: 50 }];
//       mockTransferRepository.getManyAndCount.mockResolvedValue([mockTransfers, 1]);

//       const result = await transferService.getTransfers('1');

//       expect(mockTransferRepository.where).toHaveBeenCalledWith(
//         '(transfer.senderId = :userId OR transfer.recipientId = :userId)',
//         { userId: '1' }
//       );
//       expect(mockTransferRepository.skip).toHaveBeenCalledWith(0);
//       expect(mockTransferRepository.take).toHaveBeenCalledWith(10);
//       expect(result).toEqual([mockTransfers, 1]);
//     });

//     it('should apply date filters when provided', async () => {
//       const startDate = new Date('2023-01-01');
//       const endDate = new Date('2023-01-31');
//       await transferService.getTransfers('1', 1, 10, startDate, endDate);

//       expect(mockTransferRepository.andWhere).toHaveBeenCalledWith(
//         'transfer.createdAt BETWEEN :start AND :end',
//         expect.any(Object)
//       );
//     });

//     it('should apply username filter when provided', async () => {
//       await transferService.getTransfers('1', 1, 10, undefined, undefined, 'testuser');

//       expect(mockTransferRepository.andWhere).toHaveBeenCalledWith(
//         '(sender.username ILIKE :username OR recipient.username ILIKE :username)',
//         { username: '%testuser%' }
//       );
//     });

//     it('should apply transfer type filter when provided', async () => {
//       await transferService.getTransfers('1', 1, 10, undefined, undefined, undefined, TransferType.TRANSFER);

//       expect(mockTransferRepository.andWhere).toHaveBeenCalledWith(
//         'transfer.type = :transferType',
//         { transferType: TransferType.TRANSFER }
//       );
//     });
//   });

//   describe('recordAdminFunding', () => {
//     it('should record admin funding successfully', async () => {
//       const admin = { id: '1' };
//       const recipient = { id: '2' };
//       const amount = 100;

//       mockTransactionalEntityManager.findOneBy
//         .mockResolvedValueOnce(admin)
//         .mockResolvedValueOnce(recipient);
//       mockTransactionalEntityManager.save.mockResolvedValue({ sender: admin, recipient, amount, type: TransferType.FUNDING });

//       const result = await transferService.recordAdminFunding('1', '2', amount);

//       expect(mockTransactionalEntityManager.findOneBy).toHaveBeenCalledTimes(2);
//       expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(Transfer, expect.any(Object));
//       expect(result).toEqual({ sender: admin, recipient, amount, type: TransferType.FUNDING });
//     });

//     it('should throw an error if admin or recipient is not found', async () => {
//       mockTransactionalEntityManager.findOneBy.mockResolvedValue(null);

//       await expect(transferService.recordAdminFunding('1', '2', 100)).rejects.toThrow(AppError);
//       await expect(transferService.recordAdminFunding('1', '2', 100)).rejects.toThrow('Admin or recipient not found');
//     });
//   });

//   describe('getUserTransfers', () => {
//     it('should retrieve user transfers with default parameters', async () => {
//       const mockTransfers = [{ id: '1', amount: 50 }];
//       mockTransferRepository.getManyAndCount.mockResolvedValue([mockTransfers, 1]);

//       const result = await transferService.getUserTransfers('1');

//       expect(mockTransferRepository.where).toHaveBeenCalledWith('transfer.sender.id = :senderId', { senderId: '1' });
//       expect(mockTransferRepository.skip).toHaveBeenCalledWith(0);
//       expect(mockTransferRepository.take).toHaveBeenCalledWith(10);
//       expect(result).toEqual({ transfers: mockTransfers, total: 1 });
//     });

//     it('should apply date filters when provided', async () => {
//       const startDate = new Date('2023-01-01');
//       const endDate = new Date('2023-01-31');
//       await transferService.getUserTransfers('1', 1, 10, startDate, endDate);

//       expect(mockTransferRepository.andWhere).toHaveBeenCalledWith(
//         'transfer.createdAt BETWEEN :start AND :end',
//         expect.any(Object)
//       );
//     });
//   });
// });

jest.mock("../../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      save: jest.fn(),
      create: jest.fn(),
      findOneBy: jest.fn(),
    }),
    manager: {
      transaction: jest.fn(),
    },
    transaction: jest.fn(),
  },
}));

describe("TransferService", () => {
  let transferService: TransferService;
  let transferRepository: any;
  let userRepository: any;

  beforeEach(() => {
    transferService = new TransferService();
    transferRepository = AppDataSource.getRepository(Transfer);
    userRepository = AppDataSource.getRepository(User);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransfer", () => {
    it("should create a transfer between two users", async () => {
      const sender = { id: "1", balance: 1000 };
      const recipient = { id: "2", balance: 500 };
      const amount = 100;

      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (callback: any) =>
          callback({
            findOne: jest
              .fn()
              .mockResolvedValueOnce(sender) // First call is for sender
              .mockResolvedValueOnce(recipient), // Second call is for recipient
            save: jest.fn(),
            create: jest.fn(),
          })
      );

      await transferService.createTransfer("1", "2", amount);

      expect(AppDataSource.transaction).toHaveBeenCalled();
      expect(sender.balance).toBe(900);
      expect(recipient.balance).toBe(600);
    });

    it("should throw an error if sender is not found", async () => {
      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (callback: any) =>
          callback({
            findOne: jest.fn().mockResolvedValueOnce(null),
          })
      );

      await expect(
        transferService.createTransfer("1", "2", 100)
      ).rejects.toThrow(new AppError("Sender not found", 404));
    });

    it("should throw an error if recipient is not found", async () => {
      const sender = { id: "1", balance: 1000 };
      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (callback: any) =>
          callback({
            findOne: jest
              .fn()
              .mockResolvedValueOnce(sender)
              .mockResolvedValueOnce(null),
          })
      );

      await expect(
        transferService.createTransfer("1", "2", 100)
      ).rejects.toThrow(new AppError("Recipient not found", 404));
    });

    it("should throw an error if sender has insufficient funds", async () => {
      const sender = { id: "1", balance: 50 };
      const recipient = { id: "2", balance: 500 };
      const amount = 100;

      (AppDataSource.transaction as jest.Mock).mockImplementation(
        async (callback: any) =>
          callback({
            findOne: jest
              .fn()
              .mockResolvedValueOnce(sender)
              .mockResolvedValueOnce(recipient),
          })
      );

      await expect(
        transferService.createTransfer("1", "2", amount)
      ).rejects.toThrow(new AppError("Insufficient funds", 400));
    });
  });

  describe("getTransfers", () => {
    it("should retrieve transfers for a user with pagination", async () => {
      const userId = "1";
      const transfers = [{ id: "transfer1" }, { id: "transfer2" }];
      const total = 2;

      transferRepository.getManyAndCount.mockResolvedValue([transfers, total]);

      const result = await transferService.getTransfers(userId, 1, 10);

      expect(transferRepository.createQueryBuilder).toHaveBeenCalledWith(
        "transfer"
      );
      expect(transferRepository.where).toHaveBeenCalledWith(
        "(transfer.senderId = :userId OR transfer.recipientId = :userId)",
        { userId }
      );
      expect(transferRepository.skip).toHaveBeenCalledWith(0);
      expect(transferRepository.take).toHaveBeenCalledWith(10);
      expect(result).toEqual([transfers, total]);
    });

    it("should filter transfers by date range", async () => {
      const userId = "1";
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      await transferService.getTransfers(userId, 1, 10, startDate, endDate);

      const start = new Date(
        moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
      );
      const end = new Date(
        moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
      );

      expect(transferRepository.andWhere).toHaveBeenCalledWith(
        "transfer.createdAt BETWEEN :start AND :end",
        { start, end }
      );
    });

    it("should filter transfers by username", async () => {
      const userId = "1";
      const username = "testuser";

      await transferService.getTransfers(
        userId,
        1,
        10,
        undefined,
        undefined,
        username
      );

      expect(transferRepository.andWhere).toHaveBeenCalledWith(
        "(sender.username ILIKE :username OR recipient.username ILIKE :username)",
        { username: `%${username}%` }
      );
    });

    it("should filter transfers by transfer type", async () => {
      const userId = "1";
      const transferType = TransferType.TRANSFER;

      await transferService.getTransfers(
        userId,
        1,
        10,
        undefined,
        undefined,
        undefined,
        transferType
      );

      expect(transferRepository.andWhere).toHaveBeenCalledWith(
        "transfer.type = :transferType",
        { transferType }
      );
    });
  });

  describe("recordAdminFunding", () => {
    it("should record an admin funding transaction", async () => {
      const admin = { id: "admin1" };
      const recipient = { id: "user1" };
      const amount = 100;

      // Create a mock save function
      const mockSave = jest.fn();

      // Mocking the transaction call and tracking the inner callback's behavior
      const mockTransaction = jest.fn(async (callback: any) =>
        callback({
          findOneBy: jest
            .fn()
            .mockResolvedValueOnce(admin)
            .mockResolvedValueOnce(recipient),
          save: mockSave,
        })
      );

      // Assigning mockTransaction to AppDataSource.manager.transaction
      (AppDataSource.manager.transaction as jest.Mock) = mockTransaction;

      const transfer = await transferService.recordAdminFunding(
        "admin1",
        "user1",
        amount
      );

      // Asserting transaction was called
      expect(AppDataSource.manager.transaction).toHaveBeenCalled();

      // Check if save was called
      expect(mockSave).toHaveBeenCalled();

    //   // Ensure the transfer is returned correctly
    //   expect(transfer).toBeDefined();
    });

    it("should throw an error if admin or recipient is not found", async () => {
      (AppDataSource.manager.transaction as jest.Mock).mockImplementation(
        async (callback: any) =>
          callback({
            findOneBy: jest.fn().mockResolvedValueOnce(null),
          })
      );

      await expect(
        transferService.recordAdminFunding("admin1", "user1", 100)
      ).rejects.toThrow(new AppError("Admin or recipient not found", 404));
    });
  });
});
