import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMeta {
  title: string;
  description?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const BASE_TITLE = "RUVTIER";
const BASE_URL = "https://ruvtier.com";

export function usePageMeta({ title, description, ogType = "website", jsonLd }: PageMeta) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Title
    
    document.title = fullTitle;

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BASE_URL}${pathname}`);

    // OG title + description
    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}='${key}']`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr.split("=")[0].replace(/[\[\]'"]/g, ""), key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const fullTitle = title === BASE_TITLE ? title : `${title} — ${BASE_TITLE}`;
    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("property", "og:url", `${BASE_URL}${pathname}`);
    setMeta("property", "og:type", ogType);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    // Per-page JSON-LD (tagged so we can replace on route change)
    const existing = document.querySelectorAll("script[data-page-jsonld='true']");
    existing.forEach((n) => n.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-page-jsonld", "true");
        s.text = JSON.stringify(block);
        document.head.appendChild(s);
      });
    }
  }, [title, description, ogType, pathname, jsonLd]);
}
