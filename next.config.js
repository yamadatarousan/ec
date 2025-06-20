const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24時間
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    path: '/_next/image',
    disableStaticImages: false,
    unoptimized: false,
  },
  // バンドル最適化
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // バンドル分析を有効化（環境変数で制御）
    if (process.env.ANALYZE === 'true' && !dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analyzer-report.html',
        })
      );
    }

    // 本番環境でのバンドル最適化
    if (!dev && !isServer) {
      // チャンク分割の詳細設定
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // React/Next.js専用チャンク
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
          },
          // UIライブラリ専用チャンク
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|clsx|tailwind-merge)[\\/]/,
            name: 'ui',
            priority: 8,
            chunks: 'all',
          },
          // 共通コンポーネント
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };

      // Tree shaking の最適化
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // 重複除去プラグイン
      config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    }

    // 開発環境での最適化
    if (dev) {
      // Hot Module Replacement の最適化
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
      };
    }

    // SVGファイルの最適化
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // SWCでのimport最適化は外部設定で対応済み

    return config;
  },
  // 静的ファイルの最適化
  compress: true,
  // 本番環境でのパフォーマンス最適化
  // swcMinify: true, // Next.js 15では削除済み
  
  // 出力設定（本番環境最適化）
  // output: 'standalone', // 一時的に無効化
  
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['lucide-react'],
    optimizeCss: false, // crittersエラーを回避
  },
  
  // 静的ページ生成タイムアウト
  staticPageGenerationTimeout: 300,
  
  // セキュリティ設定
  poweredByHeader: false,

  // セキュリティとPWA対応のためのヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
