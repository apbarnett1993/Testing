import { Message } from '@/components/messages/columns'
import { Channel, User } from '@/components/sidebar'

export const initialChannels: Channel[] = [
  { id: "1", name: "general" },
  { id: "2", name: "random" },
  { id: "3", name: "project-a" },
]

export const users: User[] = [
  { id: "user1", name: "Alice Johnson", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice" },
  { id: "user2", name: "Bob Smith", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob" },
  { id: "user3", name: "Charlie Brown", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Charlie" },
  { id: "user4", name: "Diana Prince", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Diana" },
  { id: "user5", name: "Ethan Hunt", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ethan" },
]

export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Welcome to the general channel! How's everyone doing today?",
      userId: "user1",
      userName: "Alice Johnson",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
      timePosted: Date.now() - 3600000,
    },
    {
      id: "2",
      content: "Hey Alice! I'm doing great. Working on the new feature.",
      userId: "user2",
      userName: "Bob Smith",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
      timePosted: Date.now() - 3500000,
    },
    {
      id: "3",
      content: "Just a reminder: we have a team meeting at 3 PM.",
      userId: "user3",
      userName: "Charlie Brown",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Charlie",
      timePosted: Date.now() - 3400000,
    },
  ],
  "2": [
    {
      id: "4",
      content: "Did anyone watch the game last night?",
      userId: "user4",
      userName: "Diana Prince",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Diana",
      timePosted: Date.now() - 7200000,
    },
    {
      id: "5",
      content: "Yes! It was amazing. Can't believe that last-minute goal!",
      userId: "user5",
      userName: "Ethan Hunt",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ethan",
      timePosted: Date.now() - 7100000,
    },
  ],
  "3": [
    {
      id: "6",
      content: "How's everyone progressing with their tasks for Project A?",
      userId: "user1",
      userName: "Alice Johnson",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
      timePosted: Date.now() - 1800000,
    },
    {
      id: "7",
      content: "I've completed the initial designs. Ready for review!",
      userId: "user4",
      userName: "Diana Prince",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Diana",
      timePosted: Date.now() - 1700000,
    },
    {
      id: "8",
      content: "Great job, Diana! I'll take a look and provide feedback soon.",
      userId: "user2",
      userName: "Bob Smith",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
      timePosted: Date.now() - 1600000,
    },
  ],
}

export const mockDirectMessages: Record<string, Message[]> = {
  "user1": [
    {
      id: "dm1",
      content: "Hey Alice, do you have a moment to discuss the project?",
      userId: "currentUser",
      userName: "Current User",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=CurrentUser",
      timePosted: Date.now() - 3600000,
    },
    {
      id: "dm2",
      content: "What's on your mind?",
      userId: "user1",
      userName: "Alice Johnson",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
      timePosted: Date.now() - 3500000,
    },
  ],
  "user2": [
    {
      id: "dm3",
      content: "Bob, can you send me the latest report?",
      userId: "currentUser",
      userName: "Current User",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=CurrentUser",
      timePosted: Date.now() - 7200000,
    },
    {
      id: "dm4",
      content: "Of course, I'll email it to you right away.",
      userId: "user2",
      userName: "Bob Smith",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
      timePosted: Date.now() - 7100000,
    },
  ],
}

export const currentUser = {
  id: "currentUser",
  name: "Current User",
  avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=CurrentUser"
}

// New function to manage messages
export function getMessages() {
  // If running in a browser environment, try to get messages from localStorage
  if (typeof window !== 'undefined') {
    const storedMessages = localStorage.getItem('channelMessages');
    if (storedMessages) {
      return JSON.parse(storedMessages);
    }
  }
  // If no stored messages or not in a browser, return the mock messages
  return mockMessages;
}

export function saveMessages(messages: Record<string, Message[]>) {
  // Only save to localStorage if in a browser environment
  if (typeof window !== 'undefined') {
    localStorage.setItem('channelMessages', JSON.stringify(messages));
  }
}

