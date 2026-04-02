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
import { Textarea } from '@/components/ui/textarea'
import { useUpdateAccount } from '@/hooks/mutations/threeds'
import { Settings2, Loader2 } from 'lucide-react'

interface EditPersonaDialogProps {
  account: any
}

export function EditPersonaDialog({ account }: EditPersonaDialogProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(account.data?.persona_role || '')
  const [context, setContext] = useState(account.data?.persona_context || '')
  const [gender, setGender] = useState(account.data?.persona_gender || '')
  const [age, setAge] = useState(account.data?.persona_age || '')
  
  const updateAccount = useUpdateAccount()

  const handleSave = async () => {
    await updateAccount.mutateAsync({
      accountId: account.id,
      data: {
        persona_role: role,
        persona_context: context,
        persona_gender: gender,
        persona_age: parseInt(age) || null
      }
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>AI Persona Settings</DialogTitle>
          <DialogDescription>
            Configure how the AI should represent this account. This information will guide the tone and content of generated posts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Expert Marketer, Tech Enthusiast"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
            <Input
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="e.g. Male, Female, Other"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 30"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="context" className="text-right pt-2">
              Context / Bio
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe background, writing style, interests, and general mission..."
              className="col-span-3 min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateAccount.isPending}>
            {updateAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Persona
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
