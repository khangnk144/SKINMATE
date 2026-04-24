import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';

export const registerUser = async (username: string, passwordRaw: string, skinType: SkinType) => {
  // Validate input length
  if (passwordRaw.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // Check if username exists
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('Username already exists.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordRaw, salt);

  // Save user
  const newUser = await prisma.user.create({
    data: {
      username,
      passwordHash,
      skinType,
    },
    select: {
      id: true,
      username: true,
      skinType: true,
      role: true,
      createdAt: true
    }
  });

  return newUser;
};

export const loginUser = async (username: string, passwordRaw: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error('Invalid username or password.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Your account has been locked by an Administrator.');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid username or password.');
  }

  // Generate Token
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      skinType: user.skinType,
    },
    jwtSecret,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      skinType: user.skinType,
      role: user.role,
    }
  };
};
