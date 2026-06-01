import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { SkinType } from '@prisma/client';

export const registerUser = async (username: string, passwordRaw: string, skinType: SkinType, displayName?: string) => {
  // Validate mat khau o service de du moi controller nao goi vao cung dung rule bao mat.
  if (passwordRaw.length < 6) {
    throw new Error('Mật khẩu phải dài ít nhất 6 ký tự.');
  }

  // username la unique trong database, check truoc de tra loi loi than thien hon Prisma error.
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('Tên đăng nhập đã tồn tại.');
  }

  // Chi luu passwordHash, khong bao gio luu passwordRaw vao database.
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordRaw, salt);

  // select bo passwordHash khoi response tra ve controller/frontend.
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
  // Dang nhap bat dau bang username; neu khong tim thay thi tra loi chung de khong lo thong tin tai khoan.
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
  }

  // Admin co the khoa tai khoan bang isActive=false ma khong xoa du lieu.
  if (!user.isActive) {
    throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
  }

  // So sanh password nguoi dung nhap voi hash da luu bang bcrypt.
  const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isMatch) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
  }

  // JWT chua thong tin toi thieu frontend/backend can cho phan quyen va ca nhan hoa.
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
