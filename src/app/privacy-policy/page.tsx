import type { Metadata } from 'next';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LEGAL_LAST_UPDATED } from '@/lib/legal';

const sections = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'We collect the information you provide when you create an account, update your profile, save recipes, or participate in community features. This may include your name, email address, profile details, and any content you choose to submit.',
      'We may also collect technical information needed to operate the service, such as authentication details, device or browser data, and basic usage information that helps us keep the experience secure and reliable.',
    ],
  },
  {
    title: 'How We Use Information',
    paragraphs: [
      'We use your information to create and manage your account, personalize your experience, display user-generated content, and provide the features of Sui at home.',
      'We may also use information to maintain security, prevent abuse, troubleshoot issues, improve the product, and communicate important updates about the service.',
    ],
  },
  {
    title: 'When Information Is Shared',
    paragraphs: [
      'We do not sell your personal information. We may share information with service providers that support hosting, authentication, analytics, or other core operations needed to run the app.',
      'Information may also be disclosed when required by law, to protect the rights and safety of users or the platform, or as part of a business transfer such as a merger or acquisition.',
    ],
  },
  {
    title: 'Cookies And Similar Technologies',
    paragraphs: [
      'We may use cookies or similar technologies to keep you signed in, remember preferences, understand feature usage, and improve site performance.',
      'You can usually manage cookie behavior through your browser settings, but some parts of the service may not function properly if certain cookies are disabled.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We retain personal information for as long as it is reasonably necessary to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements.',
      'If you request deletion of your account, we may remove or anonymize information unless we need to keep certain records for legal, security, or operational reasons.',
    ],
  },
  {
    title: 'Your Choices',
    paragraphs: [
      'You can review and update certain account details from within the product. You may also stop using the service at any time.',
      'Depending on your location, you may have additional rights related to access, correction, deletion, or objection to certain processing of your personal information.',
    ],
  },
  {
    title: 'Policy Updates',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will post the revised version here and update the last updated date shown on this page.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Privacy Policy | Sui at home',
  description: 'How Sui at home collects, uses, and protects information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-12">
      <Card>
        <CardHeader className="border-b-2 border-foreground bg-secondary">
          <CardTitle className="text-3xl md:text-4xl">Privacy Policy</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Last updated {LEGAL_LAST_UPDATED}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-muted-foreground md:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
