import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | QR Generator',
  description: 'Privacy Policy for QR Generator - Learn how we handle your data',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 20, 2026'
  const contactEmail = 'support@qrgenerator.app' // Cambiar por tu email real

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                QR Generator ("we", "us", or "our") operates the QR Generator web application (the "Service").
                This Privacy Policy informs you of our policies regarding the collection, use, and disclosure
                of personal data when you use our Service.
              </p>
              <p className="text-gray-600">
                By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><strong>Account Information:</strong> When you register, we collect your email address, name (if provided), and password (stored securely hashed).</li>
                <li><strong>QR Code Content:</strong> The data you encode in QR codes (URLs, text, contact information, etc.).</li>
                <li><strong>Payment Information:</strong> Processed by Lemon Squeezy (our payment processor). We do NOT store your credit card details.</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, QR codes created, and actions taken within the Service.</li>
                <li><strong>QR Scan Analytics:</strong> When someone scans your dynamic QR code, we collect:
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>Date and time of scan</li>
                    <li>Approximate geographic location (country, city - derived from IP)</li>
                    <li>Device type (mobile, tablet, desktop)</li>
                    <li>Browser and operating system</li>
                    <li>Referrer information</li>
                  </ul>
                </li>
                <li><strong>Log Data:</strong> IP address, browser type, browser version, pages visited, time and date of visit.</li>
                <li><strong>Cookies:</strong> We use cookies for authentication and session management.</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Information We Do NOT Collect</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>We do NOT store your credit card or banking information</li>
                <li>We do NOT collect personal information from QR code scanners beyond anonymous analytics</li>
                <li>We do NOT sell your personal data to third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the collected data for various purposes:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>To provide and maintain the Service</li>
                <li>To manage your account and subscription</li>
                <li>To process payments through our payment processor</li>
                <li>To provide QR code scanning analytics to you</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To detect, prevent, and address technical issues or abuse</li>
                <li>To improve the Service based on usage patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-600 mb-4">
                Your data is stored on secure servers provided by Supabase (database) and Vercel (hosting).
                We implement industry-standard security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>HTTPS encryption for all data transmission</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Access controls and authentication</li>
                <li>Regular security updates</li>
              </ul>
              <p className="text-gray-600">
                However, no method of transmission over the Internet or electronic storage is 100% secure.
                While we strive to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600 mb-4">We use the following third-party services that may collect information:</p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Lemon Squeezy (Payment Processing)</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Handles all payment processing. They collect payment information directly.
                    See: <a href="https://www.lemonsqueezy.com/privacy" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Lemon Squeezy Privacy Policy</a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Supabase (Database)</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Hosts our database infrastructure.
                    See: <a href="https://supabase.com/privacy" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Vercel (Hosting)</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Hosts our web application.
                    See: <a href="https://vercel.com/legal/privacy-policy" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Google OAuth (Optional Authentication)</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    If you choose to sign in with Google, we receive your name and email from Google.
                    See: <a href="https://policies.google.com/privacy" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to maintain your session and preferences.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality. Cannot be disabled.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We do NOT use advertising or tracking cookies from third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your personal data only for as long as necessary for the purposes set out in this Privacy Policy:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active. Deleted upon request or after 2 years of inactivity.</li>
                <li><strong>QR Codes:</strong> Retained while your account is active. May be deleted 30 days after account cancellation.</li>
                <li><strong>Scan Analytics:</strong> Retained for up to 2 years, then automatically deleted or anonymized.</li>
                <li><strong>Payment Records:</strong> Retained as required by tax and accounting laws (typically 7 years).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                Depending on your location, you may have certain rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at {contactEmail}. We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600">
                Your information may be transferred to and maintained on servers located outside of your country.
                Our service providers (Vercel, Supabase, Lemon Squeezy) have servers in various locations globally.
                By using the Service, you consent to such transfers. We ensure that any such transfers comply with
                applicable data protection laws and that your data remains protected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600">
                Our Service is not directed to anyone under the age of 13 ("Children"). We do not knowingly collect
                personally identifiable information from children under 13. If you are a parent or guardian and
                you are aware that your child has provided us with personal data, please contact us.
                If we become aware that we have collected personal data from children without verification
                of parental consent, we will take steps to remove that information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. GDPR Compliance (For EU Users)</h2>
              <p className="text-gray-600 mb-4">
                If you are a resident of the European Economic Area (EEA), you have certain data protection rights under GDPR.
                We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Legal Basis for Processing:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Contract:</strong> Processing necessary to provide the Service you requested</li>
                <li><strong>Consent:</strong> Where you have given explicit consent</li>
                <li><strong>Legitimate Interests:</strong> To improve our Service and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-600 mb-4">
                If you are a California resident, you have specific rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if your data is sold or disclosed</li>
                <li>Right to say no to the sale of personal information (we do NOT sell your data)</li>
                <li>Right to access your personal information</li>
                <li>Right to equal service and price (no discrimination for exercising rights)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-600">
                You are advised to review this Privacy Policy periodically for any changes.
                Changes are effective immediately upon posting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {contactEmail}
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between">
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              &larr; Back to Home
            </Link>
            <Link href="/legal/terms" className="text-purple-600 hover:text-purple-700 font-medium">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
