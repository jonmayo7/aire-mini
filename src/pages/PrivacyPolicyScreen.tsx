import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: November 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-slate dark:prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p>
              Welcome to WayMaker.ai ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience while using our Daily Intentional Reflection Protocol (DiRP) service. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Account Information</h3>
            <p>
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (required for authentication)</li>
              <li>First name and last name (optional)</li>
              <li>Authentication credentials managed by Supabase</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2 DiRP Data</h3>
            <p>
              We collect and store the content you create during your daily cycles:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prime text (your daily intention)</li>
              <li>Improve text (reflection and improvement notes)</li>
              <li>Commit text (your commitment statement)</li>
              <li>Execution scores (self-assessed ratings)</li>
              <li>Cycle dates and timestamps</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Notification Preferences</h3>
            <p>
              If you choose to set up notifications, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (for email notifications)</li>
              <li>Phone number (for SMS notifications, if opted in)</li>
              <li>Preferred notification time</li>
              <li>Notification method preference (email, SMS, or both)</li>
              <li>Consent timestamps and IP address (for SMS compliance)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.4 SMS Opt-In</h3>
            <p>
              <strong>SMS Consent:</strong> By opting into SMS notifications, you explicitly consent to receive text messages from WayMaker.ai at the phone number you provide. You can opt out at any time by replying STOP to any message. Message and data rates may apply.
            </p>
            <p>
              We store your SMS opt-in consent with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Timestamp of when you opted in</li>
              <li>IP address and user agent at time of consent</li>
              <li>SMS keyword opt-in timestamps (if you text JOIN)</li>
              <li>Opt-out status and timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain our service</li>
              <li>Send you daily reminder notifications (if opted in)</li>
              <li>Store and display your DiRP history</li>
              <li>Generate analytics and insights about your progress</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, which provides enterprise-grade security including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption at rest and in transit</li>
              <li>Row-level security policies</li>
              <li>Regular security audits and compliance certifications</li>
            </ul>
            <p>
              We implement additional security measures including JWT authentication and secure API endpoints. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h2>
            <p>
              We retain your DiRP data and account information for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.
            </p>
            <p>
              SMS consent records are retained for 24 months for compliance and audit purposes, as required by TCPA regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt out of SMS notifications (reply STOP)</li>
              <li>Opt back into SMS notifications (reply START)</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Resend:</strong> Email delivery service</li>
              <li><strong>Twilio:</strong> SMS delivery service (if you opt in)</li>
              <li><strong>Vercel:</strong> Application hosting and deployment</li>
              <li><strong>Stripe:</strong> Payment processing (for subscriptions)</li>
            </ul>
            <p>
              These services have their own privacy policies and terms of service. We recommend reviewing them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Children's Privacy</h2>
            <p>
              Our service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: support@waymaker.ai<br />
              Website: https://waymaker.ai
            </p>
          </section>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );
}

