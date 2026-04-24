import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/user.routes';
import jwt from 'jsonwebtoken';
import * as userService from '../services/user.service';

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);

jest.mock('../services/user.service');
jest.mock('jsonwebtoken');

describe('User Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      expect(res.status).toBe(401);
    });

    it('should return profile data for authenticated user', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', role: 'USER' });
      const mockProfile = { id: '123', username: 'testuser', skinType: 'NORMAL', role: 'USER', createdAt: new Date(), updatedAt: new Date() };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer valid_token');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('123');
      expect(res.body.username).toBe('testuser');
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .send({ skinType: 'OILY' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if skinType is invalid', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', role: 'USER' });
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer valid_token')
        .send({ skinType: 'INVALID_TYPE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid skinType.');
    });

    it('should update and return user profile', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', role: 'USER' });
      const mockUpdatedProfile = { id: '123', username: 'testuser', skinType: 'OILY', role: 'USER', createdAt: new Date(), updatedAt: new Date() };
      (userService.updateUserSkinType as jest.Mock).mockResolvedValue(mockUpdatedProfile);

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer valid_token')
        .send({ skinType: 'OILY' });

      expect(res.status).toBe(200);
      expect(res.body.skinType).toBe('OILY');
    });
  });
});
