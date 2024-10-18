import { Request, Response } from 'express';
import { TransferController } from '../../src/controllers/transferController';
import { TransferService } from '../../src/services/transferService';
import { UserService } from '../../src/services/userService';
import { UserRole } from '../../src/entities/User';

jest.mock('../../src/services/transferService');
jest.mock('../../src/services/userService');

describe('TransferController', () => {
  let transferController: TransferController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    transferController = new TransferController();
    mockRequest = {
      user: { 
        id: 'user123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user' as UserRole,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        sentTransfers: [],
        receivedTransfers: [],
      },
      body: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('createTransfer', () => {
    it('should create a transfer successfully', async () => {
      mockRequest.body = { recipientUsername: 'recipient', amount: 100 };
      await transferController.createTransfer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Transfer successful' });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      await transferController.createTransfer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('getTransfers', () => {
    it('should get transfers successfully', async () => {
      const mockTransfers = [{ id: 'transfer1' }, { id: 'transfer2' }];
      const mockTotal = 2;
      (TransferService.prototype.getTransfers as jest.Mock).mockResolvedValue([mockTransfers, mockTotal]);

      await transferController.getTransfers(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Transfer records fetched successfully',
        transfers: mockTransfers,
        total: mockTotal,
      }));
    });
  });

  describe('fundUserAccount', () => {
    it('should fund user account successfully', async () => {
      mockRequest.body = { userId: 'user456', amount: 500 };
      await transferController.fundUserAccount(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Account funded successfully' });
    });
  });

  describe('getUserTransfers', () => {
    it('should get user transfers successfully', async () => {
      const mockTransfers = [{ id: 'transfer1' }, { id: 'transfer2' }];
      const mockTotal = 2;
      (TransferService.prototype.getUserTransfers as jest.Mock).mockResolvedValue({ transfers: mockTransfers, total: mockTotal });

      await transferController.getUserTransfers(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Transfer records fetched successfully',
        transfers: mockTransfers,
        totalTransfers: mockTotal,
      }));
    });
  });
});
