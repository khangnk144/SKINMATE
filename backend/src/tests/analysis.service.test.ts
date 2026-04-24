import { analyzeIngredients } from '../services/analysis.service';
import { SkinType } from '@prisma/client';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    ingredient: {
      findMany: jest.fn(),
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
    }
  };
});

import { PrismaClient } from '@prisma/client';

describe('Analysis Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  it('should parse inci string correctly (split by comma, trim, keep original case)', async () => {
    prisma.ingredient.findMany.mockResolvedValue([]);

    const results = await analyzeIngredients(' Water,  Niacinamide ,Salicylic Acid ', null);

    expect(results).toHaveLength(3);
    expect(results[0].originalName).toBe('Water');
    expect(results[0].mappedName).toBe('water');
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

  it('should map effects correctly based on returned rules', async () => {
    const mockIngredients = [
      {
        name: 'water',
        description: 'Solvent',
        rules: []
      },
      {
        name: 'salicylic acid',
        description: 'BHA',
        rules: [{ effect: 'BAD' }]
      }
    ];

    prisma.ingredient.findMany.mockResolvedValue(mockIngredients);

    const results = await analyzeIngredients('Water, Salicylic Acid', SkinType.DRY);

    expect(prisma.ingredient.findMany).toHaveBeenCalledWith({
      where: { name: { in: ['water', 'salicylic acid'] } },
      include: {
        rules: { where: { skinType: SkinType.DRY } }
      }
    });

    expect(results).toHaveLength(2);
    expect(results[0].effect).toBe('NEUTRAL');
    expect(results[0].description).toBe('Solvent');

    expect(results[1].effect).toBe('BAD');
    expect(results[1].description).toBe('BHA');
  });

  it('should set missing ingredients to NEUTRAL', async () => {
    prisma.ingredient.findMany.mockResolvedValue([]);

    const results = await analyzeIngredients('Unknown Ingredient', null);

    expect(results).toHaveLength(1);
    expect(results[0].effect).toBe('NEUTRAL');
    expect(results[0].description).toBeNull();
  });
});
