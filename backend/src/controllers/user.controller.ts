import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getUserProfile, updateUserSkinType, changePassword as changePasswordService } from '../services/user.service';
import { SkinType } from '@prisma/client';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userProfile = await getUserProfile(userId);
    res.status(200).json(userProfile);
  } catch (error: any) {
    console.error('Get profile error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { skinType } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!skinType) {
      res.status(400).json({ error: 'skinType is required.' });
      return;
    }

    if (!Object.values(SkinType).includes(skinType as SkinType)) {
      res.status(400).json({ error: 'Invalid skinType.' });
      return;
    }

    const updatedUser = await updateUserSkinType(userId, skinType as SkinType);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'oldPassword and newPassword are required.' });
      return;
    }

    await changePasswordService(userId, oldPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.message === 'User not found' || error.message === 'Invalid current password.' || error.message === 'New password must be at least 6 characters long.') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};
