import { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Content Security Policy (CSP)
    // より厳格にする場合は 'unsafe-eval' 'unsafe-inline' を削除し、nonceやhashを使用します。
    // 今回の課題では開発のしやすさを考慮し、緩めの設定にしています。
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self';",
  },
];

const nextConfig: NextConfig = {
  // headersメソッドを使ってカスタムヘッダを追加
  async headers() {
    return [
      {
        // すべてのパスに適用
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;