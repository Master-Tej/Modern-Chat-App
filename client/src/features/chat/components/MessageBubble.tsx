'use client';

import { Message } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwn = message.senderId === user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5 rounded-2xl',
          isOwn
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-dark-card border border-dark-border text-gray-200 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOwn ? 'text-white/70' : 'text-gray-500'
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {isOwn && (
            <span className="text-[10px]">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-400" />
              ) : message.delivered ? (
                <CheckCheck className="h-3 w-3 text-white/70" />
              ) : (
                <Check className="h-3 w-3 text-white/70" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
