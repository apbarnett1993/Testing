"use client"

import * as React from "react"
import { Hash, MessageSquare, User, ChevronDown, Plus, LogIn, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { users } from "@/lib/mock-data"

export type Channel = {
  id: string
  name: string
}

export type User = {
  id: string
  email: string
}

function AppSidebar() {
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [newChannelName, setNewChannelName] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { signOut } = useClerk()
  const { user: currentUser, isSignedIn } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    // Fetch channels from the API
    fetch('/api/channels')
      .then(res => res.json())
      .then(data => setChannels(data))
      .catch(err => console.error('Failed to fetch channels:', err))

    // Fetch users from the API
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then(data => {
        console.log('Fetched users:', data)
        setUsers(data)
      })
      .catch(err => console.error('Failed to fetch users:', err))
  }, [])

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim() || isLoading) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newChannelName.trim() }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const newChannel = await response.json()
      setChannels(prev => [...prev, newChannel])
      setNewChannelName("")
      setIsDialogOpen(false)
      // Navigate to the new channel
      router.push(`/channel/${newChannel.id}`)
    } catch (error) {
      console.error('Failed to create channel:', error)
      alert('Failed to create channel. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                <span className="font-semibold">ChatApp</span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Channels
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto h-4 w-4 p-0">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add Channel</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Channel</DialogTitle>
                  <DialogDescription>
                    Enter a name for the new channel. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddChannel}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="col-span-3"
                        disabled={isLoading}
                        placeholder="e.g. announcements"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Channel'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channels.map((channel) => (
                <SidebarMenuItem key={channel.id}>
                  <Link href={`/channel/${channel.id}`} passHref>
                    <SidebarMenuButton>
                      <Hash className="mr-2 h-4 w-4" />
                      {channel.name}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {users.map((user) => (
                <SidebarMenuItem key={user.id}>
                  <Link href={`/direct-message/${user.id}`} passHref>
                    <SidebarMenuButton>
                      <User className="mr-2 h-4 w-4" />
                      {user.email}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isSignedIn ? (
                <SidebarMenuItem>
                  <Link href="/sign-in" passHref>
                    <SidebarMenuButton>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <User className="mr-2 h-4 w-4" />
                      {currentUser?.emailAddresses[0]?.emailAddress || 'Profile'}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export { AppSidebar }

