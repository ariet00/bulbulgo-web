'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { staffApi } from '@/apis/staff'
import type { KbArticleItem, KbArticleListItem } from '@/types/staff'

export default function KnowledgePage() {
  const t = useTranslations('knowledge')
  const qc = useQueryClient()

  const meQuery = useQuery({ queryKey: ['staff', 'me'], queryFn: staffApi.me })
  const me = meQuery.data
  const canManage = me ? me.is_owner || me.role === 'staff_manager' : false

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editing, setEditing] = useState<{ id?: number } | null>(null)
  const [search, setSearch] = useState('')

  const listQuery = useQuery({
    queryKey: ['staff', 'kb', 'list', search],
    queryFn: () => (search ? staffApi.kbSearch(search) : staffApi.listKbArticles()),
    enabled: Boolean(me),
  })

  const articleQuery = useQuery({
    queryKey: ['staff', 'kb', 'article', selectedId],
    queryFn: () => staffApi.getKbArticle(selectedId!),
    enabled: Boolean(selectedId),
  })

  const readersQuery = useQuery({
    queryKey: ['staff', 'kb', 'readers', selectedId],
    queryFn: () => staffApi.kbReaders(selectedId!),
    enabled: Boolean(selectedId && canManage),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => staffApi.deleteKbArticle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'kb'] })
      setSelectedId(null)
      toast.success(t('deleted'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('error')),
  })

  if (meQuery.isLoading || !me) return <Shell>…</Shell>

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        {canManage && (
          <button
            type="button"
            onClick={() => setEditing({})}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            {t('newArticle')}
          </button>
        )}
      </header>

      <div className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 rounded border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
        <section className="min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">{t('articles')}</h2>
          {listQuery.isLoading && <p className="text-sm">…</p>}
          {listQuery.data && listQuery.data.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          )}
          {listQuery.data && listQuery.data.length > 0 && (
            <ul className="divide-y rounded-lg border bg-card">
              {listQuery.data.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(a.id)
                      setEditing(null)
                    }}
                    className={`block w-full p-3 text-left text-sm hover:bg-blue-50 ${
                      selectedId === a.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{a.title}</span>
                      {!a.is_published && (
                        <span className="text-[10px] rounded bg-gray-100 px-1.5 py-0.5">{t('draft')}</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {a.category && <span>{a.category}</span>}
                      <span>· {a.read_count} {t('reads')}</span>
                      {a.is_read && <span>· ✓</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0">
          {!selectedId && !editing && (
            <p className="text-sm text-muted-foreground">{t('pickArticle')}</p>
          )}
          {selectedId && articleQuery.data && !editing && (
            <ArticleReader
              article={articleQuery.data}
              readersCount={readersQuery.data?.readers.length ?? 0}
              totalRequired={readersQuery.data?.total_required ?? 0}
              canManage={canManage}
              onEdit={() => setEditing({ id: articleQuery.data!.id })}
              onDelete={() => {
                if (confirm(t('confirmDelete'))) deleteMutation.mutate(articleQuery.data!.id)
              }}
              t={t}
            />
          )}
          {editing !== null && (
            <ArticleEditor
              key={editing.id ?? 'new'}
              articleId={editing.id}
              onClose={() => setEditing(null)}
              onSaved={(saved) => {
                qc.invalidateQueries({ queryKey: ['staff', 'kb'] })
                setEditing(null)
                setSelectedId(saved.id)
              }}
              t={t}
            />
          )}
        </section>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-5xl p-4 space-y-4">{children}</main>
}

function ArticleReader({
  article,
  readersCount,
  totalRequired,
  canManage,
  onEdit,
  onDelete,
  t,
}: {
  article: KbArticleItem
  readersCount: number
  totalRequired: number
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
  t: (k: string) => string
}) {
  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <header>
        <h2 className="text-lg font-semibold">{article.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {article.category && <span>{article.category}</span>}
          {article.is_published ? (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">{t('published')}</span>
          ) : (
            <span className="rounded bg-gray-100 px-1.5 py-0.5">{t('draft')}</span>
          )}
          {totalRequired > 0 && (
            <span>{t('readProgress').replace('{n}', String(readersCount)).replace('{m}', String(totalRequired))}</span>
          )}
        </div>
      </header>

      <div
        className="prose prose-sm max-w-none text-sm"
        // KB content is HTML composed by managers; trusted internal source.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {canManage && (
        <footer className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded border px-3 py-1 text-xs"
          >
            {t('edit')}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded border border-red-600 px-3 py-1 text-xs text-red-700"
          >
            {t('delete')}
          </button>
        </footer>
      )}
    </article>
  )
}

function ArticleEditor({
  articleId,
  onClose,
  onSaved,
  t,
}: {
  articleId?: number
  onClose: () => void
  onSaved: (saved: KbArticleItem) => void
  t: (k: string) => string
}) {
  const isNew = !articleId

  const existingQuery = useQuery({
    queryKey: ['staff', 'kb', 'article', articleId],
    queryFn: () => staffApi.getKbArticle(articleId!),
    enabled: Boolean(articleId),
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    if (existingQuery.data) {
      setTitle(existingQuery.data.title)
      setContent(existingQuery.data.content)
      setCategory(existingQuery.data.category ?? '')
      setTags((existingQuery.data.tags ?? []).join(', '))
      setIsPublished(existingQuery.data.is_published)
    }
  }, [existingQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        content,
        category: category || null,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        is_published: isPublished,
      }
      if (isNew) return staffApi.createKbArticle(body)
      return staffApi.updateKbArticle(articleId!, body)
    },
    onSuccess: (saved) => {
      toast.success(t('saved'))
      onSaved(saved)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('error')),
  })

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h2 className="font-semibold">{isNew ? t('newArticle') : t('editArticle')}</h2>

      <input
        type="text"
        placeholder={t('titlePh')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border bg-background px-2 py-1.5 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder={t('categoryPh')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border bg-background px-2 py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder={t('tagsPh')}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <textarea
        rows={14}
        placeholder={t('contentPh')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded border bg-background px-2 py-1.5 font-mono text-xs"
      />
      <p className="text-[10px] text-muted-foreground">{t('htmlHint')}</p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <span>{t('publishToggle')}</span>
      </label>

      <footer className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded border px-3 py-1.5 text-sm">
          {t('cancel')}
        </button>
        <button
          type="button"
          disabled={saveMutation.isPending || !title}
          onClick={() => saveMutation.mutate()}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saveMutation.isPending ? '…' : t('save')}
        </button>
      </footer>
    </div>
  )
}
