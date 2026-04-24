import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/admin.routes';
import jwt from 'jsonwebtoken';
import { adminService } from '../services/admin.service';

const app = express();
app.use(express.json());
app.use('/api/v1/admin', adminRoutes);

jest.mock('../services/admin.service');
jest.mock('jsonwebtoken');

describe('Admin Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/admin/ingredients');
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden if user is not an ADMIN', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', role: 'USER' });
      const res = await request(app)
        .get('/api/v1/admin/ingredients')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/admin/ingredients', () => {
    it('should create an ingredient, successfully normalizing the name', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1', role: 'ADMIN' });
      (adminService.createIngredient as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'retinol',
        description: 'Vitamin A derivative',
      });

      const res = await request(app)
        .post('/api/v1/admin/ingredients')
        .set('Authorization', 'Bearer admin_token')
        .send({ name: ' RETINOL ', description: 'Vitamin A derivative' });

      expect(res.status).toBe(201);
      expect(adminService.createIngredient).toHaveBeenCalledWith(' RETINOL ', 'Vitamin A derivative');
      expect(res.body.name).toBe('retinol');
    });
  });
});
