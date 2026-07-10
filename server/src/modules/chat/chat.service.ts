import { chatRepository } from './chat.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

export const chatService = {
  async getConversations(userId: string) {
    return chatRepository.getUserConversations(userId);
  },

  async createConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestError('Cannot create conversation with yourself');
    }

    const existing = await chatRepository.findExistingConversation(userId, otherUserId);
    if (existing) {
      const conversation = await chatRepository.getConversationById(existing.id);
      if (!conversation) {
        throw new NotFoundError('Conversation');
      }
      return conversation;
    }

    const conversation = await chatRepository.createConversation();
    await chatRepository.addParticipant(userId, conversation.id);
    await chatRepository.addParticipant(otherUserId, conversation.id);

    const fullConversation = await chatRepository.getConversationById(conversation.id);
    if (!fullConversation) {
      throw new NotFoundError('Conversation');
    }
    return fullConversation;
  },

  async getMessages(conversationId: string, userId: string, cursor?: string, limit?: number) {
    const isParticipant = await chatRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant of this conversation');
    }

    return chatRepository.getMessages(conversationId, cursor, limit);
  },

  async createMessage(conversationId: string, senderId: string, content: string) {
    const isParticipant = await chatRepository.isParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant of this conversation');
    }

    const message = await chatRepository.createMessage(conversationId, senderId, content);
    await chatRepository.updateConversationTimestamp(conversationId);

    return message;
  },

  async markDelivered(conversationId: string, userId: string) {
    await chatRepository.markMessagesAsDelivered(conversationId, userId);
  },

  async markRead(conversationId: string, userId: string) {
    return chatRepository.markMessagesAsRead(conversationId, userId);
  },

  async markMessageDelivered(messageId: string) {
    return chatRepository.markMessageAsDelivered(messageId);
  },

  async getUnreadCount(conversationId: string, userId: string) {
    return chatRepository.getUnreadCount(conversationId, userId);
  },

  async isParticipant(conversationId: string, userId: string) {
    return chatRepository.isParticipant(conversationId, userId);
  },
};
