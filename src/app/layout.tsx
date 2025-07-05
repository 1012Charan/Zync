import './globals.css';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Zync',
  description: 'Zync it. Gone in seconds. Share notes, links, code, or files. No sign-up. No fluff. Just Zync.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* NOTE: For production, move custom font links to a custom _document.js for best performance. See Next.js docs. */}
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;700&display=swap"
        />
      </head>
      <body className="bg-white dark:bg-[#131118] text-[#171717] dark:text-[#ededed] min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
