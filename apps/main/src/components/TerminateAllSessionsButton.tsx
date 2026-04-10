'use client'

import { terminateOtherSessions } from '@doska/shared'
import { Button } from '@doska/ui'
import { useToastStore } from '@doska/shared'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'


export default function TerminateAllSessionsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const addMessage = useToastStore((state) => state.addMessage)

  const handleTerminateOthers = async () => {
    try {
      setLoading(true)
      await terminateOtherSessions()
      addMessage({
        type: 'success',
        message: 'All other sessions terminated successfully',
        duration: 3000,
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to terminate other sessions', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleTerminateOthers}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldAlert
        className="h-4 w-4"
      />}
      Terminate All Other Sessions
    </Button>
  )
}
