import { create } from 'zustand';

interface TypingState {
  typingUsers: Record<string, Record<string, boolean>>;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  resetTyping: (conversationId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},

  setTyping: (conversationId, userId, isTyping) => {
    set(state => {
      const conversationTyping = state.typingUsers[conversationId] || {};
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: {
            ...conversationTyping,
            [userId]: isTyping,
          },
        },
      };
    });
  },

  resetTyping: (conversationId, userId) => {
    set(state => {
      const conversationTyping = state.typingUsers[conversationId] || {};
      const { [userId]: _, ...rest } = conversationTyping;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: rest,
        },
      };
    });
  },
}));
