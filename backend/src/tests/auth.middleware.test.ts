import { Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 401 if authorization header is missing', () => {
    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Missing or invalid token' });
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' });
  });

  it('should call next and set req.user if token is valid', () => {
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    const mockDecoded = { userId: '123', role: 'USER', skinType: 'OILY' };
    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as AuthRequest).user).toEqual(mockDecoded);
  });
});
