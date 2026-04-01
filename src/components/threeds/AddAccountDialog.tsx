'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  useCreateThreedsAccount, 
  useThreedsAccountStatus, 
  useSubmitThreeds2FA 
} from '@/hooks/queries/threeds'

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [twoFaCode, setTwoFaCode] = useState('')
  const [accountId, setAccountId] = useState<number | null>(null)
  
  const createAccount = useCreateThreedsAccount()
  const submit2FA = useSubmitThreeds2FA()
  const { data: statusData } = useThreedsAccountStatus(accountId)
  
  const status = statusData?.status
  
  useEffect(() => {
    if (!open) {
      setUsername('')
      setPassword('')
      setTwoFaCode('')
      setAccountId(null)
    }
  }, [open])
  
  useEffect(() => {
    if (status === 'completed') {
      setTimeout(() => setOpen(false), 2000)
    }
  }, [status])

  const handleCreate = async () => {
    try {
      const res = await createAccount.mutateAsync({ username, password })
      setAccountId(res.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handle2FASubmit = async () => {
    if (!accountId) return
    try {
      await submit2FA.mutateAsync({ accountId, code: twoFaCode })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Threads Account</DialogTitle>
          <DialogDescription>
             Enter your Instagram credentials. If 2FA is enabled, you will be prompted to enter the code. Do not close the window while it is loading.
          </DialogDescription>
        </DialogHeader>
        
        {!accountId && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Instagram username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <Button onClick={handleCreate} disabled={createAccount.isPending}>
              {createAccount.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        )}
        
        {accountId && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-semibold">Status:</span>
              <span className="text-sm px-2 py-1 bg-secondary rounded uppercase">
                {status || 'initializing'}
              </span>
            </div>
            
            {(status === 'logging_in' || status === 'starting' || status === 'initializing') && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Automated browser is logging in. Please wait...
              </p>
            )}
            
            {status === 'pending_2fa' && (
              <div className="space-y-2">
                 <Label>Enter 2FA Code</Label>
                 <Input 
                    value={twoFaCode} 
                    onChange={e => setTwoFaCode(e.target.value)}
                    placeholder="E.g. 123456"
                 />
                 <Button onClick={handle2FASubmit} disabled={submit2FA.isPending}>
                    {submit2FA.isPending ? 'Submitting...' : 'Submit Code'}
                 </Button>
                 <p className="text-xs text-muted-foreground">
                   Check your SMS or Authenticator app for the login code.
                 </p>
              </div>
            )}
            
            {status === 'completed' && (
              <p className="text-green-600 font-semibold p-2 border border-green-200 bg-green-50 rounded">
                 Success! Account connected securely.
              </p>
            )}
            
            {status === 'failed' && (
              <p className="text-red-500 font-semibold p-2 border border-red-200 bg-red-50 rounded">
                 Login failed. Please check your credentials or try again later.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
