import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO, ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import { prisma } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Socket.io server event handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle joining all channels
      socket.on('join_channels', async () => {
        // Join channel rooms
        const channels = await prisma.channel.findMany();
        channels.forEach((channel: DbChannel) => {
          socket.join(`channel:${channel.id}`);
        });

        // Join user rooms
        const users = await prisma.user.findMany();
        users.forEach((user: DbUser) => {
          socket.join(`user:${user.id}`);
        });

        console.log(`${socket.id} joined all channels and user rooms`);
      });

      // Handle new messages
      socket.on('message', async (message) => {
        try {
          // Save message to database
          const savedMessage = await prisma.message.create({
            data: {
              content: message.content,
              userId: message.userId,
              channelId: message.channelId,
              toUserId: message.toUserId,
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
              }
            }
          });

          // Broadcast to appropriate channel or DM
          if (message.channelId) {
            io.to(`channel:${message.channelId}`).emit('message', savedMessage);
          } else if (message.toUserId) {
            // For DMs, emit to both sender and receiver
            io.to(`user:${message.userId}`).to(`user:${message.toUserId}`).emit('message', savedMessage);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', 'Failed to save message');
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler; 