import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { reportService } from '../services/report.service';
import { ReportStatus, SafetyEffect, SkinType, VoteType } from '@prisma/client';

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ingredientId, skinType, reportedEffect, reason, evidenceUrl } = req.body;

    if (!ingredientId || !skinType || !reportedEffect || !reason) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!Object.values(SkinType).includes(skinType as SkinType)) {
      res.status(400).json({ error: 'Invalid skin type' });
      return;
    }

    if (!Object.values(SafetyEffect).includes(reportedEffect as SafetyEffect)) {
      res.status(400).json({ error: 'Invalid reported effect' });
      return;
    }

    const report = await reportService.createReport(
      userId,
      ingredientId,
      skinType,
      reportedEffect,
      reason,
      evidenceUrl
    );

    res.status(201).json(report);
  } catch (error: any) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const voteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reportId, voteType } = req.body;

    if (!reportId || !voteType) {
      res.status(400).json({ error: 'Missing reportId or voteType' });
      return;
    }

    if (!Object.values(VoteType).includes(voteType as VoteType)) {
      res.status(400).json({ error: 'Invalid vote type' });
      return;
    }

    const result = await reportService.vote(reportId, userId, voteType);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Vote report error:', error);
    if (error.message === 'Report not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sortBy = (req.query.sortBy as 'votes' | 'newest') || 'newest';
    const limit = parseInt((req.query.limit as string) || '20');
    const offset = parseInt((req.query.offset as string) || '0');

    const result = await reportService.getPendingReports(sortBy, limit, offset);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Get pending reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const reportId = parseInt(req.params.reportId);
    if (isNaN(reportId)) {
      res.status(400).json({ error: 'Invalid reportId' });
      return;
    }

    const voteType = await reportService.getUserVote(reportId, userId);
    res.status(200).json({ voteType });
  } catch (error: any) {
    console.error('Get user vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    // Assuming auth middleware + admin middleware have run, req.user is admin
    if (!adminId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reportId, status, adminNote } = req.body;

    if (!reportId || !status) {
      res.status(400).json({ error: 'Missing reportId or status' });
      return;
    }

    if (![ReportStatus.APPROVED, ReportStatus.REJECTED].includes(status as ReportStatus)) {
      res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED.' });
      return;
    }

    const result = await reportService.resolveReport(reportId, status, adminId, adminNote);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Resolve report error:', error);
    if (error.message === 'Report not found' || error.message === 'Report is not pending') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
