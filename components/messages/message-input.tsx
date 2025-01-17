"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { SendHorizontal, Paperclip, X, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/lib/socket"
import { RichTextEditor } from "./rich-text-editor"

interface MessageInputProps {
  channelId?: string
  toUserId?: string
  threadId?: string
}

interface FileUpload {
  file: File;
  progress: number;
}

export function MessageInput({ channelId, toUserId, threadId }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const socket = useSocket()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploads(prev => [
      ...prev,
      ...files.map(file => ({ file, progress: 0 }))
    ])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFileToServer = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }

    return response.json()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user || (!content.trim() && uploads.length === 0) || isLoading || !socket) return

    try {
      setIsLoading(true)
      
      // Upload files first
      const attachments = await Promise.all(
        uploads.map(async ({ file }) => {
          const result = await uploadFileToServer(file)
          return {
            filename: result.filename,
            url: result.url,
            size: result.size,
            mimeType: result.mimeType,
          }
        })
      )

      // Send message with attachments
      socket.emit('message', {
        content: content.trim(),
        userId: user.id,
        channelId,
        toUserId,
        threadId,
        attachments,
      })

      setContent("")
      setUploads([])
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex flex-col gap-2">
        {uploads.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded">
            {uploads.map((upload, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                <span className="text-sm truncate max-w-[200px]">{upload.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeUpload(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <RichTextEditor
          content={content}
          onChange={setContent}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!user || isLoading || !content.trim()) return;
                try {
                  setIsLoading(true);
                  await fetch('/api/bot', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      content: `${content.trim()}\nbot:`,
                      userId: user.id,
                      channelId,
                      toUserId,
                      threadId,
                    }),
                  });
                  setContent(""); // Clear the input after sending
                } catch (error) {
                  console.error("Failed to send bot message:", error);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !content.trim()}
            >
              <Bot className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <Button type="submit" disabled={isLoading}>
            <SendHorizontal className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}

