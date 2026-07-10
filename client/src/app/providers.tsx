'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { Loader2 } from 'lucide-react';

function AuthInitializer({ children }: { children: ReactNode }) {
  const { refreshSession, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function SocketInitializer({ children }: { children: ReactNode }) {
  useSocket();
  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthInitializer>
      <SocketInitializer>{children}</SocketInitializer>
    </AuthInitializer>
  );
}
