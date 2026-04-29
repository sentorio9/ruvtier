import { ReactNode, ElementType, CSSProperties } from "react";
import { isEditMode, EditableKind } from "./editable";

interface EditableProps {
  /** What kind of content this is — drives the side panel form */
  kind: EditableKind;
  /** content_key in site_content (or any stable identifier) */
  contentKey?: string;
  /** field name inside content_value (for text blocks with multiple fields) */
  field?: string;
  /** Human readable label shown in the editor */
  label?: string;
  /** Product id for product cards */
  productId?: string;
  /** HTML element to render as. Defaults to span. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Force-disable editing for this instance */
  disabled?: boolean;
}

/**
 * Marks a region of the page as editable. Outside of editor mode this is
 * a transparent passthrough — it just renders its children inside the
 * requested element. Inside editor mode the runtime in `editable.ts` reads
 * the data attributes to render the hover outline and forward clicks
 * to the admin side panel.
 *
 * Usage examples:
 *   <Editable kind="text_block" contentKey="contact_details" field="email" label="Contact email">
 *     {data.email}
 *   </Editable>
 *
 *   <Editable kind="site_image" contentKey="site_image_home_hero" label="Homepage hero" as="div" className="...">
 *     <img src={url} ... />
 *   </Editable>
 */
export function Editable({
  kind,
  contentKey,
  field,
  label,
  productId,
  as,
  className,
  style,
  children,
  disabled,
}: EditableProps) {
  const Tag = (as || "span") as ElementType;
  // Always render with the data attributes so server-rendered output is stable;
  // the runtime simply ignores them when not in edit mode.
  const editing = typeof window !== "undefined" && isEditMode();
  return (
    <Tag
      data-editable=""
      data-editable-kind={kind}
      data-editable-key={contentKey}
      data-editable-field={field}
      data-editable-label={label}
      data-editable-product-id={productId}
      data-editable-disabled={disabled || !editing ? undefined : undefined}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
