import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | QR Generator',
  description: 'Terms of Service for QR Generator - Read our terms and conditions',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 20, 2026'
  const contactEmail = 'support@qrgenerator.app' // Cambiar por tu email real

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using QR Generator ("the Service"), you agree to be bound by these Terms of Service ("Terms").
                If you disagree with any part of these terms, you do not have permission to access the Service.
              </p>
              <p className="text-gray-600">
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                QR Generator is a web-based tool that allows users to create, customize, and manage QR codes.
                The Service includes both free and paid subscription tiers with varying features and limitations.
              </p>
              <p className="text-gray-600">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
                at any time, with or without notice. We shall not be liable to you or any third party for
                any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                When you create an account with us, you must provide accurate, complete, and current information.
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-600 mb-4">
                You are responsible for safeguarding your account password and for any activities or actions under your account.
                You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <p className="text-gray-600">
                You may not use as a username the name of another person or entity that is not lawfully available for use,
                or a name or trademark that is subject to any rights of another person or entity without appropriate authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Subscriptions and Payments</h2>
              <p className="text-gray-600 mb-4">
                Some parts of the Service are billed on a subscription basis ("Subscription(s)").
                You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
                Billing cycles are set on a monthly or annual basis.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Payment Processing:</strong> All payments are processed through Lemon Squeezy, our Merchant of Record.
                By subscribing, you also agree to Lemon Squeezy's terms of service. We do not store your payment information directly.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Automatic Renewal:</strong> Your subscription will automatically renew at the end of each Billing Cycle
                unless you cancel it or we cancel it. You may cancel your subscription renewal through your account settings
                or by contacting us.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Refunds:</strong> Refund requests are handled on a case-by-case basis. We may, at our sole discretion,
                offer refunds for annual subscriptions within 14 days of purchase if you have not extensively used the Service.
                Monthly subscriptions are generally non-refundable. Contact us at {contactEmail} for refund inquiries.
              </p>
              <p className="text-gray-600">
                <strong>Price Changes:</strong> We reserve the right to adjust pricing at any time.
                Any price changes will be communicated to you in advance and will take effect at the start of the next Billing Cycle.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">You agree NOT to use the Service to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Create QR codes that link to illegal, harmful, or malicious content</li>
                <li>Distribute malware, viruses, or any other malicious code</li>
                <li>Engage in phishing, scams, or fraudulent activities</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
              <p className="text-gray-600">
                We reserve the right to terminate or suspend your account immediately, without prior notice,
                for any violation of these acceptable use policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The Service and its original content, features, and functionality are and will remain
                the exclusive property of QR Generator and its licensors. The Service is protected by copyright,
                trademark, and other laws.
              </p>
              <p className="text-gray-600">
                QR codes you create using the Service are yours. You retain all rights to the content
                you encode in your QR codes. However, you grant us a limited license to store and process
                your data as necessary to provide the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Service Availability and QR Code Functionality</h2>
              <p className="text-gray-600 mb-4">
                <strong>No Guarantee of Uptime:</strong> While we strive to maintain high availability,
                we do not guarantee that the Service will be available at all times. The Service may be
                subject to interruptions, including maintenance, updates, or technical issues.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Dynamic QR Codes:</strong> Dynamic QR codes require our servers to redirect scans.
                If you cancel your subscription or if the Service is discontinued, your dynamic QR codes
                may stop functioning. We recommend using static QR codes for critical, permanent applications.
              </p>
              <p className="text-gray-600">
                <strong>Data Retention:</strong> Upon account termination or subscription cancellation,
                we may delete your data, including QR codes, after a reasonable period. It is your responsibility
                to export any data you wish to keep before cancellation.
              </p>
            </section>

            <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                <strong>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>The Service will function uninterrupted, secure, or available at any particular time or location</li>
                <li>Any errors or defects will be corrected</li>
                <li>The Service is free of viruses or other harmful components</li>
                <li>The results of using the Service will meet your requirements</li>
                <li>QR codes generated will be scannable by all devices or applications</li>
              </ul>
              <p className="text-gray-700">
                You understand and agree that you use the Service at your own risk.
              </p>
            </section>

            <section className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL QR GENERATOR,
                ITS OWNER, OPERATORS, AFFILIATES, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Loss of profits, revenue, or business</li>
                <li>Loss of data or information</li>
                <li>Loss of goodwill or reputation</li>
                <li>Cost of substitute services</li>
                <li>Any damages resulting from QR codes not functioning as expected</li>
                <li>Any damages resulting from unauthorized access to your account</li>
                <li>Any damages resulting from service interruptions or discontinuation</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE
                SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM,
                OR $100 USD, WHICHEVER IS GREATER.</strong>
              </p>
              <p className="text-gray-700">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability.
                In such cases, our liability will be limited to the greatest extent permitted by law.
              </p>
            </section>

            <section className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless QR Generator, its owner, operators,
                and any affiliates from and against any claims, damages, obligations, losses, liabilities,
                costs, or debt, and expenses (including attorney's fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your use of and access to the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right, including intellectual property rights</li>
                <li>Any claim that your QR codes or their content caused damage to a third party</li>
                <li>Content you encode in QR codes created through the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Colombia,
                without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Informal Resolution:</strong> Before filing any legal claim, you agree to try to resolve
                any dispute informally by contacting us at {contactEmail}. We will attempt to resolve the dispute
                informally within 30 days.
              </p>
              <p className="text-gray-600">
                <strong>Arbitration:</strong> If informal resolution fails, any disputes arising from these Terms
                or the Service shall be resolved through binding arbitration, except where prohibited by law.
                You waive the right to participate in class actions or class arbitrations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify or replace these Terms at any time at our sole discretion.
                If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-600">
                By continuing to access or use our Service after those revisions become effective,
                you agree to be bound by the revised terms. If you do not agree to the new terms,
                please stop using the Service and cancel your subscription.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability,
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-gray-600">
                Upon termination, your right to use the Service will immediately cease.
                If you wish to terminate your account, you may simply discontinue using the Service
                or contact us to request account deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Severability</h2>
              <p className="text-gray-600">
                If any provision of these Terms is held to be unenforceable or invalid, such provision
                will be changed and interpreted to accomplish the objectives of such provision to the
                greatest extent possible under applicable law, and the remaining provisions will continue
                in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {contactEmail}
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
