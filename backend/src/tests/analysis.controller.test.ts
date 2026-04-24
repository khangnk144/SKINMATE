import { Request, Response } from 'express';
import { checkAnalysis } from '../controllers/analysis.controller';
import prisma from '../utils/prisma';
import * as analysisService from '../services/analysis.service';

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    analysisHistory: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../services/analysis.service', () => ({
  analyzeIngredients: jest.fn(),
}));

describe('Analysis Controller - checkAnalysis', () => {
  let req: Partial<Request & { user?: { userId: string } }>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {
      user: { userId: 'user-id-123' },
      body: { inciString: 'Water, Glycerin' },
    };
    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if inciString is not provided', async () => {
    req.body = {};
    await checkAnalysis(req as any, res as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'inciString is required and must be a non-empty string' });
  });

  it('should return 401 if user is not authenticated', async () => {
    req.user = undefined;
    await checkAnalysis(req as any, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 401 if user is not found in db', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await checkAnalysis(req as any, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should perform analysis, save history, and return results', async () => {
    const mockUser = { id: 'user-id-123', skinType: 'OILY' };
    const mockResults: any[] = [{ originalName: 'Water', mappedName: 'water', effect: 'NEUTRAL' }];
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (analysisService.analyzeIngredients as jest.Mock).mockResolvedValue(mockResults);
    (prisma.analysisHistory.create as jest.Mock).mockResolvedValue({});

    await checkAnalysis(req as any, res as Response);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id-123' } });
    expect(analysisService.analyzeIngredients).toHaveBeenCalledWith('Water, Glycerin', 'OILY');
    expect(prisma.analysisHistory.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-id-123',
        rawInput: 'Water, Glycerin',
      },
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockResults);
  });
});