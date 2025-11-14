import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServiceScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: November 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-slate dark:prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using WayMaker.ai ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
            <p>
              WayMaker.ai provides a Daily Intentional Reflection Protocol (DiRP) service, which is a structured daily cycle designed to help users build clarity, momentum, and agency through intentional reflection and commitment. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Daily cycle creation and tracking</li>
              <li>Progress visualization and analytics</li>
              <li>Optional email and SMS reminder notifications</li>
              <li>Subscription-based premium features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Account Creation</h3>
            <p>
              To use the Service, you must create an account by providing a valid email address and creating a password. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Account Responsibility</h3>
            <p>
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All activities that occur under your account</li>
              <li>Maintaining the security of your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring the accuracy of information you provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">4. SMS Messaging Terms</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Opt-In Consent</h3>
            <p>
              By opting into SMS notifications, you consent to receive automated text messages from WayMaker.ai at the phone number you provide. You understand that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Message and data rates may apply</li>
              <li>You can opt out at any time by replying STOP</li>
              <li>You can opt back in by replying START</li>
              <li>You can get help by replying HELP</li>
              <li>Message frequency varies based on your notification preferences</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">4.2 SMS Opt-Out</h3>
            <p>
              You may opt out of SMS notifications at any time by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Replying STOP to any SMS message</li>
              <li>Updating your notification preferences in your account settings</li>
            </ul>
            <p>
              After opting out, you will receive a confirmation message. You will no longer receive SMS notifications unless you opt back in.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Carrier Limitations</h3>
            <p>
              We are not liable for delayed or undelivered messages. Carriers are not liable for delayed or undelivered messages. Message delivery is subject to carrier network availability and coverage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">5. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to the Service</li>
              <li>Not interfere with or disrupt the Service</li>
              <li>Not use the Service to transmit harmful code or content</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Provide accurate and truthful information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Subscription and Payment</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Free Trial</h3>
            <p>
              New users receive a free trial period allowing access to all features for 21 completed cycles. After the trial period, a subscription is required to continue using the Service.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Subscription Plans</h3>
            <p>
              Subscription plans are billed monthly. Current pricing is $9/month. We reserve the right to change pricing with 30 days' notice.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by WayMaker.ai and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of all content you create using the Service (your DiRP entries). By using the Service, you grant us a license to store, display, and process your content solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WAYMAKER.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
            <p>
              You may terminate your account at any time by deleting it through your account settings. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which WayMaker.ai operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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

