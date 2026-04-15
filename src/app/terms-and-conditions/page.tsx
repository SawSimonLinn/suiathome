import type { Metadata } from 'next';

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
    <div className="mx-auto w-full max-w-4xl py-12 px-4">
      <div className="border-2 border-foreground bg-paper paper-shadow relative overflow-hidden">

        {/* Sage green top ribbon */}
        <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
            🌿 &nbsp; Sui at Home &nbsp; 🌿
          </span>
        </div>

        {/* Tape strips */}
        <div className="absolute top-[2.6rem] left-5 w-14 h-4 border border-foreground/60 rotate-[-2deg]" style={{ backgroundColor: 'var(--lavender)', opacity: 0.8 }} aria-hidden="true" />
        <div className="absolute top-[2.6rem] right-7 w-12 h-4 border border-foreground/60 rotate-[1.5deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} aria-hidden="true" />

        <div className="p-6 md:p-10">
          {/* Flower row */}
          <div className="flex justify-center gap-2 mb-5" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((f, i) => (
              <span key={i} className="text-xl">{f}</span>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl md:text-4xl" style={{ color: '#2d4a2a' }}>Terms & Conditions</h1>
            <div className="flex justify-center mt-3">
              <svg width="140" height="10" viewBox="0 0 140 10" fill="none" aria-hidden="true">
                <path d="M2 6 Q12 2 22 6 Q32 10 42 6 Q52 2 62 6 Q72 10 82 6 Q92 2 102 6 Q112 10 122 6 Q130 3 138 6" stroke="var(--sage-dark)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-3">Last updated {LEGAL_LAST_UPDATED}</p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-2xl font-headline border-b-2 border-dashed border-foreground/30 pb-2">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-muted-foreground md:text-base">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>

        {/* Bottom floral strip */}
        <div className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
          <span>🌷</span><span>🌿</span><span>🫶</span><span>🌿</span><span>🌷</span>
        </div>
      </div>
    </div>
  );
}
