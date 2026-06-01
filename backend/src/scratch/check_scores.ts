import { PrismaClient, SkinType } from '@prisma/client';

// Scratch script de xem cach products duoc cham diem theo rules cua mot skinType.
// Logic nay ho tro debug recommendation, khong duoc frontend goi truc tiep.
const prisma = new PrismaClient();

async function checkScores(skinType: SkinType) {
  // Lay rules theo skinType de tinh GOOD/BAD cho tung ingredient trong san pham.
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

  const scored = products.map((product) => {
    // Diem debug: GOOD +1, BAD -2 de thay san pham nao nen uu tien/tranh.
    let score = 0;
    product.ingredients.forEach((pi) => {
      const effect = pi.ingredient.rules[0]?.effect;
      if (effect === 'GOOD') {
        score += 1;
      } else if (effect === 'BAD') {
        score -= 2;
      }
    });
    return {
      name: product.name,
      score,
    };
  });

  console.log(`Scores for ${skinType}:`);
  console.table(scored.sort((a, b) => b.score - a.score));
}

checkScores('DRY' as SkinType)
  .then(() => prisma.$disconnect());
