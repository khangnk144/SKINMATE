import axios from 'axios';
import { SkinType } from '@prisma/client';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

export interface GeminiAnalysisResult {
  mappedName: string;
  effect: 'GOOD' | 'BAD' | 'NEUTRAL';
  description: string;
}

export const analyzeWithGemini = async (missingIngredients: string[], skinType: SkinType | null): Promise<GeminiAnalysisResult[]> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not defined');
    return [];
  }

  if (missingIngredients.length === 0) return [];

  const prompt = `
Bạn là một bác sĩ da liễu. Hệ thống của chúng tôi không có dữ liệu về các thành phần mỹ phẩm sau: [${missingIngredients.join(', ')}].
Người dùng hiện tại có loại da là: [${skinType || 'NORMAL'}].
Hãy đánh giá xem các thành phần này là an toàn (GOOD), có khả năng gây hại/kích ứng (BAD), hay vô thưởng vô phạt (NEUTRAL) đối với loại da này.
Yêu cầu BẮT BUỘC:
1. Phải sử dụng đúng tên thành phần (mappedName) được cung cấp trong danh sách trên (viết thường hoàn toàn).
2. Phải trả về ĐÚNG định dạng JSON sau (không giải thích thêm):
[{ "mappedName": "tên_thành_phần_viết_thường", "effect": "GOOD" | "BAD" | "NEUTRAL", "description": "Mô tả ngắn gọn lý do bằng tiếng Việt (dưới 20 chữ)." },...]
`;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        response_mime_type: "application/json",
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      }
    });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Empty response from Gemini');
    }

    const parsedResults: GeminiAnalysisResult[] = JSON.parse(content);
    console.log('[AI] Gemini response parsed successfully:', JSON.stringify(parsedResults, null, 2));
    return parsedResults;
  } catch (error: any) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    return [];
  }
};
