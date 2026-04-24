import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
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
      skinType: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
