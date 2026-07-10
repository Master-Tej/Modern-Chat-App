'use client';

import { useTypingStore } from '@/stores/typing.store';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';

interface TypingIndicatorProps {
  conversationId: string;
}

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { user } = useAuthStore();
  const { activeConversation } = useChatStore();
  const typingUsers = useTypingStore(state => state.typingUsers[conversationId]);

  const otherTypingUsers = typingUsers
    ? Object.keys(typingUsers).filter(id => id !== user?.id && typingUsers[id])
    : [];

  if (otherTypingUsers.length === 0) return null;

  const otherUser = activeConversation?.participants.find(
    p => p.user.id === otherTypingUsers[0]
  )?.user;

  const name = otherUser?.name || 'Someone';

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-xs text-gray-400 italic">{name} is typing...</span>
    </div>
  );
}
