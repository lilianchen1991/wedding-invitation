"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { label: "仪表盘", href: "/admin", icon: "📊" },
  { label: "首页视频", href: "/admin/hero", icon: "🎬" },
  { label: "故事照片", href: "/admin/story", icon: "👶" },
  { label: "婚礼邀约", href: "/admin/invitation-video", icon: "🎥" },
  { label: "甜蜜瞬间", href: "/admin/gallery", icon: "📸" },
  { label: "婚礼照片", href: "/admin/wedding-photos", icon: "💒" },
  { label: "背景音乐", href: "/admin/music", icon: "🎵" },
  { label: "RSVP", href: "/admin/rsvp", icon: "💌" },
  { label: "祝福留言", href: "/admin/wishes", icon: "💝" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthed(false);
      return;
    }

    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-light text-sm">加载中...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-bg-alt flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-56 bg-white border-r border-border flex flex-col transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="font-serif text-lg text-primary">
            婚礼管理
          </Link>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? "text-accent bg-bg-alt"
                  : "text-text-light hover:text-primary hover:bg-bg"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="text-sm text-text-light hover:text-red-500 transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
