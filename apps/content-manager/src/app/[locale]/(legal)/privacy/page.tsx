import type { Metadata } from 'next'
import { LegalLayout } from '../_components/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — BulBul Content Manager',
  description:
    'How BulBul Content Manager collects, uses, stores and shares your personal data and the data of your connected Meta (Facebook, Instagram, WhatsApp, Threads) accounts.',
}

const LAST_UPDATED = 'May 18, 2026'

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="BulBul Content Manager — a service that helps small businesses publish and manage their social media presence."
      lastUpdated={LAST_UPDATED}
    >
      <h2>1. Who we are</h2>
      <p>
        BulBul Content Manager (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
        operated by <strong>[COMPANY LEGAL NAME]</strong>, registered at{' '}
        <strong>[REGISTERED ADDRESS]</strong>, registration number{' '}
        <strong>[REGISTRATION NUMBER]</strong>. You can reach us at{' '}
        <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
      </p>

      <h2>2. Scope</h2>
      <p>
        This policy explains what personal data we collect, how we use it, the legal basis for
        processing, with whom we share it, how long we keep it, and your rights. It applies to the
        web application available at{' '}
        <a href="https://content-manager.bulbul.asia">https://content-manager.bulbul.asia</a> and the supporting
        backend at <a href="https://api.bulbul.asia">https://api.bulbul.asia</a>.
      </p>

      <h2>3. What we collect</h2>

      <h3>3.1 Account data (you)</h3>
      <ul>
        <li>
          Your email address, display name, profile picture and Google account ID — obtained when
          you sign in with Google.
        </li>
        <li>Authentication cookies and session tokens issued by our service.</li>
      </ul>

      <h3>3.2 Connected platform data (Meta platforms)</h3>
      <p>When you connect a Threads, Instagram, Facebook Page or WhatsApp Business account:</p>
      <ul>
        <li>
          <strong>OAuth access tokens</strong> issued by Meta, encrypted at rest using AES-128 in
          CBC mode (Fernet).
        </li>
        <li>
          <strong>Account identifiers</strong>: user ID, username, page ID, Instagram Business
          Account ID, WhatsApp Business Account ID, phone number ID.
        </li>
        <li>
          <strong>Public profile data</strong>: display name, profile picture URL, biography.
        </li>
        <li>
          <strong>Content you publish through the Service</strong>: post text, images, videos,
          scheduled publish time, and the resulting platform post ID.
        </li>
        <li>
          <strong>Engagement data we fetch on your behalf</strong>: comments and replies on your
          posts, direct messages addressed to your accounts (Instagram, WhatsApp), insights
          (impressions, reach, likes, replies).
        </li>
      </ul>

      <h3>3.3 Technical data</h3>
      <ul>
        <li>IP address, user-agent, request timestamps (kept in application logs for 30 days).</li>
        <li>Error reports and diagnostic events.</li>
      </ul>

      <h2>4. Why we collect it (purposes &amp; legal basis)</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Data used</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Authenticate you</td>
            <td>Google account ID, email, session cookies</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Publish content to your Meta accounts on your instruction</td>
            <td>OAuth tokens, post content, account identifiers</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Fetch comments, replies and messages for the in-app inbox</td>
            <td>OAuth tokens, message metadata, message bodies</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Generate AI draft text suggestions</td>
            <td>Your prompt, optional sample posts you select</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Detect abuse, prevent fraud, debug</td>
            <td>IP address, logs, error reports</td>
            <td>Legitimate interest</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Third parties we share data with</h2>
      <p>
        We only share the minimum data needed for the Service to function. We do not sell your
        personal data.
      </p>
      <ul>
        <li>
          <strong>Meta Platforms, Inc.</strong> — when you publish content, fetch insights, or
          interact with Instagram / Facebook / WhatsApp / Threads, your data is transmitted to
          Meta&rsquo;s Graph API. Their handling is governed by{' '}
          <a href="https://www.facebook.com/privacy/policy/" rel="noopener noreferrer">
            Meta&rsquo;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>OpenAI, L.L.C.</strong> — when you ask the Service to generate draft post text,
          the prompt (which may include text from posts you selected) is sent to OpenAI&rsquo;s
          API. Per OpenAI&rsquo;s API terms, this data is not used for model training. See{' '}
          <a href="https://openai.com/policies/privacy-policy" rel="noopener noreferrer">
            OpenAI Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Google LLC</strong> — for sign-in (OAuth). See{' '}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer">
            Google Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Infrastructure providers</strong> — Vercel (frontend hosting), our own servers
          hosted in [HOSTING REGION] for the backend and database.
        </li>
      </ul>

      <h2>6. Where data is stored</h2>
      <p>
        All personal data is stored in PostgreSQL and MinIO object storage on servers located in{' '}
        <strong>[HOSTING REGION]</strong>. Database backups are encrypted at rest. OAuth access
        tokens are additionally encrypted at the application layer using a symmetric key (Fernet,
        AES-128-CBC + HMAC-SHA256) before being written to the database.
      </p>

      <h2>7. How long we keep data</h2>
      <ul>
        <li>
          <strong>Account &amp; connected accounts</strong>: for as long as you keep the account
          active.
        </li>
        <li>
          <strong>Published posts and fetched insights</strong>: 24 months, then aggregated and
          anonymised.
        </li>
        <li>
          <strong>Messages and comments</strong>: 90 days, unless you mark them for retention.
        </li>
        <li>
          <strong>Application logs</strong>: 30 days.
        </li>
        <li>
          <strong>Backups</strong>: 35 days rolling.
        </li>
        <li>
          When you delete an account, all of the above is removed within 30 days, except where we
          are legally required to retain it.
        </li>
      </ul>

      <h2>8. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>
          Delete your account and all associated data via{' '}
          <a href="/data-deletion">our data deletion page</a>.
        </li>
        <li>
          Disconnect a Meta account at any time from the dashboard — we will delete the OAuth
          token and stop fetching new data immediately.
        </li>
        <li>Export your data in a machine-readable format (on request).</li>
        <li>Lodge a complaint with your local data protection authority.</li>
      </ul>

      <h2>9. Security</h2>
      <p>
        We use HTTPS everywhere, encrypt OAuth tokens at rest, restrict database access to
        application servers, rotate secrets regularly, and require two-factor authentication for
        all team members with production access. We notify affected users within 72 hours of
        becoming aware of any data breach that may affect them.
      </p>

      <h2>10. Children</h2>
      <p>
        The Service is not directed to children under 16. We do not knowingly collect data from
        children. If you believe a child has provided us data, contact us and we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be communicated by
        email and via an in-app notice at least 14 days before they take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, requests or complaints about this policy or your data: write to{' '}
        <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
      </p>

      <hr />

      <h2 id="ru">Краткое содержание на русском</h2>
      <p>
        <strong>BulBul Content Manager</strong> — сервис для управления соцсетями (Facebook,
        Instagram, WhatsApp, Threads). Мы храним токены доступа к вашим аккаунтам Meta в
        зашифрованном виде, контент, который вы публикуете через сервис, и метаданные
        комментариев/сообщений, которые мы получаем по вашему поручению.
      </p>
      <p>
        Мы передаём ваши данные только в Meta (для выполнения ваших действий — публикации,
        чтения комментариев), в OpenAI (если вы используете AI-генерацию текстов), в Google
        (для входа) и нашему хостинг-провайдеру. Мы не продаём ваши данные.
      </p>
      <p>
        Вы можете удалить аккаунт в любой момент на странице{' '}
        <a href="/data-deletion">удаления данных</a>. Все данные будут удалены в течение 30
        дней. По любым вопросам — <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
      </p>
    </LegalLayout>
  )
}
