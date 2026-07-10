import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export function authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = verifyAccessToken(token as string);
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
