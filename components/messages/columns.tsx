"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'

export type Message = {
  id: string
  content: string
  userId: string
  userName: string
  userAvatar: string
  timePosted: number
}

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "message",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Messages
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const message = row.original
      return (
        <div className="flex items-start space-x-4 p-2">
          <Avatar>
            <AvatarImage src={message.userAvatar} alt={message.userName} />
            <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <span className="font-semibold">{message.userName}</span>
              <span className="ml-2 text-sm text-gray-500">
                {new Date(message.timePosted).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      )
    },
  },
]

