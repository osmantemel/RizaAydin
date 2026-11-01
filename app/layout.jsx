import '../styles/globals.css';
import { siteOrigin } from '../lib/seo.mjs';
const origin = siteOrigin();
export const metadata = {
  ...(origin ? { metadataBase: new URL(origin) } : {}),
  applicationName: 'Rıza Aydın Dekorasyon',
  title: { default: 'Rıza Aydın Dekorasyon', template: '%s' },
  description: 'İstanbul ve Kocaeli’de fayans, boya ve tadilat.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    siteName: 'Rıza Aydın Dekorasyon',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/social-card.png',
        width: 1200,
        height: 630,
        alt: 'Rıza Aydın Dekorasyon · İstanbul ve Kocaeli',
      },
    ],
  },
  twitter: { card: 'summary_large_image', images: ['/social-card.png'] },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: { index: process.env.INDEXABLE === 'true', follow: process.env.INDEXABLE === 'true' },
};
export const viewport = { themeColor: '#203b31' };
export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
