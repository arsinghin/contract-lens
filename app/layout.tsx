import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LexLens — Understand What Your Legal Document Actually Says',
  description: 'Evidence-backed legal document understanding, clause extraction, obligations, findings, grounded Q&A, and document comparison.',
  authors: [{ name: 'Alok Ranjan Singh', url: 'https://github.com/arsinghin/' }],
  creator: 'Alok Ranjan Singh',
  openGraph: {
    title: 'LexLens — Legal Document Intelligence',
    description: 'Evidence-backed legal document understanding, clause extraction, obligations, findings, grounded Q&A, and document comparison.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexLens — Legal Document Intelligence',
    description: 'Evidence-backed legal document understanding, clause extraction, obligations, findings, grounded Q&A, and document comparison.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
