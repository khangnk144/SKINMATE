// Test analysis.service: parse INCI, lookup official DB rules, and keep Gemini results unverified.
import { SkinType } from '@prisma/client';
import { analyzeIngredients } from '../services/analysis.service';
import { analyzeWithGemini } from '../utils/gemini';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    ingredient: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    ingredientRule: {
      upsert: jest.fn(),
    },
    aiIngredientSuggestion: {
      upsert: jest.fn(),
    },
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
  };
});

jest.mock('../utils/gemini', () => ({
  analyzeWithGemini: jest.fn(),
}));

import { PrismaClient } from '@prisma/client';

describe('Analysis Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    (analyzeWithGemini as jest.Mock).mockResolvedValue([]);
  });

  it('should parse inci string correctly (split by comma, trim, keep original case)', async () => {
    prisma.ingredient.findMany.mockResolvedValue([]);

    const results = await analyzeIngredients(' Water,  Niacinamide ,Salicylic Acid ', null);

    expect(results).toHaveLength(3);
    expect(results[0]).toMatchObject({
      originalName: 'Water',
      mappedName: 'water',
      source: 'FALLBACK',
      isVerified: false,
    });
    expect(results[1].originalName).toBe('Niacinamide');
    expect(results[1].mappedName).toBe('niacinamide');
    expect(results[2].originalName).toBe('Salicylic Acid');
    expect(results[2].mappedName).toBe('salicylic acid');
  });

  it('should return empty array for empty string', async () => {
    const results = await analyzeIngredients('   ,,  ', null);
    expect(results).toHaveLength(0);
    expect(prisma.ingredient.findMany).not.toHaveBeenCalled();
  });

  it('should return official database ingredients as verified', async () => {
    const mockIngredients = [
      {
        id: 1,
        name: 'water',
        description: 'Solvent',
        rules: [],
      },
      {
        id: 2,
        name: 'salicylic acid',
        description: 'BHA',
        rules: [{ effect: 'BAD' }],
      },
    ];

    prisma.ingredient.findMany.mockResolvedValue(mockIngredients);

    const results = await analyzeIngredients('Water, Salicylic Acid', SkinType.DRY);

    expect(prisma.ingredient.findMany).toHaveBeenCalledWith({
      where: { name: { in: ['water', 'salicylic acid'] } },
      include: {
        rules: { where: { skinType: SkinType.DRY } },
      },
    });

    expect(results[0]).toMatchObject({
      effect: 'NEUTRAL',
      description: 'Solvent',
      ingredientId: 1,
      source: 'DATABASE',
      isVerified: true,
    });
    expect(results[1]).toMatchObject({
      effect: 'BAD',
      description: 'BHA',
      ingredientId: 2,
      source: 'DATABASE',
      isVerified: true,
    });
  });

  it('should return Gemini results as AI suggestions and not update official tables', async () => {
    prisma.ingredient.findMany.mockResolvedValue([]);
    prisma.aiIngredientSuggestion.upsert.mockResolvedValue({});
    (analyzeWithGemini as jest.Mock).mockResolvedValue([
      {
        mappedName: 'azelaic acid',
        effect: 'GOOD',
        description: 'Ho tro da mun.',
      },
    ]);

    const results = await analyzeIngredients('Azelaic Acid', SkinType.OILY);

    expect(results).toEqual([
      {
        originalName: 'Azelaic Acid',
        mappedName: 'azelaic acid',
        effect: 'GOOD',
        description: 'Ho tro da mun.',
        ingredientId: null,
        source: 'AI',
        isVerified: false,
      },
    ]);
    expect(prisma.aiIngredientSuggestion.upsert).toHaveBeenCalledWith({
      where: { pendingKey: 'azelaic acid::OILY::PENDING' },
      update: {
        suggestedEffect: 'GOOD',
        suggestedDescription: 'Ho tro da mun.',
        occurrenceCount: { increment: 1 },
      },
      create: {
        ingredientName: 'azelaic acid',
        skinType: SkinType.OILY,
        suggestedEffect: 'GOOD',
        suggestedDescription: 'Ho tro da mun.',
        source: 'GEMINI',
        pendingKey: 'azelaic acid::OILY::PENDING',
      },
    });
    expect(prisma.ingredient.upsert).not.toHaveBeenCalled();
    expect(prisma.ingredientRule.upsert).not.toHaveBeenCalled();
  });

  it('should set missing ingredients to fallback NEUTRAL when Gemini returns nothing', async () => {
    prisma.ingredient.findMany.mockResolvedValue([]);
    (analyzeWithGemini as jest.Mock).mockResolvedValue([]);

    const results = await analyzeIngredients('Unknown Ingredient', SkinType.NORMAL);

    expect(results).toEqual([
      {
        originalName: 'Unknown Ingredient',
        mappedName: 'unknown ingredient',
        effect: 'NEUTRAL',
        description: null,
        ingredientId: null,
        source: 'FALLBACK',
        isVerified: false,
      },
    ]);
  });
});
