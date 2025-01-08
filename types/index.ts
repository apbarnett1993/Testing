export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId?: string;
  toUserId?: string;
  createdAt: Date;
  updatedAt: Date;
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