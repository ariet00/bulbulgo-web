import type { Metadata } from 'next'
import { LegalLayout } from '../_components/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — BulBul Social',
  description:
    'The terms under which you may use BulBul Social to publish and manage your social media accounts on Meta platforms.',
}

const LAST_UPDATED = 'May 18, 2026'

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="By signing in to BulBul Social you agree to these terms."
      lastUpdated={LAST_UPDATED}
    >
      <h2>1. The Service</h2>
      <p>
        BulBul Social (the &ldquo;Service&rdquo;) is a software-as-a-service tool that
        helps you publish content, read comments and direct messages, and view analytics for the
        social media accounts you choose to connect — currently Facebook Pages, Instagram
        Business / Creator accounts, WhatsApp Business and Threads. The Service is operated by{' '}
        <strong>[COMPANY LEGAL NAME]</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
      </p>

      <h2>2. Eligibility</h2>
      <p>You may use the Service only if:</p>
      <ul>
        <li>you are at least 16 years old (or the legal age of digital consent in your country);</li>
        <li>you have authority to act on behalf of the accounts you connect;</li>
        <li>your use is not prohibited by the laws of your country.</li>
      </ul>

      <h2>3. Your account</h2>
      <p>
        You authenticate via Google Sign-In. You are responsible for keeping your Google account
        secure. You must promptly notify us if you suspect unauthorised access at{' '}
        <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
      </p>

      <h2>4. Connected social media accounts</h2>
      <p>
        When you connect a Meta account (Facebook Page, Instagram, WhatsApp, Threads), you grant
        us the permissions you select in the OAuth consent screen, solely so that we can perform
        the actions you request through the Service. You may revoke this access at any time from
        the dashboard or from{' '}
        <a
          href="https://www.facebook.com/settings?tab=business_tools"
          rel="noopener noreferrer"
        >
          Meta&rsquo;s Business Integrations page
        </a>
        .
      </p>

      <h2>5. Your content</h2>
      <p>
        You retain all rights to the content you publish through the Service. You grant us a
        non-exclusive, worldwide, royalty-free licence to host, transmit, transcode and store
        that content solely for the purpose of operating the Service on your behalf.
      </p>
      <p>You warrant that your content does not:</p>
      <ul>
        <li>infringe any third party&rsquo;s intellectual property, privacy or other rights;</li>
        <li>contain unlawful, defamatory, deceptive or hateful material;</li>
        <li>
          violate the terms of the destination platform (
          <a href="https://www.facebook.com/communitystandards/" rel="noopener noreferrer">
            Facebook Community Standards
          </a>
          ,{' '}
          <a href="https://help.instagram.com/477434105621119" rel="noopener noreferrer">
            Instagram Community Guidelines
          </a>
          ,{' '}
          <a href="https://www.whatsapp.com/legal/business-policy" rel="noopener noreferrer">
            WhatsApp Business Policy
          </a>
          ,{' '}
          <a href="https://help.instagram.com/769983657850450" rel="noopener noreferrer">
            Threads Community Guidelines
          </a>
          ).
        </li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service to send spam, unsolicited messages, or perform mass-following;</li>
        <li>
          attempt to circumvent rate limits, reverse-engineer the Service, or interfere with its
          operation;
        </li>
        <li>use the Service in any way that violates Meta&rsquo;s Platform Terms or developer policies;</li>
        <li>use scraped or browser-automated logins;</li>
        <li>
          process personal data of third parties without a lawful basis (for WhatsApp recipients,
          you must have explicit opt-in).
        </li>
      </ul>

      <h2>7. Fees</h2>
      <p>
        Pricing, if applicable, is shown in the dashboard. We will give you at least 30 days&rsquo;
        notice before any price increase takes effect.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time via the{' '}
        <a href="/data-deletion">data deletion page</a>. We may suspend or terminate your access
        if you breach these terms, abuse the Service, or place it at legal or security risk. On
        termination, your data is deleted per the retention rules in our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>9. Third-party platforms</h2>
      <p>
        The Service integrates with Meta&rsquo;s Graph API, OpenAI and Google. We are not
        responsible for outages, policy changes, account restrictions, or content removals
        imposed by those platforms.
      </p>

      <h2>10. Disclaimer of warranties</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the
        maximum extent permitted by law, we disclaim all warranties, express or implied,
        including merchantability, fitness for a particular purpose and non-infringement.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our aggregate liability for any claim arising out
        of or relating to the Service shall not exceed the greater of (a) the fees you paid for
        the Service in the 12 months preceding the claim, or (b) USD 100. We are not liable for
        indirect, incidental, consequential or punitive damages, including lost profits or data.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You agree to indemnify and hold us harmless against any third-party claim arising from
        your content, your use of the Service, or your breach of these terms.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these terms from time to time. Material changes will be notified by email
        and in-app at least 14 days before taking effect. Continued use after the effective date
        constitutes acceptance.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These terms are governed by the laws of <strong>[JURISDICTION]</strong>. Any dispute
        shall be resolved in the competent courts of <strong>[CITY, JURISDICTION]</strong>,
        without prejudice to any mandatory consumer-protection rights in your country of
        residence.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:support@bulbul.asia">support@bulbul.asia</a>.
      </p>
    </LegalLayout>
  )
}
