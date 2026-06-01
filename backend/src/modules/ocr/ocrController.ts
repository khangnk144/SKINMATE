import { Request, Response } from 'express';
import { parseImageForIngredients } from './ocrService';

export async function extractIngredientsController(req: Request, res: Response) {
    try {
        // File anh da duoc multer doc vao req.file.buffer trong ocrRoutes.
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        // Service goi OCR.Space roi loc ra chuoi ingredient de frontend dien vao textarea.
        const ingredients = await parseImageForIngredients(req.file.buffer, req.file.mimetype);
        
        return res.status(200).json({ ingredients });
    } catch (error) {
        console.error("Error in extractIngredientsController:", error);
        if ((error as any)?.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: "Image file is too large", ingredients: "" });
        }
        return res.status(500).json({ error: "Failed to process image", ingredients: "" });
    }
}
