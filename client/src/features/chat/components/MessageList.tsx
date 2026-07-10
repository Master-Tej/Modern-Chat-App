'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chat.store';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Loader2, MessageSquare } from 'lucide-react';

interface MessageListProps {
  conversationId: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const {
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      scrollToBottom(true);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(false);
  }, [conversationId, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMoreMessages || isLoadingMessages) return;

    if (el.scrollTop < 100) {
      const prevHeight = el.scrollHeight;
      loadMoreMessages(conversationId).then(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - prevHeight;
          }
        });
      });
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages, conversationId]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin"
    >
      {isLoadingMessages && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <MessageSquare className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">No messages yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Send a message to start the conversation
          </p>
        </div>
      ) : (
        <>
          {hasMoreMessages && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}

          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </>
      )}

      <TypingIndicator conversationId={conversationId} />
      <div ref={bottomRef} />
    </div>
  );
}
