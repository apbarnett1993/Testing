import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socket';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function useSocket() {
  useEffect(() => {
    if (!socket) {
      socket = io({
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
        socket?.emit('join_channels');
      });

      socket.on('error', (message) => {
        console.error('Socket error:', message);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return socket;
} 