"use client"

import { useState, useEffect } from 'react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'
import { User } from '@/components/sidebar'

console.log('DirectMessagePage component loaded');

export default function DirectMessagePage({ params }: { params: { userId: string } }) {
  console.log('DirectMessagePage rendering with params:', params);
  
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Fetching user details for ID:', params.userId);
    
    // Fetch user details from the API
    fetch('/api/users')
      .then(res => {
        console.log('API Response status:', res.status);
        return res.json();
      })
      .then(users => {
        console.log('Fetched users:', users);
        const found = users.find((u: User) => u.id === params.userId)
        console.log('Found user:', found);
        if (found) {
          setUser(found)
        } else {
          setError('User not found')
        }
      })
      .catch(err => {
        console.error('Failed to fetch user:', err)
        setError('Failed to load user')
      })
  }, [params.userId])

  console.log('Current state:', { user, error, params });

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="p-4">Loading user {params.userId}...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-2 border-b">
        <h1 className="text-xl font-semibold">Chat with {user.email}</h1>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList toUserId={user.id} />
        <MessageInput toUserId={user.id} />
      </div>
    </div>
  )
}