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

export function usePageMeta({ title, description }: PageMeta) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Title
    document.title = title === BASE_TITLE ? title : `${title} — ${BASE_TITLE}`;

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

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
  }, [title, description, pathname]);
}
