export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId?: string;
  toUserId?: string;
  createdAt: Date;
  updatedAt: Date;
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