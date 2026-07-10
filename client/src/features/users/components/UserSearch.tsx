'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2, MessageCircle } from 'lucide-react';
import { User } from '@/types';
import { searchUsers } from '../api';
import { useChatStore } from '@/stores/chat.store';
import Avatar from '@/components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { createConversation, setActiveConversation, fetchConversations } = useChatStore();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const users = await searchUsers(value);
        setResults(users);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const handleSelectUser = async (user: User) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);

    try {
      const conversation = await createConversation(user.id);
      setActiveConversation(conversation);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-10 py-2.5 bg-dark-card border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden z-50"
          >
            {results.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left"
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="md"
                  showStatus
                  isOnline={user.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-primary shrink-0" />
              </button>
            ))}
          </motion.div>
        )}

        {isOpen && query && !isLoading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-dark-card border border-dark-border rounded-xl shadow-xl p-6 text-center z-50"
          >
            <p className="text-gray-400 text-sm">No users found</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
