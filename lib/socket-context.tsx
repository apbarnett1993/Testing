"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, MessageWithUser } from '@/types/socket';
import { useMessages } from '@/components/messages/messages-context';
import { useAuth } from '@clerk/nextjs';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addMessage } = useMessages();
  const { getToken, userId } = useAuth();

  useEffect(() => {
    async function initSocket() {
      if (!socket && userId) {
        console.log('Initializing socket connection');
        const token = await getToken();
        console.log('Got auth token:', token ? 'Token exists' : 'No token');
        console.log('Current userId:', userId);
        
        const socketInstance = io({
          path: '/api/socket',
          auth: {
            token,
            userId
          }
        });

        // Set up event listeners
        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
          setIsConnected(true);
          socketInstance.emit('join_channels');
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socketInstance.on('error', (message) => {
          console.error('Socket error:', message);
          // Reconnect if unauthorized
          if (message === 'Unauthorized') {
            console.log('Attempting to reconnect...');
            socketInstance.disconnect();
            setSocket(null);
          }
        });

        // Handle incoming messages
        socketInstance.on('message', (message: MessageWithUser) => {
          console.log('Received message:', message);
          // Only add to main channel if it's not a thread message
          if (!message.threadId) {
            addMessage(message);
          }
        });

        // Handle thread messages separately
        socketInstance.on('thread:message', (message: MessageWithUser) => {
          console.log('Received thread message:', message);
          // Thread messages are handled by the Thread component
        });

        setSocket(socketInstance);
      }
    }

    initSocket().catch(err => {
      console.error('Failed to initialize socket:', err);
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
        socket.off('message');
        socket.off('thread:message');
        socket.disconnect();
      }
    };
  }, [socket, userId, getToken, addMessage]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
}

export function useSocketStatus() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketStatus must be used within a SocketProvider');
  }
  return context.isConnected;
} 