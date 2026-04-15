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
    title: 'Using The Service',
    paragraphs: [
      'By accessing or using Sui at home, you agree to use the service lawfully and responsibly. You must only use the platform in ways that comply with applicable laws and these Terms & Conditions.',
      'You are responsible for ensuring that anyone using your account or device also follows these terms.',
    ],
  },
  {
    title: 'Accounts And Security',
    paragraphs: [
      'You may need an account to access some features. You are responsible for keeping your login credentials secure and for any activity that happens under your account.',
      'If you believe your account has been accessed without permission, you should act promptly to secure it and notify the platform operator if needed.',
    ],
  },
  {
    title: 'Content And Community Conduct',
    paragraphs: [
      'You may not use the service to post unlawful, abusive, infringing, misleading, or harmful content. Content you submit should respect the rights, privacy, and safety of others.',
      'We may remove content or restrict access to accounts that violate these terms or create risk for the community or platform.',
    ],
  },
  {
    title: 'Ownership And License',
    paragraphs: [
      'Sui at home and its original design, branding, and platform content are protected by applicable intellectual property laws. Except where stated otherwise, all rights remain with their respective owners.',
      'You retain ownership of content you submit, but you grant the service a limited license to host, display, reproduce, and use that content as needed to operate and improve the platform.',
    ],
  },
  {
    title: 'Availability And Changes',
    paragraphs: [
      'We may update, suspend, or discontinue any part of the service at any time. We do not guarantee that the platform will always be available, uninterrupted, or free from errors.',
      'We may also revise these Terms & Conditions from time to time by posting an updated version on this page.',
    ],
  },
  {
    title: 'Disclaimers',
    paragraphs: [
      'The service is provided on an as-is and as-available basis to the fullest extent permitted by law. We make no warranties or guarantees regarding the accuracy, reliability, or suitability of the service for any particular purpose.',
    ],
  },
  {
    title: 'Limitation Of Liability',
    paragraphs: [
      'To the fullest extent permitted by law, Sui at home and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.',
      'Where liability cannot be excluded, it will be limited to the minimum extent permitted by applicable law.',
    ],
  },
  {
    title: 'Termination',
    paragraphs: [
      'We may suspend or terminate access to the service if we reasonably believe these terms have been violated, if the platform is being misused, or if continued access creates legal or security risk.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sui at home',
  description: 'Terms that govern use of Sui at home.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-12">
      <Card>
        <CardHeader className="border-b-2 border-foreground bg-secondary">
          <CardTitle className="text-3xl md:text-4xl">
            Terms & Conditions
          </CardTitle>
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
