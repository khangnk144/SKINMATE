import { PrismaClient, SkinType, SafetyEffect } from '@prisma/client';

const prisma = new PrismaClient();

export const adminService = {
  async getIngredients() {
    return await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async createIngredient(name: string, description?: string) {
    const normalizedName = name.trim().toLowerCase();
    
    // Check if exists
    const existing = await prisma.ingredient.findUnique({
      where: { name: normalizedName }
    });
    
    if (existing) {
      throw new Error('Ingredient already exists');
    }

    return await prisma.ingredient.create({
      data: {
        name: normalizedName,
        description,
      },
    });
  },

  async updateIngredient(id: number, name: string, description?: string) {
    const normalizedName = name.trim().toLowerCase();
    
    // Check if another ingredient exists with the same name
    const existing = await prisma.ingredient.findUnique({
      where: { name: normalizedName }
    });
    
    if (existing && existing.id !== id) {
      throw new Error('Another ingredient with this name already exists');
    }

    return await prisma.ingredient.update({
      where: { id },
      data: {
        name: normalizedName,
        description,
      },
    });
  },

  async deleteIngredient(id: number) {
    return await prisma.ingredient.delete({
      where: { id },
    });
  },

  async deleteAllIngredients() {
    return await prisma.ingredient.deleteMany();
  },

  async createOrUpdateRule(ingredientId: number, skinType: SkinType, effect: SafetyEffect) {
    const existingRule = await prisma.ingredientRule.findUnique({
      where: {
        ingredientId_skinType: {
          ingredientId,
          skinType,
        }
      }
    });

    if (existingRule) {
      return await prisma.ingredientRule.update({
        where: { id: existingRule.id },
        data: { effect }
      });
    }

    return await prisma.ingredientRule.create({
      data: {
        ingredientId,
        skinType,
        effect
      }
    });
  },

  async getRules() {
    return await prisma.ingredientRule.findMany({
      include: { ingredient: true },
      orderBy: { id: 'desc' }
    });
  },

  async deleteRule(id: number) {
    return await prisma.ingredientRule.delete({
      where: { id }
    });
  },

  async deleteAllRules() {
    return await prisma.ingredientRule.deleteMany();
  },
  
  async findOrCreateIngredients(names: string[]) {
    const resolvedIngredients = [];
    for (const name of names) {
      const normalizedName = name.trim().toLowerCase();
      if (!normalizedName) continue;

      let ingredient = await prisma.ingredient.findUnique({
        where: { name: normalizedName }
      });

      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: { name: normalizedName }
        });
      }
      resolvedIngredients.push(ingredient);
    }
    return resolvedIngredients;
  },

  async createProduct(name: string, brand: string, imageUrl?: string, ingredientNames: string[] = []) {
    const resolvedIngredients = await this.findOrCreateIngredients(ingredientNames);

    return await prisma.product.create({
      data: {
        name,
        brand,
        imageUrl,
        ingredients: {
          create: resolvedIngredients.map((ing, index) => ({
            ingredientId: ing.id,
            position: index + 1
          }))
        }
      }
    });
  },

  async getProducts() {
    return await prisma.product.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateProduct(id: string, name: string, brand: string, imageUrl?: string, ingredientNames: string[] = []) {
    const resolvedIngredients = await this.findOrCreateIngredients(ingredientNames);

    // Delete existing relations
    await prisma.productIngredient.deleteMany({
      where: { productId: id }
    });

    // Update product and create new relations
    return await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        imageUrl,
        ingredients: {
          create: resolvedIngredients.map((ing, index) => ({
            ingredientId: ing.id,
            position: index + 1
          }))
        }
      }
    });
  },

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id }
    });
  },

  async deleteAllProducts() {
    return await prisma.product.deleteMany();
  },

  async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        skinType: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!user) throw new Error('User not found');

    return await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
  },

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id }
    });
  },

  async getReports() {
    const totalUsers = await prisma.user.count();
    const totalAnalyses = await prisma.analysisHistory.count();
    
    // Distribution by skin type
    const skinTypeCounts = await prisma.user.groupBy({
      by: ['skinType'],
      _count: {
        _all: true
      }
    });

    return {
      totalUsers,
      totalAnalyses,
      skinTypeDistribution: skinTypeCounts.map(item => ({
        type: item.skinType || 'UNKNOWN',
        count: item._count._all
      }))
    };
  }
};
