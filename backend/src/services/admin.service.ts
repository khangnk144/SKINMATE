import { PrismaClient, SkinType, SafetyEffect, ReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AiSuggestionListQuery extends ListQuery {
  status?: ReportStatus;
}

// Chuan hoa pagination cho cac trang admin.
// limit duoc cap o 100 de tranh query qua lon khi admin tim kiem.
const getPagination = (query?: ListQuery) => {
  if (!query?.page && !query?.limit && !query?.search) return null;

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const search = query.search?.trim();

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search,
  };
};

const paginated = <T>(items: T[], total: number, page: number, limit: number) => ({
  items,
  total,
  page,
  limit,
});

const buildPendingAiSuggestionKey = (ingredientName: string, skinType: SkinType) =>
  `${ingredientName.trim().toLowerCase()}::${skinType}::PENDING`;

const buildResolvedAiSuggestionKey = (id: number, status: ReportStatus) =>
  `AI_SUGGESTION::${status}::${id}`;

export const adminService = {
  async getIngredients(query?: ListQuery) {
    const pagination = getPagination(query);
    if (pagination) {
      // Khi co search/page/limit, tra object co metadata de frontend render pagination.
      const where = pagination.search
        ? { name: { contains: pagination.search, mode: 'insensitive' as const } }
        : {};
      const [items, total] = await Promise.all([
        prisma.ingredient.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        prisma.ingredient.count({ where }),
      ]);

      return paginated(items, total, pagination.page, pagination.limit);
    }

    return await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async createIngredient(name: string, description?: string) {
    const normalizedName = name.trim().toLowerCase();
    
    // Ten ingredient luu lowercase de match voi INCI input sau khi normalize.
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
    
    // Khong cho doi ten ingredient thanh ten da thuoc ve ingredient khac.
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
    // Moi ingredient chi co mot rule cho moi skinType, nen thao tac admin la upsert thu cong.
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

  async getRules(query?: ListQuery) {
    const pagination = getPagination(query);
    if (pagination) {
      const where = pagination.search
        ? { ingredient: { name: { contains: pagination.search, mode: 'insensitive' as const } } }
        : {};
      const [items, total] = await Promise.all([
        prisma.ingredientRule.findMany({
          where,
          include: { ingredient: true },
          orderBy: { id: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        prisma.ingredientRule.count({ where }),
      ]);

      return paginated(items, total, pagination.page, pagination.limit);
    }

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

  async createOrUpdateAiSuggestion(
    ingredientName: string,
    skinType: SkinType,
    suggestedEffect: SafetyEffect,
    suggestedDescription?: string | null,
    source = 'GEMINI'
  ) {
    const normalizedName = ingredientName.trim().toLowerCase();
    if (!normalizedName) return null;

    return await prisma.aiIngredientSuggestion.upsert({
      where: { pendingKey: buildPendingAiSuggestionKey(normalizedName, skinType) },
      update: {
        suggestedEffect,
        suggestedDescription,
        source,
        occurrenceCount: { increment: 1 },
      },
      create: {
        ingredientName: normalizedName,
        skinType,
        suggestedEffect,
        suggestedDescription,
        source,
        pendingKey: buildPendingAiSuggestionKey(normalizedName, skinType),
      },
    });
  },

  async getAiSuggestions(query?: AiSuggestionListQuery) {
    const status = query?.status || ReportStatus.PENDING;
    const pagination = getPagination(query);
    const where = {
      status,
      ...(pagination?.search
        ? { ingredientName: { contains: pagination.search, mode: 'insensitive' as const } }
        : {}),
    };

    const include = {
      reviewer: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    };

    if (pagination) {
      const [items, total] = await Promise.all([
        prisma.aiIngredientSuggestion.findMany({
          where,
          include,
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        prisma.aiIngredientSuggestion.count({ where }),
      ]);

      return paginated(items, total, pagination.page, pagination.limit);
    }

    return await prisma.aiIngredientSuggestion.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
  },

  async resolveAiSuggestion(id: number, status: ReportStatus, adminId: string, adminNote?: string) {
    return await prisma.$transaction(async (tx) => {
      const suggestion = await tx.aiIngredientSuggestion.findUnique({ where: { id } });
      if (!suggestion) throw new Error('AI suggestion not found');
      if (suggestion.status !== ReportStatus.PENDING) throw new Error('AI suggestion is not pending');

      if (status === ReportStatus.APPROVED) {
        const ingredient = await tx.ingredient.upsert({
          where: { name: suggestion.ingredientName },
          update: {},
          create: {
            name: suggestion.ingredientName,
            description: suggestion.suggestedDescription,
          },
        });

        if (!ingredient.description && suggestion.suggestedDescription) {
          await tx.ingredient.update({
            where: { id: ingredient.id },
            data: { description: suggestion.suggestedDescription },
          });
        }

        await tx.ingredientRule.upsert({
          where: {
            ingredientId_skinType: {
              ingredientId: ingredient.id,
              skinType: suggestion.skinType,
            },
          },
          update: { effect: suggestion.suggestedEffect },
          create: {
            ingredientId: ingredient.id,
            skinType: suggestion.skinType,
            effect: suggestion.suggestedEffect,
          },
        });
      }

      return await tx.aiIngredientSuggestion.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          adminNote,
          pendingKey: buildResolvedAiSuggestionKey(id, status),
        },
      });
    });
  },
  
  async findOrCreateIngredients(names: string[]) {
    // Dung cho product import/CRUD: neu INCI chua co thi tao ingredient nen toi thieu.
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
    // San pham luu quan he ProductIngredient theo position de giu thu tu INCI tren nhan.
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

  async getProducts(query?: ListQuery) {
    const pagination = getPagination(query);
    if (pagination) {
      const where = pagination.search
        ? {
            OR: [
              { name: { contains: pagination.search, mode: 'insensitive' as const } },
              { brand: { contains: pagination.search, mode: 'insensitive' as const } },
            ],
          }
        : {};
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            ingredients: {
              include: { ingredient: true },
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        prisma.product.count({ where }),
      ]);

      return paginated(items, total, pagination.page, pagination.limit);
    }

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

    // Xoa relation cu truoc khi tao lai de cap nhat dung danh sach va thu tu INCI moi.
    await prisma.productIngredient.deleteMany({
      where: { productId: id }
    });

    // Update thong tin san pham va tao relation moi trong cung lenh Prisma nested write.
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

  async getUsers(query?: ListQuery) {
    const pagination = getPagination(query);
    if (pagination) {
      const where = pagination.search
        ? { username: { contains: pagination.search, mode: 'insensitive' as const } }
        : {};
      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            skinType: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        prisma.user.count({ where }),
      ]);

      return paginated(items, total, pagination.page, pagination.limit);
    }

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
    // Toggle trang thai giup admin khoa/mo khoa ma khong mat history/report cua user.
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

  async getDashboardStats() {
    // Transaction gom cac count doc lap vao mot round-trip DB.
    const [ingredients, rules, products, users, analyses] = await prisma.$transaction([
      prisma.ingredient.count(),
      prisma.ingredientRule.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.analysisHistory.count(),
    ]);

    return { ingredients, rules, products, users, analyses };
  },

  async getReports() {
    const totalUsers = await prisma.user.count();
    const totalAnalyses = await prisma.analysisHistory.count();
    
    // groupBy tinh phan bo loai da cho pie chart admin reports.
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
