import prisma from '../../config/database';

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateUser(id: string, data: { name?: string; username?: string; bio?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async searchUsers(query: string, currentUserId: string) {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 20,
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });
  },

  async updateOnlineStatus(id: string, isOnline: boolean) {
    return prisma.user.update({
      where: { id },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
    });
  },
};
