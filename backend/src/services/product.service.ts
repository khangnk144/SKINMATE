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

  // Only recommend products that have zero harmful ingredients for this skin type
  const recommended = products.filter((product) => {
    return !product.ingredients.some(
      (pi) => pi.ingredient.rules[0]?.effect === 'BAD'
    );
  });

  return recommended.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
  }));
};
