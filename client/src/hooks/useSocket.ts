'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useTypingStore } from '@/stores/typing.store';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { Message } from '@/types';

export function useSocket() {
  const { isAuthenticated, user } = useAuthStore();
  const addMessage = useChatStore(state => state.addMessage);
  const updateMessageStatus = useChatStore(state => state.updateMessageStatus);
  const markConversationRead = useChatStore(state => state.markConversationRead);
  const setTyping = useTypingStore(state => state.setTyping);
  const resetTyping = useTypingStore(state => state.resetTyping);
  const fetchConversations = useChatStore(state => state.fetchConversations);
  const activeConversation = useChatStore(state => state.activeConversation);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = connectSocket();

    socket.on('connect', () => {
      connectedRef.current = true;
    });

    socket.on('new-message', (data: { message: Message; conversationId: string }) => {
      addMessage(data.message, data.conversationId);

      if (activeConversation?.id !== data.conversationId) {
        fetchConversations();
      }
    });

    socket.on('message-delivered', (data: { messageId: string }) => {
      updateMessageStatus(data.messageId, { delivered: true });
    });

    socket.on('message-read', (data: { messageIds: string[] }) => {
      data.messageIds.forEach(id => {
        updateMessageStatus(id, { isRead: true, delivered: true });
      });
    });

    socket.on('typing-start', (data: { userId: string; conversationId: string }) => {
      setTyping(data.conversationId, data.userId, true);
    });

    socket.on('typing-stop', (data: { userId: string; conversationId: string }) => {
      setTyping(data.conversationId, data.userId, false);
    });

    socket.on('user-online', (data: { userId: string }) => {
      fetchConversations();
    });

    socket.on('user-offline', (data: { userId: string }) => {
      fetchConversations();
    });

    return () => {
      socket.off('new-message');
      socket.off('message-delivered');
      socket.off('message-read');
      socket.off('typing-start');
      socket.off('typing-stop');
      socket.off('user-online');
      socket.off('user-offline');
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [
    isAuthenticated,
    user?.id,
    addMessage,
    updateMessageStatus,
    markConversationRead,
    setTyping,
    resetTyping,
    fetchConversations,
    activeConversation?.id,
  ]);

  const joinConversation = (conversationId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join-conversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('leave-conversation', { conversationId });
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('send-message', { conversationId, content });
    }
  };

  const markRead = (conversationId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('message-read', { conversationId });
    }
  };

  return {
    joinConversation,
    leaveConversation,
    sendMessage,
    markRead,
  };
}
