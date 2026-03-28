import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  src: string;
  type?: string;
  className?: string;
}

const LazyVideo = ({ src, type = "video/mp4", className }: LazyVideoProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {load && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover"
        >
          {src.endsWith('.mov') && (
            <source src={src.replace('.mov', '.mp4')} type="video/mp4" />
          )}
          <source src={src} type={type} />
        </video>
      )}
    </div>
  );
};

export default LazyVideo;
