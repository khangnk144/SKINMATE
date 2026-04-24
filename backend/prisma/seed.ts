import { PrismaClient, SkinType, SafetyEffect } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data to avoid unique constraint errors during re-seeding
  await prisma.ingredientRule.deleteMany({});
  await prisma.ingredient.deleteMany({});

  const ingredientsData = [
    { name: 'water', description: 'Solvent, usually the main ingredient in cosmetics.' },
    { name: 'glycerin', description: 'Skin-replenishing and skin-restoring ingredient.' },
    { name: 'niacinamide', description: 'Vitamin B3, helps visibly improve enlarged pores, uneven skin tone.' },
    { name: 'salicylic acid', description: 'Beta hydroxy acid (BHA) that exfoliates skin and unclogs pores.' },
    { name: 'fragrance', description: 'Added for scent, can be sensitizing for some skin types.' },
  ];

  console.log('Creating ingredients...');
  const createdIngredients = await Promise.all(
    ingredientsData.map((data) => prisma.ingredient.create({ data }))
  );

  // Helper to find ID by name
  const getId = (name: string) => createdIngredients.find((i) => i.name === name)?.id;

  const rulesData = [
    // Salicylic Acid rules
    { ingredientId: getId('salicylic acid')!, skinType: SkinType.DRY, effect: SafetyEffect.BAD },
    { ingredientId: getId('salicylic acid')!, skinType: SkinType.OILY, effect: SafetyEffect.GOOD },
    { ingredientId: getId('salicylic acid')!, skinType: SkinType.SENSITIVE, effect: SafetyEffect.BAD },
    
    // Fragrance rules
    { ingredientId: getId('fragrance')!, skinType: SkinType.SENSITIVE, effect: SafetyEffect.BAD },
    
    // Niacinamide rules
    { ingredientId: getId('niacinamide')!, skinType: SkinType.OILY, effect: SafetyEffect.GOOD },
    { ingredientId: getId('niacinamide')!, skinType: SkinType.DRY, effect: SafetyEffect.GOOD },
    { ingredientId: getId('niacinamide')!, skinType: SkinType.COMBINATION, effect: SafetyEffect.GOOD },
  ];

  console.log('Creating ingredient rules...');
  for (const rule of rulesData) {
    await prisma.ingredientRule.create({ data: rule });
  }

  // Clean up products
  await prisma.productIngredient.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Creating products...');
  const productsData = [
    { name: 'Gentle Cleanser', brand: 'SkinCo', imageUrl: 'https://via.placeholder.com/150' },
    { name: 'BHA Exfoliant', brand: 'ClearSkin', imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Perfumed Lotion', brand: 'Scented Beauty', imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Niacinamide Serum', brand: 'GlowUp', imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Harsh Scrub', brand: 'ScrubIt', imageUrl: 'https://via.placeholder.com/150' },
  ];

  const createdProducts = await Promise.all(
    productsData.map((data) => prisma.product.create({ data }))
  );

  const getProductId = (name: string) => createdProducts.find((p) => p.name === name)?.id;

  const productIngredientsData = [
    // Gentle Cleanser: water, glycerin
    { productId: getProductId('Gentle Cleanser')!, ingredientId: getId('water')!, position: 1 },
    { productId: getProductId('Gentle Cleanser')!, ingredientId: getId('glycerin')!, position: 2 },
    
    // BHA Exfoliant: water, salicylic acid
    { productId: getProductId('BHA Exfoliant')!, ingredientId: getId('water')!, position: 1 },
    { productId: getProductId('BHA Exfoliant')!, ingredientId: getId('salicylic acid')!, position: 2 },
    
    // Perfumed Lotion: water, glycerin, fragrance
    { productId: getProductId('Perfumed Lotion')!, ingredientId: getId('water')!, position: 1 },
    { productId: getProductId('Perfumed Lotion')!, ingredientId: getId('glycerin')!, position: 2 },
    { productId: getProductId('Perfumed Lotion')!, ingredientId: getId('fragrance')!, position: 3 },

    // Niacinamide Serum: water, niacinamide, glycerin
    { productId: getProductId('Niacinamide Serum')!, ingredientId: getId('water')!, position: 1 },
    { productId: getProductId('Niacinamide Serum')!, ingredientId: getId('niacinamide')!, position: 2 },
    { productId: getProductId('Niacinamide Serum')!, ingredientId: getId('glycerin')!, position: 3 },

    // Harsh Scrub: water, salicylic acid, fragrance
    { productId: getProductId('Harsh Scrub')!, ingredientId: getId('water')!, position: 1 },
    { productId: getProductId('Harsh Scrub')!, ingredientId: getId('salicylic acid')!, position: 2 },
    { productId: getProductId('Harsh Scrub')!, ingredientId: getId('fragrance')!, position: 3 },
  ];

  console.log('Linking products to ingredients...');
  for (const pi of productIngredientsData) {
    await prisma.productIngredient.create({ data: pi });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
