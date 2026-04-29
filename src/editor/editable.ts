/**
 * Lightweight in-page editor runtime.
 *
 * When the public site is opened inside the admin Website Editor iframe with
 * `?edit=1`, this module:
 *   - Registers a session flag so all subsequent navigations stay in edit mode.
 *   - Draws a hover outline on any element with `data-editable`.
 *   - Intercepts clicks on those elements and posts a message to the parent
 *     window describing what was clicked, so the admin can open the right
 *     side-panel form. Clicks on non-editable elements navigate normally.
 *   - Suppresses default link/button behaviour ONLY when an editable is hit.
 *
 * Everything is a no-op outside of edit mode, so there is zero cost on the
 * live site for normal visitors.
 */

const EDIT_FLAG_KEY = "ruvtier_edit_mode";
const PARENT_ORIGIN_KEY = "ruvtier_edit_parent_origin";

export type EditableKind =
  | "site_image"     // image stored in site_content (section: site_images)
  | "text_block"    // text stored in site_content (key + field)
  | "product_card"  // a product tile linking to a product
  | "page_meta"     // SEO title / description for the current route
  | "footer_link";

export interface EditableTarget {
  kind: EditableKind;
  /** content_key in site_content (for site_image / text_block) */
  key?: string;
  /** field name inside content_value JSON (for text_block) */
  field?: string;
  /** human label shown in the side panel header */
  label?: string;
  /** optional product id for product_card */
  productId?: string;
  /** Path of the page where the click happened (so admin can stay on it) */
  path: string;
  /** Bounding rect for highlight feedback */
  rect: { x: number; y: number; width: number; height: number };
}

export function isEditMode(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(EDIT_FLAG_KEY) === "1") return true;
  const params = new URLSearchParams(window.location.search);
  return params.get("edit") === "1";
}

let initialised = false;

export function initEditableRuntime() {
  if (initialised || typeof window === "undefined") return;
  if (!isEditMode()) return;

  // Persist edit mode for subsequent navigations within the iframe
  sessionStorage.setItem(EDIT_FLAG_KEY, "1");

  // Capture the parent origin once so we only ever postMessage back to admin
  const fromHandshake = new URLSearchParams(window.location.search).get("editorOrigin");
  if (fromHandshake) {
    sessionStorage.setItem(PARENT_ORIGIN_KEY, fromHandshake);
  }

  initialised = true;

  // Inject minimal CSS for hover outline + edit chrome
  const style = document.createElement("style");
  style.id = "ruvtier-editable-runtime-css";
  style.textContent = `
    [data-editable]:not([data-editable-disabled]) {
      outline-offset: 2px;
      transition: outline-color 120ms ease;
      cursor: pointer !important;
    }
    [data-editable]:not([data-editable-disabled]):hover {
      outline: 1px dashed hsl(45 70% 60% / 0.9);
    }
    .ruvtier-edit-banner {
      position: fixed; top: 0; left: 0; right: 0;
      z-index: 2147483647;
      background: hsl(220 15% 8%);
      color: hsl(45 50% 75%);
      font-family: var(--font-sans, system-ui);
      font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
      padding: 6px 12px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid hsl(220 10% 16%);
      pointer-events: none;
    }
    body.ruvtier-edit-mode { padding-top: 28px !important; }
    .ruvtier-edit-pulse {
      animation: ruvtier-edit-pulse 600ms ease;
    }
    @keyframes ruvtier-edit-pulse {
      0%   { outline: 2px solid hsl(45 70% 60% / 0.9); }
      100% { outline: 1px dashed transparent; }
    }
  `;
  document.head.appendChild(style);

  document.body.classList.add("ruvtier-edit-mode");
  const banner = document.createElement("div");
  banner.className = "ruvtier-edit-banner";
  banner.textContent = "Editor Mode — click any highlighted element to edit";
  document.body.appendChild(banner);

  // Click interception
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const editable = target.closest<HTMLElement>("[data-editable]");
      if (!editable) return;
      if (editable.dataset.editableDisabled === "1") return;

      e.preventDefault();
      e.stopPropagation();

      const rect = editable.getBoundingClientRect();
      const payload: EditableTarget = {
        kind: (editable.dataset.editableKind as EditableKind) || "text_block",
        key: editable.dataset.editableKey || undefined,
        field: editable.dataset.editableField || undefined,
        label: editable.dataset.editableLabel || editable.dataset.editableKey || "Untitled",
        productId: editable.dataset.editableProductId || undefined,
        path: window.location.pathname + window.location.search,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };

      // Visual feedback
      editable.classList.add("ruvtier-edit-pulse");
      setTimeout(() => editable.classList.remove("ruvtier-edit-pulse"), 700);

      // Notify parent
      const parentOrigin = sessionStorage.getItem(PARENT_ORIGIN_KEY) || "*";
      window.parent?.postMessage({ type: "ruvtier:edit:select", payload }, parentOrigin);
    },
    true // capture phase so we beat React onClick handlers
  );

  // Listen for messages from parent (e.g. force a navigation)
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "ruvtier:edit:navigate" && typeof data.path === "string") {
      const url = new URL(data.path, window.location.origin);
      url.searchParams.set("edit", "1");
      window.location.href = url.toString();
    }
    if (data.type === "ruvtier:edit:reload") {
      window.location.reload();
    }
  });

  // Announce ready so the parent can start listening
  const parentOrigin = sessionStorage.getItem(PARENT_ORIGIN_KEY) || "*";
  window.parent?.postMessage(
    { type: "ruvtier:edit:ready", path: window.location.pathname },
    parentOrigin
  );
}
