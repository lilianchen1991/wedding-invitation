import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "李连宸 & 韩丹 | 婚礼邀请",
  description: "我们诚挚地邀请您参加我们的婚礼 — 2026年6月5日",
  openGraph: {
    title: "李连宸 & 韩丹 | 婚礼邀请",
    description: "我们诚挚地邀请您参加我们的婚礼 — 2026年6月5日",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if('scrollRestoration' in history) history.scrollRestoration='manual';window.addEventListener('beforeunload',function(){window.scrollTo(0,0)});window.addEventListener('pagehide',function(){window.scrollTo(0,0)});window.addEventListener('pageshow',function(){window.scrollTo(0,0)});setTimeout(function(){window.scrollTo(0,0)},0);` }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
