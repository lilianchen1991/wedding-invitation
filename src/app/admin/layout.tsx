"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV: { label: string; href?: string; icon?: string; children?: { label: string; href: string; icon: string }[] }[] = [
  {
    label: "数据查看",
    children: [
      { label: "仪表盘", href: "/admin", icon: "📊" },
    ],
  },
  {
    label: "页面配置",
    children: [
      { label: "婚礼信息", href: "/admin/wedding-info", icon: "💍" },
      { label: "Logo 配置", href: "/admin/site-config", icon: "🎨" },
      { label: "背景音乐", href: "/admin/music", icon: "🎵" },
      { label: "首页视频", href: "/admin/hero", icon: "🎬" },
      { label: "故事时间轴", href: "/admin/milestones", icon: "📖" },
      { label: "婚礼邀约", href: "/admin/invitation-video", icon: "🎥" },
      { label: "甜蜜瞬间", href: "/admin/gallery", icon: "📸" },
      { label: "婚礼照片", href: "/admin/wedding-photos", icon: "💒" },
      { label: "收款码配置", href: "/admin/qrcode", icon: "🧧" },
    ],
  },
  {
    label: "收集信息",
    children: [
      { label: "RSVP", href: "/admin/rsvp", icon: "💌" },
      { label: "祝福留言", href: "/admin/wishes", icon: "💝" },
      { label: "地图点亮", href: "/admin/map", icon: "🗺️" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === "/admin/login" || pathname === "/admin/guide";

  useEffect(() => {
    if (isPublicPage) {
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
  }, [pathname, router, isPublicPage]);

  useEffect(() => {
    document.title = "婚礼请柬后台";
  });

  if (isPublicPage) {
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

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (pwForm.new !== pwForm.confirm) {
      setPwError("两次密码不一致");
      return;
    }
    if (pwForm.new.length < 4) {
      setPwError("新密码至少 4 位");
      return;
    }
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new }),
    });
    if (res.ok) {
      setPwSuccess(true);
      setPwForm({ old: "", new: "", confirm: "" });
      setTimeout(() => { setShowPwModal(false); setPwSuccess(false); }, 1500);
    } else {
      const data = await res.json();
      setPwError(data.error || "修改失败");
    }
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

        <nav className="flex-1 py-3 overflow-y-auto">
          <Link
            href="/"
            target="_blank"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-light hover:text-primary hover:bg-bg transition-colors"
          >
            <span>🏠</span>
            返回前台
          </Link>
          {NAV.map((item) =>
            item.href ? (
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
            ) : (
              <div key={item.label}>
                <p className="px-5 pt-5 pb-1.5 text-[11px] tracking-widest text-text-light/60 uppercase">
                  {item.label}
                </p>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                      pathname === child.href
                        ? "text-accent bg-bg-alt"
                        : "text-text-light hover:text-primary hover:bg-bg"
                    }`}
                  >
                    <span>{child.icon}</span>
                    {child.label}
                  </Link>
                ))}
              </div>
            )
          )}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowPwModal(true); setPwError(""); setPwSuccess(false); }}
              className="text-sm text-text-light hover:text-accent transition-colors"
            >
              修改密码
            </button>
            <span className="text-border">|</span>
            <button
              onClick={handleLogout}
              className="text-sm text-text-light hover:text-red-500 transition-colors"
            >
              退出登录
            </button>
            <Link
              href="/admin/guide"
              className="ml-auto w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs text-text-light hover:text-accent hover:border-accent transition-colors"
              title="使用说明"
            >
              ?
            </Link>
          </div>
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

      {showPwModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShowPwModal(false)}>
          <div className="bg-white w-80 p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-primary mb-4">修改密码</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="当前密码"
                value={pwForm.old}
                onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
                className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="password"
                placeholder="新密码（至少 4 位）"
                value={pwForm.new}
                onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="password"
                placeholder="确认新密码"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-accent"
              />
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSuccess && <p className="text-xs text-green-600">密码修改成功</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-white py-2 text-sm hover:bg-accent/90 transition-colors"
                >
                  确认修改
                </button>
                <button
                  type="button"
                  onClick={() => setShowPwModal(false)}
                  className="flex-1 border border-border py-2 text-sm text-text-light hover:text-primary transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
