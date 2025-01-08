"use client"

import { useState, useEffect } from 'react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'
import { Channel } from '@/components/sidebar'

export default function ChannelPage({ params }: { params: { id: string } }) {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch channel details from the API
    fetch('/api/channels')
      .then(res => res.json())
      .then(channels => {
        const found = channels.find((c: Channel) => c.id === params.id)
        if (found) {
          setChannel(found)
        } else {
          setError('Channel not found')
        }
      })
      .catch(err => {
        console.error('Failed to fetch channel:', err)
        setError('Failed to load channel')
      })
  }, [params.id])

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (!channel) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-2 border-b">
        <h1 className="text-xl font-semibold">#{channel.name}</h1>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList channelId={channel.id} />
        <MessageInput channelId={channel.id} />
      </div>
    </div>
  )
}

