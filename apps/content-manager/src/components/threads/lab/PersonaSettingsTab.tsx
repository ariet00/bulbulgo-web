'use client'

import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Textarea,
} from '@doska/ui'
import { useUpdateContentAccount, type ContentAccount } from '@doska/shared'
import { Loader2, Save, TrendingUp, Wand2 } from 'lucide-react'

// AI persona + collector settings (stored in account.data). Moved verbatim
// out of ThreadsAccountDetail; behaviour intentionally unchanged.
export function PersonaSettingsTab({ account }: { account: ContentAccount }) {
  const accountId = account.id
  const updateAccount = useUpdateContentAccount()
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (account && !settings) {
      const d = account.data || {}
      setSettings({
        persona_role: d.persona_role || '',
        persona_context: d.persona_context || '',
        persona_gender: d.persona_gender || '',
        persona_age: d.persona_age || '',
        persona_country: d.persona_country || '',
        persona_city: d.persona_city || '',
        persona_languages: d.persona_languages || '',
        persona_tone: d.persona_tone || '',
        persona_interests: d.persona_interests || '',
        persona_whitelist: d.persona_whitelist || '',
        persona_blacklist: d.persona_blacklist || '',
        collector_limit: d.collector_limit || 20,
        collector_min_likes: d.collector_min_likes || 0,
        collector_with_media_only: d.collector_with_media_only || false,
        collector_no_media_only: d.collector_no_media_only || false,
        gen_num_posts: d.gen_num_posts || 1,
        gen_mode: d.gen_mode || 'both',
        coll_mode: d.coll_mode || 'latest_n',
        coll_window_hours: d.coll_window_hours || 24,
        coll_interval_mins: d.coll_interval_mins || 60,
        gen_interval_mins: d.gen_interval_mins || 1440,
        ai_persona_template: d.ai_persona_template || '',
        ai_generation_prompt: d.ai_generation_prompt || '',
        ai_model: d.ai_model || 'gpt-4o-mini',
      })
    }
  }, [account, settings])

  const handleSaveSettings = async () => {
    await updateAccount.mutateAsync({
      platform: 'threads',
      accountId,
      data: {
        data: {
          ...settings,
          persona_age: parseInt(settings.persona_age) || null,
          collector_limit: parseInt(settings.collector_limit) || 20,
          collector_min_likes: parseInt(settings.collector_min_likes) || 0,
          gen_num_posts: parseInt(settings.gen_num_posts) || 1,
          coll_window_hours: parseInt(settings.coll_window_hours) || 24,
          coll_interval_mins: parseInt(settings.coll_interval_mins) || 60,
          gen_interval_mins: parseInt(settings.gen_interval_mins) || 1440,
        },
      },
    })
  }

  const saveButton = (label: string) => (
    <Button className="w-full" onClick={handleSaveSettings} disabled={updateAccount.isPending}>
      {updateAccount.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" /> AI Persona
          </CardTitle>
          <CardDescription>Опишите личность, для которой AI будет генерировать посты.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Роль</Label>
              <Input
                value={settings?.persona_role || ''}
                onChange={(e) => setSettings({ ...settings, persona_role: e.target.value })}
                placeholder="Например: крипто-блогер"
              />
            </div>
            <div className="space-y-2">
              <Label>Tone of voice</Label>
              <Input
                value={settings?.persona_tone || ''}
                onChange={(e) => setSettings({ ...settings, persona_tone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Контекст</Label>
            <Textarea
              className="min-h-[120px]"
              value={settings?.persona_context || ''}
              onChange={(e) => setSettings({ ...settings, persona_context: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4">{saveButton('Сохранить персону')}</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Сбор данных
          </CardTitle>
          <CardDescription>Настройка автоматического сбора трендов.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Лимит постов</Label>
            <Input
              type="number"
              value={settings?.collector_limit || 20}
              onChange={(e) => setSettings({ ...settings, collector_limit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Минимум лайков</Label>
            <Input
              type="number"
              value={settings?.collector_min_likes || 0}
              onChange={(e) => setSettings({ ...settings, collector_min_likes: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Только с медиа</Label>
            <Switch
              checked={settings?.collector_with_media_only || false}
              onCheckedChange={(val) => setSettings({ ...settings, collector_with_media_only: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Только текстовые</Label>
            <Switch
              checked={settings?.collector_no_media_only || false}
              onCheckedChange={(val) => setSettings({ ...settings, collector_no_media_only: val })}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4">{saveButton('Сохранить сбор')}</CardFooter>
      </Card>
    </div>
  )
}
