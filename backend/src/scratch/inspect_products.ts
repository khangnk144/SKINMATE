import { PrismaClient } from '@prisma/client';

// Scratch script dung de debug nhanh product + ingredient dang co trong database.
// Khong phai API runtime; chay thu cong khi can kiem tra du lieu seed/import.
const prisma = new PrismaClient();

async function inspectProducts() {
  // Include ingredient relation de in ra chuoi INCI cua tung product.
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
