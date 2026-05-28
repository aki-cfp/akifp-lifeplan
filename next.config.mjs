/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完全クライアント計算・サーバーレス。静的サイトとして書き出す（next export 相当）。
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
