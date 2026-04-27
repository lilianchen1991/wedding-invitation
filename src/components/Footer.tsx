import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-primary text-white/70 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="font-serif text-2xl text-white mb-2">李连宸 & 韩丹</p>
        <p className="text-sm mb-6">2026.06.05</p>
        <div className="h-px w-16 bg-white/20 mx-auto mb-6" />
        <p className="text-xs mb-2">
          期待与您共同见证这美好的时刻
        </p>
        <p className="text-xs text-white/40 mb-8">
          BGM：Keep Me - Novo Amor
        </p>

        <div className="text-xs text-white/40 flex items-center justify-center gap-3">
          <Link
            href="/changelog"
            className="hover:text-white/70 transition-colors"
          >
            更新日志
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/admin"
            className="hover:text-white/70 transition-colors"
          >
            管理后台
          </Link>
        </div>
      </div>
    </footer>
  );
}
