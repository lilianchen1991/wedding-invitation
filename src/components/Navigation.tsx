"use client";

import { useState, useEffect } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const ALL_navItems = [
  { label: "首页", href: "#hero" },
  { label: "我们的故事", href: "#story" },
  { label: "相册", href: "#gallery" },
  { label: "婚礼照片", href: "#wedding-photos" },
  { label: "婚礼详情", href: "#details" },
  { label: "RSVP", href: "#rsvp" },
  { label: "祝福", href: "#guestbook" },
  { label: "关于Logo", href: "#about-logo" },
];

export default function Navigation() {
  const config = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoImage = config?.logo_image || null;

  const hiddenSections = new Set<string>();
  if (config) {
    if (!config.milestones || config.milestones.length === 0) hiddenSections.add("#story");
    if (!config.logo_image && !config.logo_title && !config.logo_desc) hiddenSections.add("#about-logo");
  }
  const navItems = ALL_navItems.filter((item) => !hiddenSections.has(item.href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#hero"
          className={`transition-colors ${
            scrolled ? "text-primary" : "text-white"
          }`}
        >
          {logoImage && (
            <img
              src={logoImage}
              alt="Logo"
              className={`h-9 object-contain transition-all duration-300 ${
                scrolled ? "" : "brightness-0 invert"
              }`}
            />
          )}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide transition-colors hover:text-accent ${
                scrolled ? "text-text-light" : "text-white/80"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 transition-colors ${
            scrolled ? "text-primary" : "text-white"
          }`}
          aria-label="菜单"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-border">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-text-light text-sm tracking-wide hover:text-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
