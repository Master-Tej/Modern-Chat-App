import { userRepository } from './user.repository';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { authRepository } from '../auth/auth.repository';

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; username?: string; bio?: string; avatar?: string }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (data.username && data.username !== user.username) {
      const existing = await authRepository.findByUsername(data.username);
      if (existing) {
        throw new ConflictError('Username already taken');
      }
    }

    return userRepository.updateUser(userId, data);
  },

  async searchUsers(query: string, currentUserId: string) {
    if (!query.trim()) {
      return [];
    }
    return userRepository.searchUsers(query.trim(), currentUserId);
  },

  async getUserByUsername(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    return userRepository.updateOnlineStatus(userId, isOnline);
  },
};
