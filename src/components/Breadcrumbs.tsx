import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.to && !last ? (
                <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
              ) : (
                <span className={last ? "text-foreground/80" : ""}>{c.label}</span>
              )}
              {!last && <span aria-hidden className="text-muted-foreground/50">·</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
