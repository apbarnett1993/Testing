import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface MessageUser {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface MessageWithUser {
  id: string;
  content: string;
  userId: string;
  channelId: string | null;
  toUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: MessageUser;
}

export interface ServerToClientEvents {
  message: (message: MessageWithUser) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_channels: () => void;
  message: (message: {
    content: string;
    userId: string;
    channelId?: string;
    toUserId?: string;
  }) => void;
} 