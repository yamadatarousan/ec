import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/features';
import { PWAPrompt } from '@/components/features/PWAPrompt';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary, ToastProvider } from '@/components/ui';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECストア - オンラインショッピング',
  description:
    'Amazon風のモダンなECサイト。商品検索、カート機能、注文管理など充実した機能を提供します。',
  keywords: [
    'ECサイト',
    'オンラインショッピング',
    'Amazon風',
    'PWA',
    'モバイル対応',
  ],
  authors: [{ name: 'ECストア運営チーム' }],
  creator: 'ECストア',
  publisher: 'ECストア',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ECストア - オンラインショッピング',
    description:
      'Amazon風のモダンなECサイト。商品検索、カート機能、注文管理など充実した機能を提供します。',
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName: 'ECストア',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECストア - オンラインショッピング',
    description:
      'Amazon風のモダンなECサイト。商品検索、カート機能、注文管理など充実した機能を提供します。',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ECストア',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体の共通レイアウトを定義
 * ヘッダー、メインコンテンツ、フッターで構成
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <PWAPrompt />
                </div>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
