"use client"

import { useState, useEffect } from 'react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'
import { users } from '@/lib/mock-data'
import { User } from '@/components/sidebar'
import { User as UserIcon } from 'lucide-react'

export default function DirectMessagePage({ params }: { params: { id: string } }) {
  const [otherUser, setOtherUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchedUser = users.find(user => user.id === params.id) || null
    setOtherUser(fetchedUser)
  }, [params.id])

  if (!otherUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">{otherUser.name}</h1>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList toUserId={otherUser.id} />
        <MessageInput toUserId={otherUser.id} />
      </div>
    </div>
  )
}

