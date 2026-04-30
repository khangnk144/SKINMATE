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

  // 1. Only recommend products that have zero harmful ingredients for this skin type
  const safeProducts = products.filter((product) => {
    return !product.ingredients.some(
      (pi) => pi.ingredient.rules[0]?.effect === 'BAD'
    );
  });

  // 2. Calculate score for each product based on GOOD ingredients
  const scoredProducts = safeProducts.map((product) => {
    const score = product.ingredients.reduce((acc, pi) => {
      return pi.ingredient.rules[0]?.effect === 'GOOD' ? acc + 1 : acc;
    }, 0);
    return { ...product, score };
  });

  // 3. Sort by score descending and take the top 6 (the "pool")
  const topPool = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // 4. Shuffle the top pool and pick 3
  const shuffled = topPool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
  }));
};
