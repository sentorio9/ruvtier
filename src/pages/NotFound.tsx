import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { usePageMeta } from "@/hooks/usePageMeta";

const NotFound = () => {
  usePageMeta({ title: "Page Not Found" });

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />

      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <span className="font-serif text-[clamp(64px,10vw,120px)] font-light text-foreground/10 leading-none select-none">
          404
        </span>
        <h1 className="font-serif text-[clamp(20px,2.5vw,32px)] font-light tracking-wider text-foreground mt-4 mb-4">
          This page does not exist
        </h1>
        <p className="font-sans text-[13px] text-muted-foreground tracking-wide max-w-[360px] leading-relaxed mb-10">
          The page you are looking for may have been moved or is no longer available.
        </p>
        <Link
          to="/"
          className="font-sans text-[11px] tracking-[0.18em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300"
        >
          Return to the House
        </Link>
      </section>
    </div>
  );
};

export default NotFound;
