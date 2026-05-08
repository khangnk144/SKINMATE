import axios from 'axios';
import { extractIngredients } from './ingredientsExtractor';

export async function parseImageForIngredients(fileBuffer: Buffer, mimetype: string): Promise<string> {
    const apiKey = "K88482326888957";
    const base64Str = fileBuffer.toString('base64');
    const base64Image = `data:${mimetype};base64,${base64Str}`;

    const params = new URLSearchParams();
    params.append('base64Image', base64Image);
    params.append('language', 'eng');

    try {
        const response = await axios.post('https://api.ocr.space/parse/image', params.toString(), {
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        if (data && data.ParsedResults && data.ParsedResults.length > 0) {
            const parsedText = data.ParsedResults[0].ParsedText;
            return extractIngredients(parsedText);
        }
        
        return "";
    } catch (error) {
        console.error("OCR Space API error:", error);
        throw new Error("Failed to process image OCR");
    }
}
