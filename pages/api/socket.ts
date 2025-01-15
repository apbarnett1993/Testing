/**
 * Socket.IO server implementation for real-time chat functionality.
 * This file handles WebSocket connections, message broadcasting, and reactions.
 */

import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO, ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import { prisma } from '@/lib/db';

// Disable Next.js body parsing since WebSocket connections don't use HTTP body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Type definitions for database models used in socket events
interface DbChannel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DbUser {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

/**
 * Main Socket.IO handler that sets up the WebSocket server and event listeners.
 * This is called for each WebSocket connection request.
 */
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Only initialize the Socket.IO server once per Next.js server instance
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    
    // Create new Socket.IO server with type-safe event definitions
    const io = new ServerIO<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Add middleware to handle auth
    io.use((socket, next) => {
      const { token, userId } = socket.handshake.auth;
      
      if (!userId) {
        return next(new Error('Unauthorized'));
      }

      // Store userId in socket data for later use
      socket.data.userId = userId;
      next();
    });

    // Handle new client connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      console.log('Authenticated as user:', socket.data.userId);

      /**
       * Event: join_channels
       * When a client connects, add them to all relevant channel and user rooms
       * This enables proper message routing for both channel messages and DMs
       */
      socket.on('join_channels', async () => {
        // Add client to channel-specific rooms for group messages
        const channels = await prisma.channel.findMany();
        channels.forEach((channel: DbChannel) => {
          socket.join(`channel:${channel.id}`);
        });

        // Add client to user-specific rooms for direct messages
        const users = await prisma.user.findMany();
        users.forEach((user: DbUser) => {
          socket.join(`user:${user.id}`);
        });

        console.log(`${socket.id} joined all channels and user rooms`);
      });

      /**
       * Event: join_channel
       * Adds the client to a specific channel's room
       * Called when a new channel is created or user gains access to a channel
       */
      socket.on('join_channel', async (channelId: string) => {
        console.log('Received join_channel event:', { socketId: socket.id, channelId });
        try {
          // Verify channel exists
          const channel = await prisma.channel.findUnique({
            where: { id: channelId }
          });

          if (!channel) {
            console.log('Channel not found:', channelId);
            socket.emit('error', 'Channel not found');
            return;
          }

          // Join the channel room
          const roomName = `channel:${channelId}`;
          socket.join(roomName);
          console.log(`Socket ${socket.id} joined room ${roomName}`);
          
          // Debug: List all rooms this socket is in
          const rooms = Array.from(socket.rooms);
          console.log(`Socket ${socket.id} is now in rooms:`, rooms);
        } catch (error) {
          console.error('Error joining channel:', error);
          socket.emit('error', 'Failed to join channel');
        }
      });

      /**
       * Event: thread:join
       * Adds the client to a specific thread's room
       */
      socket.on('thread:join', async (threadId: string) => {
        try {
          // Join the thread room
          const roomName = `thread:${threadId}`;
          socket.join(roomName);
          console.log(`Socket ${socket.id} joined thread room ${roomName}`);
        } catch (error) {
          console.error('Error joining thread:', error);
          socket.emit('error', 'Failed to join thread');
        }
      });

      /**
       * Event: message
       * Handles new message creation and broadcasting
       * Supports both channel messages and direct messages (DMs)
       */
      socket.on('message', async (message) => {
        try {
          // Save message to database with associated user info
          const savedMessage = await prisma.message.create({
            data: {
              content: message.content,
              userId: message.userId,
              channelId: message.channelId,
              toUserId: message.toUserId,
              threadId: message.threadId,
              ...(message.attachments && {
                attachments: {
                  createMany: {
                    data: message.attachments.map(att => ({
                      filename: att.filename,
                      url: att.url,
                      size: att.size,
                      mimeType: att.mimeType,
                    })),
                  },
                },
              }),
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                }
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      displayName: true,
                      email: true,
                    }
                  },
                },
              },
              attachments: true,
              thread: {
                include: {
                  messages: true,
                },
              },
            },
          });

          // If this is a new thread message, create or update the thread
          if (message.threadId) {
            console.log('Broadcasting thread message:', savedMessage);
            // Broadcast to thread room
            io.to(`thread:${message.threadId}`).emit('thread:message', savedMessage);
          } else if (message.channelId) {
            // Channel messages go to everyone in the channel
            io.to(`channel:${message.channelId}`).emit('message', savedMessage);
          } else if (message.toUserId) {
            // DMs go to both the sender and recipient
            io.to(`user:${message.userId}`).to(`user:${message.toUserId}`).emit('message', savedMessage);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', 'Failed to send message');
        }
      });

      /**
       * Event: reaction:add
       * Handles adding reactions to messages
       * Validates user authentication and broadcasts to appropriate recipients
       */
      socket.on('reaction:add', async (reaction) => {
        try {
          const { messageId, emoji } = reaction;
          const userId = socket.data.userId;

          // Security check: Ensure user is authenticated
          if (!userId) {
            socket.emit('error', 'Unauthorized');
            return;
          }

          // Create new reaction in database
          const newReaction = await prisma.messageReaction.create({
            data: {
              emoji,
              userId,
              messageId,
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  email: true,
                },
              },
            },
          });

          // Find parent message to determine who should receive the reaction update
          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { channelId: true, toUserId: true },
          });

          if (!message) {
            socket.emit('error', 'Message not found');
            return;
          }

          // Broadcast reaction based on message type (channel or DM)
          if (message.channelId) {
            io.to(`channel:${message.channelId}`).emit('reaction:add', newReaction);
          } else if (message.toUserId) {
            io.to(`user:${message.toUserId}`).to(`user:${userId}`).emit('reaction:add', newReaction);
          }
        } catch (error) {
          console.error('Error handling reaction:', error);
          socket.emit('error', 'Failed to add reaction');
        }
      });

      /**
       * Event: reaction:remove
       * Handles removing reactions from messages
       * Uses compound key (userId + messageId + emoji) to identify specific reaction
       */
      socket.on('reaction:remove', async (reaction) => {
        try {
          const { messageId, emoji } = reaction;
          const userId = socket.data.userId;

          // Security check: Ensure user is authenticated
          if (!userId) {
            socket.emit('error', 'Unauthorized');
            return;
          }

          // Remove reaction using compound key for precise deletion
          const deletedReaction = await prisma.messageReaction.delete({
            where: {
              userId_messageId_emoji: {
                userId,
                messageId,
                emoji,
              },
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  email: true,
                },
              },
            },
          });

          // Find parent message to determine broadcast targets
          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { channelId: true, toUserId: true },
          });

          if (!message) {
            socket.emit('error', 'Message not found');
            return;
          }

          // Broadcast removal based on message type (channel or DM)
          if (message.channelId) {
            io.to(`channel:${message.channelId}`).emit('reaction:remove', deletedReaction);
          } else if (message.toUserId) {
            io.to(`user:${message.toUserId}`).to(`user:${userId}`).emit('reaction:remove', deletedReaction);
          }
        } catch (error) {
          console.error('Error handling reaction removal:', error);
          socket.emit('error', 'Failed to remove reaction');
        }
      });

      // Clean up socket connection on client disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Store Socket.IO instance on server for reuse
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler; 