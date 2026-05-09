import { PrismaClient, SkinType, SafetyEffect, ReportStatus, VoteType } from '@prisma/client';
import { adminService } from './admin.service';

const prisma = new PrismaClient();

export const reportService = {
  async createReport(
    userId: string,
    ingredientId: number,
    skinType: SkinType,
    reportedEffect: SafetyEffect,
    reason: string,
    evidenceUrl?: string
  ) {
    return await prisma.ingredientReport.create({
      data: {
        userId,
        ingredientId,
        skinType,
        reportedEffect,
        reason,
        evidenceUrl,
        status: ReportStatus.PENDING,
      },
    });
  },

  async vote(reportId: number, userId: string, voteType: VoteType) {
    const report = await prisma.ingredientReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new Error('Report not found');
    }

    const existingVote = await prisma.reportVote.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle vote off if same
        await prisma.reportVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote
        await prisma.reportVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
      }
    } else {
      // Create new vote
      await prisma.reportVote.create({
        data: {
          reportId,
          userId,
          voteType,
        },
      });
    }

    // Return current vote counts and user's vote
    const [upVotes, downVotes, userVoteRec] = await Promise.all([
      prisma.reportVote.count({ where: { reportId, voteType: VoteType.UP } }),
      prisma.reportVote.count({ where: { reportId, voteType: VoteType.DOWN } }),
      prisma.reportVote.findUnique({ where: { reportId_userId: { reportId, userId } } }),
    ]);

    return {
      up: upVotes,
      down: downVotes,
      userVote: userVoteRec ? userVoteRec.voteType : null,
    };
  },

  async getPendingReports(sortBy: 'votes' | 'newest', limit: number, offset: number) {
    const reports = await prisma.ingredientReport.findMany({
      where: { status: ReportStatus.PENDING },
      include: {
        ingredient: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        votes: true,
      },
    });

    // Compute up, down, voteScore
    const computedReports = reports.map(report => {
      let up = 0;
      let down = 0;
      report.votes.forEach(v => {
        if (v.voteType === VoteType.UP) up++;
        else if (v.voteType === VoteType.DOWN) down++;
      });
      return {
        ...report,
        up,
        down,
        voteScore: up - down,
      };
    });

    // Sort
    if (sortBy === 'votes') {
      computedReports.sort((a, b) => b.voteScore - a.voteScore);
    } else {
      computedReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Pagination
    const paginated = computedReports.slice(offset, offset + limit);

    return {
      data: paginated,
      total: computedReports.length,
    };
  },

  async resolveReport(reportId: number, status: ReportStatus, adminId: string, adminNote?: string) {
    const report = await prisma.ingredientReport.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found');
    if (report.status !== ReportStatus.PENDING) throw new Error('Report is not pending');

    if (status === ReportStatus.APPROVED) {
      await adminService.createOrUpdateRule(report.ingredientId, report.skinType, report.reportedEffect);
    }

    return await prisma.ingredientReport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
        resolvedBy: adminId,
        adminNote,
      },
    });
  },

  async getUserVote(reportId: number, userId: string) {
    const vote = await prisma.reportVote.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    });
    return vote ? vote.voteType : null;
  },
};
