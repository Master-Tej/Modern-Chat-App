'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useSocket } from '@/hooks/useSocket';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatHeader from '@/features/chat/components/ChatHeader';
import MessageList from '@/features/chat/components/MessageList';
import MessageInput from '@/features/chat/components/MessageInput';
import { MessageSquare } from 'lucide-react';

export default function ChatLayout() {
  const [showMobileChat, setShowMobileChat] = useState(false);
  const { activeConversation, setActiveConversation } = useChatStore();
  const { joinConversation, leaveConversation, sendMessage, markRead } = useSocket();

  useEffect(() => {
    if (activeConversation) {
      setShowMobileChat(true);
      joinConversation(activeConversation.id);
      markRead(activeConversation.id);

      return () => {
        leaveConversation(activeConversation.id);
      };
    } else {
      setShowMobileChat(false);
    }
  }, [activeConversation?.id]);

  const handleSendMessage = (content: string) => {
    if (activeConversation) {
      sendMessage(activeConversation.id, content);
    }
  };

  const handleBack = () => {
    setActiveConversation(null);
    setShowMobileChat(false);
  };

  return (
    <div className="h-screen flex bg-dark-bg">
      {/* Sidebar - hidden on mobile when chat is active */}
      <div
        className={`${
          activeConversation && showMobileChat ? 'hidden' : 'flex'
        } lg:flex w-full lg:w-[380px] xl:w-[420px] shrink-0 flex-col border-r border-dark-border`}
      >
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div
        className={`${
          activeConversation && showMobileChat ? 'flex' : 'hidden'
        } lg:flex flex-1 flex-col`}
      >
        {activeConversation ? (
          <>
            <ChatHeader conversation={activeConversation} onBack={handleBack} />
            <MessageList conversationId={activeConversation.id} />
            <MessageInput
              conversationId={activeConversation.id}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 rounded-2xl bg-primary/10 inline-block mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome to Chatter
              </h2>
              <p className="text-gray-400 text-sm max-w-sm">
                Select a conversation from the sidebar or search for users to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
