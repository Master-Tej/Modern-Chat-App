# Modern Chat Application

A production-quality real-time messaging application built with Next.js, Express, Socket.IO, and PostgreSQL.

## Features

- **Authentication** — Register, login, logout, session refresh with JWT tokens
- **Real-time Messaging** — Instant message delivery via Socket.IO
- **User Search** — Find and start conversations with other users
- **Online Status** — See who's online and last seen timestamps
- **Typing Indicators** — See when someone is typing
- **Read/Delivered Status** — Double check marks for message status
- **Emoji Picker** — Search and send emojis
- **Dark Theme** — Modern dark UI design
- **Responsive** — Works on mobile, tablet, and desktop

## Tech Stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, Zustand, Socket.IO Client, Framer Motion

**Backend:** Express.js, TypeScript, Socket.IO, Prisma ORM, JWT, bcrypt

**Database:** PostgreSQL (Supabase)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or Supabase account)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd modern-chat-app

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
```

### Database Setup

```bash
# Generate Prisma client
cd server && npx prisma generate

# Push schema to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init
```

### Running Locally

```bash
# Start both server and client
npm run dev

# Or run them separately:
# Server: cd server && npm run dev
# Client: cd client && npm run dev
```

The server runs on `http://localhost:5000` and the client on `http://localhost:3000`.

## Project Structure

```
modern-chat-app/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Pages and layouts
│   │   ├── components/  # UI components
│   │   ├── features/    # Feature-based modules
│   │   ├── hooks/       # Custom hooks
│   │   ├── stores/      # Zustand state stores
│   │   ├── services/    # API and socket clients
│   │   └── types/       # TypeScript types
├── server/              # Express backend
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── middleware/   # Express middleware
│   │   ├── modules/     # Feature modules
│   │   ├── socket/      # Socket.IO handlers
│   │   └── utils/       # Utilities
├── prisma/              # Database schema
└── docs/                # Documentation
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `POST /api/auth/refresh` — Refresh session

### Users
- `GET /api/users/me` — Get current user
- `PUT /api/users/me` — Update profile
- `GET /api/users/search?q=` — Search users

### Chats
- `GET /api/chats` — Get conversations
- `POST /api/chats` — Create conversation
- `GET /api/chats/:id/messages` — Get messages (paginated)

## Real-time Events (Socket.IO)

### Client → Server
- `send-message` — Send a new message
- `typing-start` — User started typing
- `typing-stop` — User stopped typing
- `message-read` — Mark messages as read
- `join-conversation` — Join conversation room
- `leave-conversation` — Leave conversation room

### Server → Client
- `new-message` — New message received
- `typing-start` — Other user started typing
- `typing-stop` — Other user stopped typing
- `message-delivered` — Message delivered
- `message-read` — Messages read
- `user-online` — User came online
- `user-offline` — User went offline
# Modern-Chat-App
