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
  reactions?: MessageReaction[];
}

export interface ServerToClientEvents {
  message: (message: MessageWithUser) => void;
  error: (message: string) => void;
  'reaction:add': (reaction: MessageReaction) => void;
  'reaction:remove': (reaction: MessageReaction) => void;
}

export interface ReactionPayload {
  messageId: string;
  emoji: string;
}

export interface RemoveReactionPayload {
  messageId: string;
  emoji: string;
  userId: string;
}

export interface MessageReaction {
  messageId: string;
  emoji: string;
  userId: string;
  user?: {
    displayName: string | null;
    email: string;
  };
}

export interface ClientToServerEvents {
  join_channels: () => void;
  join_channel: (channelId: string) => void;
  message: (message: {
    content: string;
    userId: string;
    channelId?: string;
    toUserId?: string;
  }) => void;
  'reaction:add': (reaction: ReactionPayload) => void;
  'reaction:remove': (reaction: RemoveReactionPayload) => void;
} 