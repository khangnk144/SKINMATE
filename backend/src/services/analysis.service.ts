import { SkinType, SafetyEffect } from '@prisma/client';
import { analyzeWithGemini, GeminiAnalysisResult } from '../utils/gemini';
import prisma from '../utils/prisma';

export interface AnalysisResult {
  originalName: string;
  mappedName: string;
  effect: 'GOOD' | 'BAD' | 'NEUTRAL';
  description?: string | null;
  ingredientId?: number | null;
}

export const analyzeIngredients = async (inciString: string, skinType: SkinType | null): Promise<AnalysisResult[]> => {
  // Normalize: split by comma, trim, keep original case
  const rawIngredients = inciString.split(',').map(i => i.trim()).filter(i => i.length > 0);
  
  if (rawIngredients.length === 0) {
    return [];
  }

  const mappedNames = rawIngredients.map(i => i.toLowerCase());
  const uniqueMappedNames = Array.from(new Set(mappedNames));

  // Query ingredients with IN operator
  const existingIngredients = await prisma.ingredient.findMany({
    where: {
      name: {
        in: uniqueMappedNames,
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

  const existingMap = new Map(existingIngredients.map(i => [i.name, i]));
  const missingMappedNames = uniqueMappedNames.filter(name => !existingMap.has(name));

  let aiResults: GeminiAnalysisResult[] = [];
  if (missingMappedNames.length > 0 && skinType) {
    console.log(`[AI] Calling Gemini for missing ingredients: ${missingMappedNames.join(', ')}`);
    aiResults = await analyzeWithGemini(missingMappedNames, skinType);
    console.log(`[AI] Received results for ${aiResults.length} ingredients`);
    
    // Background task: Save AI results to DB for caching
    // We don't necessarily need to await this if we want to return fast, 
    // but for consistency we might want to ensure it's saved.
    // However, the user said "Tùy chọn" (Optional), but it's a good idea.
    try {
      for (const res of aiResults) {
        const lowerName = res.mappedName.toLowerCase();
        // Create ingredient if it doesn't exist
        const ingredient = await prisma.ingredient.upsert({
          where: { name: lowerName },
          update: {},
          create: {
            name: lowerName,
            description: res.description,
          },
        });

        // Create or update rule for this skinType
        await prisma.ingredientRule.upsert({
          where: {
            ingredientId_skinType: {
              ingredientId: ingredient.id,
              skinType: skinType,
            },
          },
          update: {
            effect: res.effect as SafetyEffect,
          },
          create: {
            ingredientId: ingredient.id,
            skinType: skinType,
            effect: res.effect as SafetyEffect,
          },
        });
      }
    } catch (dbError) {
      console.error('Error caching AI results to DB:', dbError);
    }
  }

  const results: AnalysisResult[] = rawIngredients.map(originalName => {
    const mappedName = originalName.toLowerCase();
    const foundIngredient = existingMap.get(mappedName);

    if (foundIngredient) {
      let effect: 'GOOD' | 'BAD' | 'NEUTRAL' = 'NEUTRAL';
      if (foundIngredient.rules && foundIngredient.rules.length > 0) {
        effect = foundIngredient.rules[0].effect as 'GOOD' | 'BAD' | 'NEUTRAL';
      }

      return {
        originalName,
        mappedName,
        effect,
        description: foundIngredient.description,
        ingredientId: foundIngredient.id,
      };
    }

    // Check if it was analyzed by AI in this request
    const aiRes = aiResults.find(r => r.mappedName.toLowerCase() === mappedName);
    if (aiRes) {
      return {
        originalName,
        mappedName: mappedName,
        effect: aiRes.effect,
        description: aiRes.description,
      };
    }

    // Default fallback
    return {
      originalName,
      mappedName,
      effect: 'NEUTRAL',
      description: null,
    };
  });

  return results;
};
