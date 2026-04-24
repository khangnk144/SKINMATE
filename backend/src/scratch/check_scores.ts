import { PrismaClient, SkinType } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScores(skinType: SkinType) {
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
