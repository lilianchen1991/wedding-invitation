"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((data) => { if (data.isDefault) setIsDefault(true); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 relative">
      <div className="absolute top-5 right-5 flex items-center gap-3">
        <a href="/" className="text-xs text-text-light hover:text-accent transition-colors">返回前台</a>
        <a href="/changelog" className="text-xs text-text-light hover:text-accent transition-colors">更新日志</a>
        <a
          href="/admin/guide"
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-light hover:text-accent hover:border-accent transition-colors text-xs"
          title="使用说明"
        >
          ?
        </a>
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-primary mb-2">后台管理</h1>
          <p className="text-sm text-text-light">请输入管理密码</p>
        </div>

        {isDefault && (
          <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-700 text-sm">
            当前后台密码是默认密码 admin，请登录后及时修改！
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="管理密码"
            autoFocus
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
