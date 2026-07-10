import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { userService } from './user.service';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.userId!);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, username, bio, avatar } = req.body;
      const user = await userService.updateProfile(req.userId!, { name, username, bio, avatar });
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q : '';
      const users = await userService.searchUsers(query, req.userId!);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserByUsername(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const username = req.params.username as string;
      const user = await userService.getUserByUsername(username);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
