import type { Metadata } from 'next'
import { LegalLayout } from '../../_components/LegalLayout'

export const metadata: Metadata = {
  title: 'Data Deletion Status — BulBul Social',
}

interface PageProps {
  searchParams: Promise<{ code?: string }>
}

interface StatusPayload {
  meta_user_id?: string
  accounts_affected?: number
  status?: string
}

async function fetchStatus(code: string): Promise<StatusPayload | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.bulbul.asia/api/v1'
  try {
    const res = await fetch(`${apiBase}/meta/data-deletion-status/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as StatusPayload
  } catch {
    return null
  }
}

export default async function DataDeletionStatusPage({ searchParams }: PageProps) {
  const { code } = await searchParams
  const status = code ? await fetchStatus(code) : null

  return (
    <LegalLayout title="Data Deletion Status" lastUpdated="May 18, 2026">
      {!code && (
        <p>
          No confirmation code provided. If you received a status URL from Meta after removing
          BulBul Social from your account, open that URL directly.
        </p>
      )}

      {code && !status && (
        <p>
          We could not find a deletion request for confirmation code <code>{code}</code>. The
          code may have expired (we keep deletion records for 30 days) or it may have already
          been processed and purged.
        </p>
      )}

      {code && status && (
        <>
          <p>
            Confirmation code: <code>{code}</code>
          </p>
          <p>
            Status: <strong>{status.status || 'received'}</strong>
          </p>
          <p>
            Connected accounts affected by this request:{' '}
            <strong>{status.accounts_affected ?? 0}</strong>
          </p>
          <p>
            We process the deletion within 30 days and purge backups within 35 days. For
            questions write to{' '}
            <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
          </p>
        </>
      )}
    </LegalLayout>
  )
}
