import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { SkinType } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, skinType } = req.body;

    if (!username || !password || !skinType) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }
    
    if (!Object.values(SkinType).includes(skinType as SkinType)) {
      res.status(400).json({ error: 'Invalid skinType.' });
      return;
    }

    const newUser = await registerUser(username, password, skinType as SkinType);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error: any) {
    if (error.message === 'Password must be at least 6 characters long.' || error.message === 'Username already exists.') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const authData = await loginUser(username, password);
    res.status(200).json(authData);
  } catch (error: any) {
    if (error.message === 'Invalid username or password.') {
      res.status(401).json({ error: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
