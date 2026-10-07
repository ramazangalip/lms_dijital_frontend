import { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/components/common/ServiceWorkerRegister';

const roboto = Roboto({ 
  subsets: ['latin'], 
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto' 
});

export const viewport: Viewport = {
  themeColor: '#ce1212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// --- GOOGLE, PWA VE SEO AYARLARI ---
export const metadata: Metadata = {
  title: {
    default: 'BÜ Dijital LMS | Yapay Zeka Destekli Dijital Sınıf',
    template: '%s | BÜ Dijital LMS'
  },
  description: 'Bingöl Üniversitesi Bilişim Teknolojileri yapay zeka destekli öğrenme yönetim sistemi. Akıllı test analizleri ve kişiselleştirilmiş eğitim.',
  keywords: ['yapay zeka', 'lms', 'eğitim', 'bingöl üniversitesi', 'akıllı sınıf', 'öğrenme yönetim sistemi', 'bü dijital lms'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BÜ Dijital LMS'
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: 'index, follow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${roboto.variable}`}>
      <body className="antialiased font-roboto" suppressHydrationWarning>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}