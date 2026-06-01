import { PrismaClient, SkinType } from '@prisma/client';

const prisma = new PrismaClient();

export const getSafeRecommendations = async (skinType: SkinType, contextIngredients: string[] = []) => {
  // Lay product kem ingredients va rules cho skinType hien tai de cham diem trong memory.
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

  // 1. Chi goi y san pham khong co ingredient BAD voi loai da nay.
  const safeProducts = products.filter((product) => {
    return !product.ingredients.some(
      (pi) => pi.ingredient.rules[0]?.effect === 'BAD'
    );
  });

  // 2. Diem = so ingredient GOOD; contextIngredients hien chua dung nhung giu tham so cho ranking tuong lai.
  const scoredProducts = safeProducts.map((product) => {
    const score = product.ingredients.reduce((acc, pi) => {
      return pi.ingredient.rules[0]?.effect === 'GOOD' ? acc + 1 : acc;
    }, 0);
    return { ...product, score };
  });

  // 3. Lay top pool diem cao de recommendation vua tot vua co chut da dang.
  const topPool = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // 4. Tron pool roi chon 3 de UI khong lap y het moi lan goi.
  const shuffled = topPool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
  }));
};
