import prisma from '../../config/database';

export const chatRepository = {
  async createConversation() {
    return prisma.conversation.create({
      data: {},
    });
  },

  async addParticipant(userId: string, conversationId: string) {
    return prisma.conversationParticipant.create({
      data: {
        userId,
        conversationId,
      },
    });
  },

  async findExistingConversation(userId1: string, userId2: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
      select: { id: true },
      take: 1,
    });
    return conversations[0] || null;
  },

  async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
            delivered: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getConversationById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });
  },

  async getMessages(conversationId: string, cursor?: string, limit: number = 50) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    return {
      messages: messages.reverse(),
      nextCursor: hasMore ? messages[0]?.id : null,
      hasMore,
    };
  },

  async createMessage(conversationId: string, senderId: string, content: string) {
    return prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  },

  async updateConversationTimestamp(conversationId: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  },

  async markMessagesAsDelivered(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        delivered: false,
      },
      data: { delivered: true },
    });
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, delivered: true },
    });

    const updatedMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: true,
      },
      orderBy: { createdAt: 'desc' },
      take: result.count || 1,
      select: { id: true },
    });

    return updatedMessages.map((m: { id: string }) => m.id);
  },

  async markMessageAsDelivered(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { delivered: true },
    });
  },

  async isParticipant(conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });
    return !!participant;
  },

  async getUnreadCount(conversationId: string, userId: string) {
    return prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
    });
  },
};
