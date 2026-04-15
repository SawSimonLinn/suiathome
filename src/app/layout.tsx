import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { getAuthContext } from '@/lib/supabase/auth';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Sui at home',
  description: 'Delicious recipes for the home cook.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;
  let isAdmin = false;
  const supabaseReady = hasSupabaseEnv();

  if (supabaseReady) {
    const authContext = await getAuthContext();
    userEmail = authContext.userEmail;
    isAdmin = authContext.isAdmin;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        {/* Global background wallpaper — tiling pattern, works at any screen size */}
        <div className="pointer-events-none select-none fixed inset-0 z-0" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* ── icon shapes ── */}
              <g id="ic-house">
                <polygon points="20,2 38,17 35,17 35,36 5,36 5,17 2,17" fill="#6a9165"/>
                <rect x="13" y="24" width="9" height="12" fill="#fdf4e7"/>
                <rect x="24" y="19" width="7" height="7" fill="#fdf4e7"/>
              </g>
              <g id="ic-cup">
                <path d="M4 10 h24 l-2 14 H6 Z" fill="#f2b8c6" stroke="#6a9165" strokeWidth="1.5"/>
                <path d="M28 12 Q37 12 37 18 Q37 24 28 22" stroke="#6a9165" strokeWidth="1.5" fill="none"/>
                <path d="M6 10 Q8 4 16 4 Q24 4 26 10" stroke="#6a9165" strokeWidth="1.5" fill="none"/>
              </g>
              <g id="ic-flower">
                <circle cx="18" cy="18" r="5" fill="#d4a853"/>
                <ellipse cx="18" cy="7"  rx="3.5" ry="6" fill="#f2b8c6"/>
                <ellipse cx="18" cy="29" rx="3.5" ry="6" fill="#f2b8c6"/>
                <ellipse cx="7"  cy="18" rx="6" ry="3.5" fill="#d4e6d1"/>
                <ellipse cx="29" cy="18" rx="6" ry="3.5" fill="#d4e6d1"/>
                <ellipse cx="11" cy="11" rx="3.5" ry="6" transform="rotate(45 11 11)"  fill="#c9b8d8"/>
                <ellipse cx="25" cy="25" rx="3.5" ry="6" transform="rotate(45 25 25)"  fill="#c9b8d8"/>
                <ellipse cx="25" cy="11" rx="3.5" ry="6" transform="rotate(-45 25 11)" fill="#c9b8d8"/>
                <ellipse cx="11" cy="25" rx="3.5" ry="6" transform="rotate(-45 11 25)" fill="#c9b8d8"/>
              </g>
              <g id="ic-pot">
                <ellipse cx="19" cy="13" rx="13" ry="4" fill="#a8c1a0" stroke="#6a9165" strokeWidth="1.5"/>
                <path d="M6 13 Q4 28 19 30 Q34 28 32 13" fill="#d4e6d1" stroke="#6a9165" strokeWidth="1.5"/>
                <rect x="1"  y="10" width="5" height="5" rx="2" fill="#6a9165"/>
                <rect x="32" y="10" width="5" height="5" rx="2" fill="#6a9165"/>
                <path d="M13 5 Q19 2 25 5" stroke="#6a9165" strokeWidth="1.5" fill="none"/>
              </g>
              <g id="ic-pin">
                <rect x="5" y="14" width="30" height="7" rx="3.5" fill="#a8c1a0" stroke="#6a9165" strokeWidth="1.5"/>
                <rect x="0"  y="12" width="7" height="11" rx="2.5" fill="#d4a853" stroke="#6a9165" strokeWidth="1"/>
                <rect x="33" y="12" width="7" height="11" rx="2.5" fill="#d4a853" stroke="#6a9165" strokeWidth="1"/>
              </g>
              <g id="ic-jar">
                <rect x="9" y="3" width="14" height="5" rx="1" fill="#a8c1a0" stroke="#6a9165" strokeWidth="1.5"/>
                <path d="M7 8 Q4 10 4 14 L5 27 Q5 29 16 29 Q27 29 27 27 L28 14 Q28 10 25 8 Z" fill="#fdf4e7" stroke="#6a9165" strokeWidth="1.5"/>
                <path d="M7 16 Q16 20 25 16" stroke="#a8c1a0" strokeWidth="1.2" fill="none"/>
              </g>
              <g id="ic-fsm">
                <circle cx="12" cy="12" r="3.5" fill="#d4a853"/>
                <ellipse cx="12" cy="5"  rx="2.5" ry="4" fill="#fce8ef"/>
                <ellipse cx="12" cy="19" rx="2.5" ry="4" fill="#fce8ef"/>
                <ellipse cx="5"  cy="12" rx="4" ry="2.5" fill="#d4e6d1"/>
                <ellipse cx="19" cy="12" rx="4" ry="2.5" fill="#d4e6d1"/>
              </g>

              {/* ── one tile: 7 icons in a 300×120 cell, staggered rows ── */}
              <pattern id="bg-tile" x="0" y="0" width="480" height="200" patternUnits="userSpaceOnUse">
                {/* row A — 6 icons spread across 480px */}
                <g transform="translate(10,15)  rotate(-7,20,20)"  opacity="0.08"><use href="#ic-house"/></g>
                <g transform="translate(95,10)  rotate(5,20,15)"   opacity="0.07"><use href="#ic-cup"/></g>
                <g transform="translate(180,14) rotate(-5,18,18)"  opacity="0.06"><use href="#ic-flower"/></g>
                <g transform="translate(268,12) rotate(8,19,18)"   opacity="0.07"><use href="#ic-pot"/></g>
                <g transform="translate(350,16) rotate(-6,20,18)"  opacity="0.06"><use href="#ic-pin"/></g>
                <g transform="translate(432,11) rotate(9,12,12)"   opacity="0.07"><use href="#ic-fsm"/></g>
                {/* row B — shifted half a tile width so icons sit in the gaps of row A */}
                <g transform="translate(-5,112)  rotate(6,20,18)"  opacity="0.07"><use href="#ic-jar"/></g>
                <g transform="translate(52,108)  rotate(-8,20,20)" opacity="0.06"><use href="#ic-house"/></g>
                <g transform="translate(135,114) rotate(5,18,18)"  opacity="0.07"><use href="#ic-flower"/></g>
                <g transform="translate(220,110) rotate(-7,20,18)" opacity="0.06"><use href="#ic-cup"/></g>
                <g transform="translate(305,113) rotate(6,19,18)"  opacity="0.07"><use href="#ic-pot"/></g>
                <g transform="translate(390,109) rotate(-5,20,18)" opacity="0.06"><use href="#ic-pin"/></g>
              </pattern>
            </defs>

            {/* fill the entire viewport with the repeating tile */}
            <rect width="100%" height="100%" fill="url(#bg-tile)"/>
          </svg>
        </div>

        <div className="relative flex min-h-screen flex-col">
          <Header userEmail={userEmail} isAdmin={isAdmin} />
          <main className="flex-1 container mx-auto px-4 md:px-8">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
