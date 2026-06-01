import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { analyzeIngredients } from '../services/analysis.service';
import { SkinType } from '@prisma/client';
import prisma from '../utils/prisma';

export const checkAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inciString } = req.body;

    // inciString la danh sach INCI nguoi dung nhap/OCR trich xuat, bat buoc la chuoi khong rong.
    if (!inciString || typeof inciString !== 'string') {
      res.status(400).json({ error: 'inciString is required and must be a non-empty string' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Refresh skinType tu DB de neu user vua cap nhat profile, phan tich dung gia tri moi nhat.
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const skinType = user.skinType as SkinType | null;

    // Service thuc hien parse INCI, tra rule co san, goi AI cho thanh phan chua co va cache ket qua.
    const results = await analyzeIngredients(inciString, skinType);
    
    // Luu lich su sau khi phan tich thanh cong de user co the chay lai tu trang History.
    await prisma.analysisHistory.create({
      data: {
        userId: user.id,
        rawInput: inciString,
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
