import { Request, Response } from 'express';
import { getHistory, deleteHistory, deleteAllHistory } from '../controllers/history.controller';
import prisma from '../utils/prisma';

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    analysisHistory: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('History Controller', () => {
  let req: Partial<Request & { user?: { userId: string } }>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {
      user: { userId: 'user-id-123' },
      params: {},
    };
    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;
      await getHistory(req as any, res as Response);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should fetch and return history successfully', async () => {
      const mockHistory = [
        { id: '1', userId: 'user-id-123', rawInput: 'Water, Glycerin', createdAt: new Date() },
        { id: '2', userId: 'user-id-123', rawInput: 'Water, Peg-40', createdAt: new Date() },
      ];
      
      (prisma.analysisHistory.findMany as jest.Mock).mockResolvedValue(mockHistory);

      await getHistory(req as any, res as Response);

      expect(prisma.analysisHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockHistory);
    });

    it('should return 500 if prisma throws an error', async () => {
      (prisma.analysisHistory.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await getHistory(req as any, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteHistory', () => {
    it('should delete a history item successfully', async () => {
      req.params = { id: 'history-1' };
      (prisma.analysisHistory.findFirst as jest.Mock).mockResolvedValue({ id: 'history-1', userId: 'user-id-123' });
      (prisma.analysisHistory.delete as jest.Mock).mockResolvedValue({ id: 'history-1' });

      await deleteHistory(req as any, res as Response);

      expect(prisma.analysisHistory.findFirst).toHaveBeenCalledWith({
        where: { id: 'history-1', userId: 'user-id-123' },
      });
      expect(prisma.analysisHistory.delete).toHaveBeenCalledWith({
        where: { id: 'history-1' },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'History item deleted' });
    });

    it('should return 404 if item does not exist or belongs to another user', async () => {
      req.params = { id: 'history-1' };
      (prisma.analysisHistory.findFirst as jest.Mock).mockResolvedValue(null);

      await deleteHistory(req as any, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'History item not found' });
    });
  });

  describe('deleteAllHistory', () => {
    it('should delete all history items for the user', async () => {
      (prisma.analysisHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      await deleteAllHistory(req as any, res as Response);

      expect(prisma.analysisHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-123' },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'All history deleted' });
    });
  });
});