'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThreedsAccounts } from '@/hooks/queries/threeds'
import { AddAccountDialog } from '@/components/threeds/AddAccountDialog'
import { Loader2 } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function ThreedsDashboard() {
  const { data: accounts, isLoading } = useThreedsAccounts()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threads Automation</h1>
          <p className="text-muted-foreground">Manage your profiles and content pipeline</p>
        </div>
        <AddAccountDialog />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : accounts?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 space-y-4">
            <p className="text-muted-foreground">No accounts connected yet.</p>
            <AddAccountDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((acc: any) => (
            <Link key={acc.id} href={`/threeds/${acc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50 group h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {acc.username}
                    </CardTitle>
                    <CardDescription>
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${acc.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {acc.is_active ? 'Connected' : 'Disconnected'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Click to manage content, view trends, and configure AI persona.
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
