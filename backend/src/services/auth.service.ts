import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';

export const registerUser = async (username: string, passwordRaw: string, skinType: SkinType, displayName?: string) => {
  // Validate input length
  if (passwordRaw.length < 6) {
    throw new Error('Mật khẩu phải dài ít nhất 6 ký tự.');
  }

  // Check if username exists
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('Tên đăng nhập đã tồn tại.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordRaw, salt);

  // Save user
  const newUser = await prisma.user.create({
    data: {
      username,
      displayName: displayName || null,
      passwordHash,
      skinType,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
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
    throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isMatch) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
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
      displayName: user.displayName,
      skinType: user.skinType,
      role: user.role,
    }
  };
};
