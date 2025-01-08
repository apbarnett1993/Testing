"use client"

import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [displayName, setDisplayName] = useState('')
  const [currentDisplayName, setCurrentDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch current display name from our database
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setCurrentDisplayName(data.displayName || '')
          setDisplayName(data.displayName || '')
        })
        .catch(err => console.error('Failed to fetch user:', err))
    }
  }, [isLoaded, user])

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isLoading || !displayName.trim()) return

    try {
      setIsLoading(true)
      setMessage('')
      
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: displayName.trim() })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const updatedUser = await response.json();
      setCurrentDisplayName(updatedUser.displayName || '')
      setMessage('Display name updated successfully!')
    } catch (error) {
      console.error('Failed to update display name:', error)
      setMessage('Failed to update display name. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || !user) return null

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your email is {user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-sm text-muted-foreground">
            Current display name: {currentDisplayName || 'Not set'}
          </p>
        </div>

        <form onSubmit={handleUpdateDisplayName} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Update Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This name will be displayed in messages and the user list.
            </p>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Display Name'}
          </Button>
        </form>
      </div>
    </div>
  )
} 