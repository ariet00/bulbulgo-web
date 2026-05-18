import type { Metadata } from 'next'
import { LegalLayout } from '../_components/LegalLayout'

export const metadata: Metadata = {
  title: 'Data Deletion — BulBul Content Manager',
  description:
    'How to delete your BulBul Content Manager account and all data associated with your connected Meta accounts.',
}

const LAST_UPDATED = 'May 18, 2026'

export default function DataDeletionPage() {
  return (
    <LegalLayout
      title="Data Deletion"
      subtitle="Two ways to request deletion of your data — self-service in the app, or by writing to us."
      lastUpdated={LAST_UPDATED}
    >
      <h2>Self-service (recommended)</h2>
      <ol>
        <li>
          Sign in to <a href="https://admin.bulbul.asia">admin.bulbul.asia</a>.
        </li>
        <li>
          For each connected social-media account, open the account&rsquo;s detail page and
          click <strong>Delete account</strong>. This revokes our OAuth tokens, stops all data
          fetching, and removes the data we hold for that connection.
        </li>
        <li>
          To delete your entire BulBul account (and all connected accounts), open{' '}
          <strong>Settings → Delete my BulBul account</strong>.
        </li>
      </ol>
      <p>
        We process the deletion immediately. All personal data is removed from our primary
        database within seconds; backups are purged within 35 days.
      </p>

      <h2>By email</h2>
      <p>
        If you can no longer sign in, write to{' '}
        <a href="mailto:support@bulbul.asia">support@bulbul.asia</a> from the email address
        associated with your BulBul account. We will verify your identity and confirm deletion
        within 30 days.
      </p>

      <h2>Revoking access from Meta&rsquo;s side</h2>
      <p>
        You can also remove BulBul Content Manager from your Meta accounts directly. This stops
        all access on Meta&rsquo;s side immediately, even before we receive the deletion
        callback:
      </p>
      <ul>
        <li>
          Facebook /&nbsp;Instagram /&nbsp;Threads:{' '}
          <a
            href="https://www.facebook.com/settings?tab=business_tools"
            rel="noopener noreferrer"
          >
            Settings → Business Integrations
          </a>{' '}
          → find &ldquo;BulBul Content Manager&rdquo; → Remove.
        </li>
        <li>
          WhatsApp Business:{' '}
          <a
            href="https://business.facebook.com/wa/manage/home"
            rel="noopener noreferrer"
          >
            WhatsApp Manager
          </a>{' '}
          → System users → revoke our system user.
        </li>
      </ul>
      <p>
        Meta will then notify us via the data deletion callback below, and we will remove the
        corresponding data from our systems within 30 days.
      </p>

      <h2>What is deleted</h2>
      <ul>
        <li>OAuth access tokens (immediately).</li>
        <li>Account identifiers (user ID, page ID, Instagram Business Account ID, etc.).</li>
        <li>Cached profile data (display name, avatar, biography).</li>
        <li>Content drafts and scheduled posts you created in the Service.</li>
        <li>Fetched comments, replies, direct messages and insights.</li>
        <li>AI generation history.</li>
      </ul>

      <h2>What is retained (and why)</h2>
      <ul>
        <li>
          Anonymised, aggregated usage counters — retained indefinitely so we can monitor
          platform health. These do not identify you.
        </li>
        <li>
          Records that we are legally required to retain (e.g.{' '}
          invoices, tax records) — kept for the legally mandated retention period and then
          deleted.
        </li>
        <li>
          Application logs that mention your IP address — retained for 30 days for security
          purposes, then purged.
        </li>
      </ul>

      <h2>Data Deletion Callback (for Meta)</h2>
      <p>
        Our Data Deletion Callback URL is:{' '}
        <code>https://api.bulbul.asia/api/v1/meta/data-deletion-callback</code>
      </p>
      <p>
        When Meta sends a deletion request through this endpoint, we acknowledge it
        synchronously with a confirmation code and a status URL. You can use the status URL to
        verify the deletion has been completed; deletion itself is processed within 30 days.
      </p>

      <h2>Questions</h2>
      <p>
        <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>
      </p>
    </LegalLayout>
  )
}
