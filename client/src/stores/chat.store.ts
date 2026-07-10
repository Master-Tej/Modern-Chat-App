import { create } from 'zustand';
import { Conversation, Message, PaginatedMessages } from '@/types';
import api from '@/services/axios';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCounts: Record<string, number>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  nextCursor: string | null;
  error: string | null;

  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: Message, conversationId: string) => void;
  updateMessageStatus: (messageId: string, updates: Partial<Message>) => void;
  markConversationRead: (conversationId: string) => void;
  createConversation: (userId: string) => Promise<Conversation>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCounts: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  hasMoreMessages: false,
  nextCursor: null,
  error: null,

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const response = await api.get('/chats');
      const conversations: Conversation[] = response.data.data;

      const unreadCounts: Record<string, number> = {};
      conversations.forEach(c => {
        unreadCounts[c.id] = c._count?.messages || 0;
      });

      set({ conversations, unreadCounts, isLoadingConversations: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load conversations',
        isLoadingConversations: false,
      });
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation, messages: [] });
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await api.get(`/chats/${conversationId}/messages?limit=50`);
      const result: PaginatedMessages = response.data.data;
      set({
        messages: result.messages,
        hasMoreMessages: result.hasMore,
        nextCursor: result.nextCursor,
        isLoadingMessages: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load messages',
        isLoadingMessages: false,
      });
    }
  },

  loadMoreMessages: async (conversationId) => {
    const { nextCursor, hasMoreMessages, isLoadingMessages } = get();
    if (!hasMoreMessages || !nextCursor || isLoadingMessages) return;

    set({ isLoadingMessages: true });
    try {
      const response = await api.get(
        `/chats/${conversationId}/messages?cursor=${nextCursor}&limit=50`
      );
      const result: PaginatedMessages = response.data.data;
      set(state => ({
        messages: [...result.messages, ...state.messages],
        hasMoreMessages: result.hasMore,
        nextCursor: result.nextCursor,
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message, conversationId) => {
    set(state => {
      const isActive = state.activeConversation?.id === conversationId;
      const messages = isActive ? [...state.messages, message] : state.messages;

      const conversations = state.conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [message],
            updatedAt: message.createdAt,
            _count: {
              ...c._count,
              messages: isActive ? 0 : (c._count?.messages || 0) + 1,
            },
          };
        }
        return c;
      });

      conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return { messages, conversations };
    });
  },

  updateMessageStatus: (messageId, updates) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    }));
  },

  markConversationRead: (conversationId) => {
    set(state => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0,
      },
      conversations: state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, _count: { ...c._count, messages: 0 } }
          : c
      ),
    }));
  },

  createConversation: async (userId) => {
    const response = await api.post('/chats', { userId });
    const conversation: Conversation = response.data.data;

    set(state => ({
      conversations: [conversation, ...state.conversations],
    }));

    return conversation;
  },

  updateConversation: (conversationId, updates) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    }));
  },
}));
