import http from 'http';
import app from './app';
import { env } from './config/env';
import { createSocketServer } from './socket/socket.server';

const server = http.createServer(app);

const io = createSocketServer(server);

server.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Client URL: ${env.clientUrl}`);
});

export { io };
