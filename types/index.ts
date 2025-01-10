export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string | null;
  toUserId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: {
      displayName: string | null;
      email: string;
    };
  }>;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SendMessagePayload {
  content: string;
  channelId?: string;
  toUserId?: string;
} 