// Test admin AI suggestion review behavior: approve mutates official data, reject does not.
jest.mock('@prisma/client', () => {
  const mockPrisma: any = {
    aiIngredientSuggestion: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ingredient: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    ingredientRule: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(async (callback: any) => callback(mockPrisma)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    SkinType: {
      DRY: 'DRY',
      OILY: 'OILY',
      SENSITIVE: 'SENSITIVE',
      COMBINATION: 'COMBINATION',
      NORMAL: 'NORMAL',
    },
    SafetyEffect: {
      GOOD: 'GOOD',
      BAD: 'BAD',
      NEUTRAL: 'NEUTRAL',
    },
    ReportStatus: {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    },
  };
});

import { PrismaClient, ReportStatus, SafetyEffect, SkinType } from '@prisma/client';
import { adminService } from '../services/admin.service';

describe('Admin Service - AI suggestions', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: any) => callback(prisma));
  });

  it('should list pending AI suggestions by default', async () => {
    prisma.aiIngredientSuggestion.findMany.mockResolvedValue([]);

    await adminService.getAiSuggestions();

    expect(prisma.aiIngredientSuggestion.findMany).toHaveBeenCalledWith({
      where: { status: ReportStatus.PENDING },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should approve a pending suggestion into official ingredient and rule tables', async () => {
    prisma.aiIngredientSuggestion.findUnique.mockResolvedValue({
      id: 42,
      ingredientName: 'azelaic acid',
      skinType: SkinType.OILY,
      suggestedEffect: SafetyEffect.GOOD,
      suggestedDescription: 'Ho tro da mun.',
      status: ReportStatus.PENDING,
    });
    prisma.ingredient.upsert.mockResolvedValue({
      id: 7,
      name: 'azelaic acid',
      description: null,
    });
    prisma.ingredientRule.upsert.mockResolvedValue({});
    prisma.aiIngredientSuggestion.update.mockResolvedValue({ id: 42, status: ReportStatus.APPROVED });

    const result = await adminService.resolveAiSuggestion(42, ReportStatus.APPROVED, 'admin-1', 'looks valid');

    expect(prisma.ingredient.upsert).toHaveBeenCalledWith({
      where: { name: 'azelaic acid' },
      update: {},
      create: {
        name: 'azelaic acid',
        description: 'Ho tro da mun.',
      },
    });
    expect(prisma.ingredient.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { description: 'Ho tro da mun.' },
    });
    expect(prisma.ingredientRule.upsert).toHaveBeenCalledWith({
      where: {
        ingredientId_skinType: {
          ingredientId: 7,
          skinType: SkinType.OILY,
        },
      },
      update: { effect: SafetyEffect.GOOD },
      create: {
        ingredientId: 7,
        skinType: SkinType.OILY,
        effect: SafetyEffect.GOOD,
      },
    });
    expect(prisma.aiIngredientSuggestion.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: expect.objectContaining({
        status: ReportStatus.APPROVED,
        reviewedBy: 'admin-1',
        adminNote: 'looks valid',
        pendingKey: 'AI_SUGGESTION::APPROVED::42',
      }),
    });
    expect(result).toEqual({ id: 42, status: ReportStatus.APPROVED });
  });

  it('should reject a pending suggestion without mutating official data', async () => {
    prisma.aiIngredientSuggestion.findUnique.mockResolvedValue({
      id: 43,
      ingredientName: 'mystery extract',
      skinType: SkinType.SENSITIVE,
      suggestedEffect: SafetyEffect.BAD,
      suggestedDescription: 'Co the kich ung.',
      status: ReportStatus.PENDING,
    });
    prisma.aiIngredientSuggestion.update.mockResolvedValue({ id: 43, status: ReportStatus.REJECTED });

    await adminService.resolveAiSuggestion(43, ReportStatus.REJECTED, 'admin-1', 'not enough evidence');

    expect(prisma.ingredient.upsert).not.toHaveBeenCalled();
    expect(prisma.ingredient.update).not.toHaveBeenCalled();
    expect(prisma.ingredientRule.upsert).not.toHaveBeenCalled();
    expect(prisma.aiIngredientSuggestion.update).toHaveBeenCalledWith({
      where: { id: 43 },
      data: expect.objectContaining({
        status: ReportStatus.REJECTED,
        reviewedBy: 'admin-1',
        adminNote: 'not enough evidence',
        pendingKey: 'AI_SUGGESTION::REJECTED::43',
      }),
    });
  });
});
