import type { Metadata } from 'next';

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
    <div className="mx-auto w-full max-w-4xl py-12 px-4">
      <div className="border-2 border-foreground bg-paper paper-shadow relative overflow-hidden">

        {/* Sage green top ribbon */}
        <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
            🌿 &nbsp; Sui at Home &nbsp; 🌿
          </span>
        </div>

        {/* Tape strips */}
        <div className="absolute top-[2.6rem] left-5 w-14 h-4 border border-foreground/60 rotate-[-2deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} aria-hidden="true" />
        <div className="absolute top-[2.6rem] right-7 w-12 h-4 border border-foreground/60 rotate-[1.5deg]" style={{ backgroundColor: 'var(--blush)' }} aria-hidden="true" />

        <div className="p-6 md:p-10">
          {/* Flower row */}
          <div className="flex justify-center gap-2 mb-5" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((f, i) => (
              <span key={i} className="text-xl">{f}</span>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl md:text-4xl" style={{ color: '#2d4a2a' }}>Privacy Policy</h1>
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
