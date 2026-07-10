'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/services/socket';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string) => void;
  isSending?: boolean;
}

export default function MessageInput({
  conversationId,
  onSendMessage,
  isSending,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getSocket();
      if (!socket) return;

      if (isTyping) {
        socket.emit('typing-start', { conversationId });
      } else {
        socket.emit('typing-stop', { conversationId });
      }
    },
    [conversationId]
  );

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    emitTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  }, [emitTyping]);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    onSendMessage(trimmed);
    setContent('');
    emitTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [content, isSending, onSendMessage, emitTyping]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative px-4 py-3 border-t border-dark-border bg-dark-sidebar/50 backdrop-blur-sm">
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-full right-4 mb-2 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              searchPlaceholder="Search emojis..."
              width={320}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-dark-hover transition-colors shrink-0"
        >
          <Smile className="h-5 w-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={e => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all max-h-32"
            style={{ minHeight: '40px' }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
