import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { chatService } from '../modules/chat/chat.service';
import { userService } from '../modules/user/user.service';

const userSockets = new Map<string, Set<string>>();

export function registerSocketEvents(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.userId!;

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socket.id);

  socket.join(`user:${userId}`);

  userService.updateOnlineStatus(userId, true).catch(console.error);

  io.emit('user-online', { userId });

  socket.on('join-conversation', async ({ conversationId }) => {
    try {
      const isParticipant = await chatService.isParticipant(conversationId, userId);
      if (isParticipant) {
        socket.join(`conversation:${conversationId}`);
      }
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  });

  socket.on('leave-conversation', ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('send-message', async ({ conversationId, content }) => {
    try {
      if (!content || typeof content !== 'string' || !content.trim()) return;

      const message = await chatService.createMessage(conversationId, userId, content.trim());

      io.to(`conversation:${conversationId}`).emit('new-message', {
        message,
        conversationId,
      });

      const conversation = await chatService.getConversations(userId);
      const targetConversation = Array.isArray(conversation)
        ? conversation.find(c => c.id === conversationId)
        : null;

      if (targetConversation) {
        io.to(`conversation:${conversationId}`).emit('message-delivered', {
          messageId: message.id,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { conversationId, error: 'Failed to send message' });
    }
  });

  socket.on('typing-start', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing-start', {
      userId,
      conversationId,
    });
  });

  socket.on('typing-stop', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing-stop', {
      userId,
      conversationId,
    });
  });

  socket.on('message-delivered', async ({ messageId }) => {
    try {
      await chatService.markMessageDelivered(messageId);
      socket.broadcast.emit('message-delivered', { messageId, userId });
    } catch (error) {
      console.error('Error marking message delivered:', error);
    }
  });

  socket.on('message-read', async ({ conversationId }) => {
    try {
      const messageIds = await chatService.markRead(conversationId, userId);
      socket.to(`conversation:${conversationId}`).emit('message-read', {
        messageIds,
        userId,
        conversationId,
      });
    } catch (error) {
      console.error('Error marking messages read:', error);
    }
  });

  socket.on('disconnect', async () => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(userId);
        await userService.updateOnlineStatus(userId, false);
        io.emit('user-offline', { userId });
      }
    }
  });
}
