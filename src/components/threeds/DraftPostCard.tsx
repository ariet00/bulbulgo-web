'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wand2, Check, ExternalLink, CalendarDays } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DraftPostProps {
  post: any
}

export function DraftPostCard({ post }: DraftPostProps) {
  const isDraft = post.status === 'draft'
  
  return (
    <Card className={`flex flex-col h-full border-l-4 transition-all hover:bg-muted/10 ${isDraft ? 'border-l-blue-500' : 'border-l-green-500'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Badge variant={isDraft ? "secondary" : "default"}>
            {post.status.toUpperCase()}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-1">
          <CalendarDays className="h-3 w-3" />
          <span>{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'recent'}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="p-3 bg-muted/30 rounded-md border text-sm whitespace-pre-wrap leading-relaxed">
          {post.text}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 py-3">
        {isDraft && (
          <>
            <Button size="sm" variant="outline" className="h-8">
              Edit
            </Button>
            <Button size="sm" variant="default" className="h-8 bg-blue-600 hover:bg-blue-700">
              <Check className="h-3 w-3 mr-1" />
              Approve
            </Button>
          </>
        )}
        {!isDraft && (
          <Button size="sm" variant="ghost" className="h-8 text-green-600">
            Published <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
