'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@doska/ui'
import { Badge } from '@doska/ui'
import { Button } from '@doska/ui'
import { Heart, MessageCircle, Repeat2, ExternalLink, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useDeleteRecommendation } from '@doska/shared'

interface FeedItemProps {
  item: any
}

export function FeedItemCard({ item }: FeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const deleteMutation = useDeleteRecommendation()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Remove this item from recommendations?')) {
      await deleteMutation.mutateAsync(item.id)
    }
  }
  const isLongText = item.text?.length > 200

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
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            Score: {item.combined_score?.toFixed(1) || '0.0'}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2 space-y-2">
        <p className={`text-sm whitespace-pre-wrap transition-all duration-300 ${isExpanded ? '' : 'line-clamp-4'}`}>
          {item.text}
        </p>
        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-medium text-primary hover:underline flex items-center gap-0.5"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read More <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
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
