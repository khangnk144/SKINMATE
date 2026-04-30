import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { SkinType } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, skinType, displayName } = req.body;

    if (!username || !password || !skinType) {
      res.status(400).json({ error: 'Tất cả các trường là bắt buộc.' });
      return;
    }
    
    if (!Object.values(SkinType).includes(skinType as SkinType)) {
      res.status(400).json({ error: 'Loại da không hợp lệ.' });
      return;
    }

    const newUser = await registerUser(username, password, skinType as SkinType, displayName);
    res.status(201).json({ message: 'Đăng ký người dùng thành công', user: newUser });
  } catch (error: any) {
    if (error.message === 'Mật khẩu phải dài ít nhất 6 ký tự.' || error.message === 'Tên đăng nhập đã tồn tại.') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc.' });
      return;
    }

    const authData = await loginUser(username, password);
    res.status(200).json(authData);
  } catch (error: any) {
    if (error.message === 'Tên đăng nhập hoặc mật khẩu không hợp lệ.') {
      res.status(401).json({ error: error.message });
      return;
    }
    if (error.message === 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.') {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};
