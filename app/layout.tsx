import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "あきFP ライフプラン診断",
  description:
    "家族構成・収入・支出・教育費・資産を入力すると、生涯の資産推移をモンテカルロ法で診断します。あきFP（CFP・IFA）提供のセルフ診断ツール。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          background: "#f1f5f9",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
