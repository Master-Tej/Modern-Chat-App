import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { chatService } from './chat.service';

export const chatController = {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await chatService.getConversations(req.userId!);
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  },

  async createConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const conversation = await chatService.createConversation(req.userId!, userId);
      res.status(201).json({
        success: true,
        message: 'Conversation created',
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 50;

      const result = await chatService.getMessages(id, req.userId!, cursor, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const count = await chatService.getUnreadCount(id, req.userId!);
      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },
};
