'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThreedsAccounts } from '@/hooks/queries/threeds'

export default function ThreedsDashboard() {
  const { data: accounts, isLoading } = useThreedsAccounts()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Threads Automation Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>Manage your connected Threads accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading accounts...</p>
          ) : accounts?.length === 0 ? (
            <p className="text-muted-foreground">No accounts connected yet. Add one to get started!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts?.map((acc: any) => (
                <div key={acc.id} className="p-4 border rounded-lg">
                  <p className="font-semibold">{acc.username}</p>
                  <p className="text-xs text-muted-foreground">Status: {acc.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
