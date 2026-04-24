import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectProducts() {
  const products = await prisma.product.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true
        }
      }
    }
  });

  products.forEach(p => {
    console.log(`Product: ${p.name}`);
    console.log(`Ingredients: ${p.ingredients.map(i => i.ingredient.name).join(', ')}`);
    console.log('---');
  });
}

inspectProducts().then(() => prisma.$disconnect());
