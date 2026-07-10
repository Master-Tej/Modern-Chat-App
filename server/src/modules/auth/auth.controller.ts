import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { env } from '../../config/env';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'No refresh token',
        });
        return;
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

      res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.userId) {
        await authService.logoutAll(req.userId);
      }

      res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  },
};
