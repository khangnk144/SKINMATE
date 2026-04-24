import { Request, Response } from 'express';
import { register, login } from '../controllers/auth.controller';
import * as authService from '../services/auth.service';
import { SkinType } from '@prisma/client';

jest.mock('../services/auth.service');

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq = {
        body: {
          username: 'testuser',
          password: 'password123',
          skinType: 'OILY'
        }
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        skinType: 'OILY' as SkinType,
        role: 'USER' as any,
        createdAt: new Date(),
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockUser);

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: mockUser
      });
    });

    it('should return 400 if fields are missing', async () => {
      mockReq = { body: { username: 'testuser' } }; // missing password and skinType

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'All fields are required.' });
    });

    it('should return 400 for duplicate username', async () => {
      mockReq = {
        body: { username: 'duplicate', password: 'password123', skinType: 'NORMAL' }
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(new Error('Username already exists.'));

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Username already exists.' });
    });

    it('should return 400 for password too short', async () => {
      mockReq = {
        body: { username: 'testuser', password: '123', skinType: 'NORMAL' }
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(new Error('Password must be at least 6 characters long.'));

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long.' });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      mockReq = {
        body: { username: 'testuser', password: 'password123' }
      };

      const mockAuthData = {
        token: 'fake-jwt-token',
        user: {
          id: '1',
          username: 'testuser',
          skinType: 'NORMAL' as SkinType,
          role: 'USER' as any,
        }
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(mockAuthData);

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockAuthData);
    });

    it('should return 400 if fields are missing', async () => {
      mockReq = { body: { username: 'testuser' } }; // missing password

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Username and password are required.' });
    });

    it('should return 401 for wrong password or username', async () => {
      mockReq = {
        body: { username: 'testuser', password: 'wrongpassword' }
      };

      (authService.loginUser as jest.Mock).mockRejectedValue(new Error('Invalid username or password.'));

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid username or password.' });
    });
  });
});
