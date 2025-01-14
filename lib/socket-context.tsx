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
  const { addMessage, handleAddReaction, handleRemoveReaction } = useMessages();
  const { getToken, userId } = useAuth();

  useEffect(() => {
    let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    async function initSocket() {
      if (!userId) return;

      // Cleanup existing socket if any
      if (socket) {
        socket.disconnect();
      }

      console.log('Initializing socket connection');
      const token = await getToken();
      
      socketInstance = io({
        path: '/api/socket',
        auth: {
          token,
          userId
        }
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance?.id);
        setIsConnected(true);
        socketInstance?.emit('join_channels');
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('error', (message) => {
        console.error('Socket error:', message);
        if (message === 'Unauthorized') {
          console.log('Attempting to reconnect...');
          socketInstance?.disconnect();
          setSocket(null);
        }
      });

      // Handle incoming messages
      socketInstance.on('message', (message: MessageWithUser) => {
        console.log('Received message:', message);
        // Only add if it's not from the current user to prevent duplicates
        if (message.userId !== userId && !message.threadId) {
          addMessage(message);
        }
      });

      // Handle thread messages separately
      socketInstance.on('thread:message', (message: MessageWithUser) => {
        console.log('Received thread message:', message);
        // Thread messages are handled by the Thread component
      });

      socketInstance.on("reaction:add", (reaction) => {
        console.log("Received reaction:add", reaction);
        handleAddReaction(reaction);
      });

      socketInstance.on("reaction:remove", (reaction) => {
        console.log("Received reaction:remove", reaction);
        handleRemoveReaction(reaction);
      });

      setSocket(socketInstance);
    }

    initSocket().catch(err => {
      console.error('Failed to initialize socket:', err);
    });

    // Cleanup function
    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('error');
        socketInstance.off('message');
        socketInstance.off('thread:message');
        socketInstance.off('reaction:add');
        socketInstance.off('reaction:remove');
        socketInstance.disconnect();
      }
    };
  }, [userId]); // Only reinitialize when userId changes

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