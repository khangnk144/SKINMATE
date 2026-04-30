import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (userId: string) => {
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
