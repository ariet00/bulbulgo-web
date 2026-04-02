'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Repeat2, Quote, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface FeedItemProps {
  item: any
}

export function FeedItemCard({ item }: FeedItemProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <span className="text-xs font-bold text-primary">@{item.author_username[0]}</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{item.author_username}</p>
            <p className="text-xs text-muted-foreground">
              {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'recent'}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Score: {item.combined_score?.toFixed(1) || '0.0'}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <p className="text-sm line-clamp-4 whitespace-pre-wrap">{item.text}</p>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 flex justify-between py-2 px-4">
        <div className="flex space-x-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {item.likes_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {item.replies_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="h-3 w-3" /> {item.reposts_count || 0}
          </span>
        </div>
        <a 
          href={`https://www.threads.net/@${item.author_username}/post/${item.external_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}
