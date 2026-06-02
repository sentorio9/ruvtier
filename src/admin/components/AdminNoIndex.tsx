import { useEffect } from "react";

export default function AdminNoIndex() {
  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousContent = existing?.getAttribute("content") ?? null;
    const previousElement = existing ?? document.createElement("meta");

    if (!existing) {
      previousElement.setAttribute("name", "robots");
      document.head.appendChild(previousElement);
    }

    previousElement.setAttribute("content", "noindex,nofollow,noarchive,nosnippet");

    return () => {
      if (previousContent) {
        previousElement.setAttribute("content", previousContent);
      } else if (!existing) {
        previousElement.remove();
      } else {
        previousElement.removeAttribute("content");
      }
    };
  }, []);

  return null;
}
