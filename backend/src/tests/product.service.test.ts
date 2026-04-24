import { getSafeRecommendations } from '../services/product.service';
import { SkinType } from '@prisma/client';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    product: {
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

describe('Product Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  it('should call prisma.product.findMany with include for ingredients and rules', async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await getSafeRecommendations(SkinType.DRY);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                rules: {
                  where: {
                    skinType: SkinType.DRY,
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('should calculate scores and filter products where score > 0', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: '1',
        name: 'Good Product',
        brand: 'BrandA',
        imageUrl: 'url1',
        ingredients: [
          { ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }
        ]
      },
      {
        id: '2',
        name: 'Bad Product',
        brand: 'BrandB',
        imageUrl: 'url2',
        ingredients: [
          { ingredient: { name: 'I2', rules: [{ effect: 'BAD' }] } }
        ]
      },
      {
        id: '3',
        name: 'Mixed Product',
        brand: 'BrandC',
        imageUrl: 'url3',
        ingredients: [
          { ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } },
          { ingredient: { name: 'I2', rules: [{ effect: 'BAD' }] } } // score = 1 - 2 = -1
        ]
      },
      {
        id: '4',
        name: 'Neutral Product',
        brand: 'BrandD',
        imageUrl: 'url4',
        ingredients: [
          { ingredient: { name: 'I3', rules: [{ effect: 'NEUTRAL' }] } } // score = 0
        ]
      }
    ]);

    const results = await getSafeRecommendations(SkinType.DRY);

    expect(results).toHaveLength(2); // Both Score 1 and Score 0 products should be returned
    const ids = results.map(r => r.id);
    expect(ids).toContain('1');
    expect(ids).toContain('4');
  });

  it('should pick 3 products from the top pool of 6', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: '1', name: 'P1', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '2', name: 'P2', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '3', name: 'P3', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '4', name: 'P4', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '5', name: 'P5', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '6', name: 'P6', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
      { id: '7', name: 'P7', ingredients: [{ ingredient: { name: 'I1', rules: [{ effect: 'GOOD' }] } }] },
    ]);

    const results = await getSafeRecommendations(SkinType.DRY);

    expect(results).toHaveLength(3);
    // All 3 should be from the top 6 (shuffled)
  });
});
