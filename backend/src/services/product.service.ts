import { PrismaClient, SkinType } from '@prisma/client';

const prisma = new PrismaClient();

export const getSafeRecommendations = async (skinType: SkinType, contextIngredients: string[] = []) => {
  const products = await prisma.product.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: {
            include: {
              rules: {
                where: {
                  skinType: skinType,
                },
              },
            },
          },
        },
      },
    },
  });

  const normalizedContext = contextIngredients.map((i) => i.toLowerCase());

  const recommended = products
    .map((product) => {
      let score = 0;
      let matchBonus = 0;

      product.ingredients.forEach((pi) => {
        const effect = pi.ingredient.rules[0]?.effect;
        if (effect === 'GOOD') {
          score += 1;
        } else if (effect === 'BAD') {
          score -= 2;
        }

        // Contextual bonus: if this product contains ingredients the user just analyzed
        if (normalizedContext.includes(pi.ingredient.name.toLowerCase())) {
          matchBonus += 0.5;
        }
      });

      const totalScore = score + matchBonus;

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        score: totalScore,
      };
    })
    .filter((p) => p.score >= 0) // Broaden pool to include neutral/safe products
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // To provide variety, we take the top 6 suitable products and shuffle them
  // before picking the top 3. This ensures the user sees different products
  // while still getting high-quality recommendations.
  const topPool = recommended.slice(0, 6);
  
  for (let i = topPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [topPool[i], topPool[j]] = [topPool[j], topPool[i]];
  }

  return topPool.slice(0, 3);
};
