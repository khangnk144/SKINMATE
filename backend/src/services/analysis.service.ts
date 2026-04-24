import { PrismaClient, SkinType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalysisResult {
  originalName: string;
  mappedName: string;
  effect: 'GOOD' | 'BAD' | 'NEUTRAL';
  description?: string | null;
}

export const analyzeIngredients = async (inciString: string, skinType: SkinType | null): Promise<AnalysisResult[]> => {
  // Normalize: split by comma, trim, keep original case
  const rawIngredients = inciString.split(',').map(i => i.trim()).filter(i => i.length > 0);
  
  if (rawIngredients.length === 0) {
    return [];
  }

  const mappedNames = rawIngredients.map(i => i.toLowerCase());

  // Query ingredients with IN operator
  const ingredients = await prisma.ingredient.findMany({
    where: {
      name: {
        in: mappedNames,
      },
    },
    include: {
      rules: skinType ? {
        where: {
          skinType: skinType,
        },
      } : false,
    },
  });

  const results: AnalysisResult[] = rawIngredients.map(originalName => {
    const mappedName = originalName.toLowerCase();
    const foundIngredient = ingredients.find(i => i.name === mappedName);

    if (!foundIngredient) {
      return {
        originalName,
        mappedName,
        effect: 'NEUTRAL',
        description: null,
      };
    }

    let effect: 'GOOD' | 'BAD' | 'NEUTRAL' = 'NEUTRAL';
    if (foundIngredient.rules && foundIngredient.rules.length > 0) {
      effect = foundIngredient.rules[0].effect as 'GOOD' | 'BAD' | 'NEUTRAL';
    }

    return {
      originalName,
      mappedName,
      effect,
      description: foundIngredient.description,
    };
  });

  return results;
};
