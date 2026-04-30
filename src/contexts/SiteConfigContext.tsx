"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Milestone {
  id: number;
  date: string;
  title: string;
  content: string;
  link: string | null;
  photo: string | null;
  sort_order: number;
}

export interface SiteConfig {
  groom_name: string | null;
  bride_name: string | null;
  wedding_date: string | null;
  rsvp_deadline: string | null;
  logo_image: string | null;
  logo_title: string | null;
  logo_desc: string | null;
  ceremony_datetime: string | null;
  ceremony_venue: string | null;
  ceremony_address: string | null;
  ceremony_note: string | null;
  venue_lat: string | null;
  venue_lng: string | null;
  venue_keyword: string | null;
  venue_city: string | null;
  milestones: Milestone[];
  bgm_title: string | null;
}

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig | null {
  return useContext(SiteConfigContext);
}
