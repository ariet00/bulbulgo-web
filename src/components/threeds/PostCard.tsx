'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CalendarDays, Edit2, Save, X, Rocket, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { useUpdatePost, usePublishPost } from '@/hooks/mutations/threeds'

interface PostCardProps {
  post: any
}

export function PostCard({ post }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(post.text)
  
  const updatePost = useUpdatePost()
  const publishPost = usePublishPost()

  const isDraft = post.status === 'draft'
  const isApproved = post.status === 'approved'
  const isPublished = post.status === 'published'
  const isError = post.status === 'error'

  const handleSave = async () => {
    try {
      await updatePost.mutateAsync({
        postId: post.id,
        data: { text: editText, status: 'approved' }
      })
      setIsEditing(false)
    } catch (e) {
      // Error handled by mutation toast
    }
  }

  const handlePublish = async () => {
    try {
      await publishPost.mutateAsync(post.id)
    } catch (e) {
      // Error handled by mutation toast
    }
  }

  const handleApprove = async () => {
    try {
      await updatePost.mutateAsync({
        postId: post.id,
        data: { status: 'approved' }
      })
    } catch (e) {
      // Error handled by mutation toast
    }
  }

  return (
    <Card className={`flex flex-col h-full border-l-4 transition-all hover:bg-muted/5 shadow-sm
      ${isDraft ? 'border-l-blue-400' : 
        isApproved ? 'border-l-amber-400' : 
        isPublished ? 'border-l-green-500' : 
        'border-l-red-500'}`}>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Badge variant={isPublished ? "default" : isError ? "destructive" : "secondary"} className="font-semibold px-2 py-0">
            {post.status.toUpperCase()}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-1">
          <CalendarDays className="h-3 w-3" />
          <span>{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'recent'}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea 
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[140px] text-sm leading-relaxed resize-none focus-visible:ring-blue-400"
              placeholder="Edit your post content..."
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                setIsEditing(false)
                setEditText(post.text)
              }}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="h-8" onClick={handleSave} disabled={updatePost.isPending}>
                {updatePost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                Save & Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm whitespace-pre-wrap leading-relaxed relative group">
            {post.text}
            {!isPublished && (
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background border-dashed"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 py-4 border-t bg-muted/5 mt-auto">
        {isDraft && !isEditing && (
          <>
            <Button size="sm" variant="outline" className="h-9" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button 
              size="sm" 
              className="h-9 bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={handleApprove}
              disabled={updatePost.isPending}
            >
              {updatePost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Approve
            </Button>
          </>
        )}

        {(isApproved || isError) && !isEditing && (
          <Button 
            size="sm" 
            className="h-9 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-[1.02]"
            onClick={handlePublish}
            disabled={publishPost.isPending}
          >
            {publishPost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Rocket className="h-3.5 w-3.5 mr-1" />}
            Publish to Threads
          </Button>
        )}

        {isPublished && (
          <Button size="sm" variant="ghost" className="h-9 text-green-600 font-semibold cursor-default hover:bg-transparent">
            <Check className="h-4 w-4 mr-1.5" /> Published Successfully
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
