export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
  _count: {
    messages: number;
  };
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  delivered: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}
