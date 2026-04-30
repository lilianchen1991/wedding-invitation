import type { Metadata } from "next";
import "./globals.css";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const db = getDb();
  const rows = db
    .prepare("SELECT key, value FROM settings WHERE key IN ('groom_name', 'bride_name', 'wedding_date')")
    .all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  const groom = settings.groom_name || "新郎";
  const bride = settings.bride_name || "新娘";
  const date = settings.wedding_date || "";
  const title = `${groom} & ${bride} | 婚礼邀请`;
  const description = date
    ? `我们诚挚地邀请您参加我们的婚礼 — ${date}`
    : `我们诚挚地邀请您参加我们的婚礼`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if('scrollRestoration' in history) history.scrollRestoration='manual';window.addEventListener('beforeunload',function(){window.scrollTo(0,0)});window.addEventListener('pagehide',function(){window.scrollTo(0,0)});window.addEventListener('pageshow',function(){window.scrollTo(0,0)});setTimeout(function(){window.scrollTo(0,0)},0);(function(){var ua=navigator.userAgent;if(/MicroMessenger/i.test(ua)&&/iPhone|iPad|iPod/i.test(ua)){document.documentElement.classList.add('wechat-ios')}})();` }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
