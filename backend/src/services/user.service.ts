import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (userId: string) => {
  // Profile API chi tra thong tin an toan, khong select passwordHash.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      skinType: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUserSkinType = async (userId: string, skinType: SkinType) => {
  // Helper cu chi doi skinType; updateUserProfile ben duoi la flow moi co them displayName.
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { skinType },
    select: {
      id: true,
      username: true,
      displayName: true,
      skinType: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const updateUserProfile = async (userId: string, skinType: SkinType, displayName?: string) => {
  // displayName chi update khi controller truyen field nay; cho phep giu nguyen neu undefined.
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      skinType,
      ...(displayName !== undefined ? { displayName } : {}),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      skinType: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const changePassword = async (userId: string, oldPasswordRaw: string, newPasswordRaw: string) => {
  // Validation password moi dat o service de tranh bo sot khi co UI/API moi.
  if (newPasswordRaw.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Phai verify password hien tai truoc khi hash va luu password moi.
  const isMatch = await bcrypt.compare(oldPasswordRaw, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid current password.');
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPasswordRaw, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });
};
