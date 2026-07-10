'use client';

import { Conversation } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import Avatar from '@/components/ui/Avatar';
import { formatLastSeen } from '@/lib/utils';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { user } = useAuthStore();
  const otherUser = conversation.participants.find(p => p.user.id !== user?.id)?.user;

  if (!otherUser) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-sidebar/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <Avatar
          src={otherUser.avatar}
          name={otherUser.name}
          size="md"
          showStatus
          isOnline={otherUser.isOnline}
        />

        <div>
          <h2 className="text-sm font-semibold text-white">{otherUser.name}</h2>
          <p className="text-xs text-gray-400">
            {otherUser.isOnline ? (
              <span className="text-green-400">Online</span>
            ) : (
              <span>Last seen {formatLastSeen(otherUser.lastSeen)}</span>
            )}
          </p>
        </div>
      </div>

      <Dropdown
        trigger={
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        }
      >
        <DropdownItem onClick={() => {}}>
          View Profile
        </DropdownItem>
        <DropdownItem onClick={() => {}}>
          Search Messages
        </DropdownItem>
        <DropdownItem onClick={() => {}} danger>
          Block User
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
