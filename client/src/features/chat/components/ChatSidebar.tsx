'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import Avatar from '@/components/ui/Avatar';
import UserSearch from '@/features/users/components/UserSearch';
import { formatTime } from '@/lib/utils';
import { Conversation } from '@/types';
import { LogOut, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatSidebar() {
  const { user, logout } = useAuthStore();
  const {
    conversations,
    activeConversation,
    isLoadingConversations,
    fetchConversations,
    setActiveConversation,
    fetchMessages,
    unreadCounts,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.user.id !== user?.id)?.user;
  };

  return (
    <div className="h-full flex flex-col bg-dark-sidebar">
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar}
              name={user?.name || 'You'}
              size="md"
              showStatus
              isOnline={user?.isOnline}
            />
            <div>
              <h2 className="text-sm font-semibold text-white">{user?.name}</h2>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-hover transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <UserSearch />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Conversations
          </h3>

          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-500 mt-1">Search for users to start chatting</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map(conversation => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;

                const lastMessage = conversation.messages[0];
                const isActive = activeConversation?.id === conversation.id;
                const unread = unreadCounts[conversation.id] || 0;

                return (
                  <motion.button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-dark-hover border border-transparent'
                    }`}
                    layout
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={otherUser.avatar}
                        name={otherUser.name}
                        size="md"
                        showStatus
                        isOnline={otherUser.isOnline}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {otherUser.name}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 shrink-0 ml-2">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-400 truncate">
                          {lastMessage ? lastMessage.content : 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <span className="shrink-0 ml-2 bg-primary text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {otherUser.isOnline ? (
                          <span className="text-xs text-green-400">Online</span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {otherUser.lastSeen
                              ? `Last seen ${formatTime(otherUser.lastSeen)}`
                              : 'Offline'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
