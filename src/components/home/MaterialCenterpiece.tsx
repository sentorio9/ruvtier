/**
 * MaterialCenterpiece — contained two-column "Material is memory" block.
 *
 * Image left (~50%), text right (~50%), both inside the standard
 * .luxury-container frame. No full-bleed; the canvas always shows
 * around it. Image crossfades through up to three slots on a slow loop.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { Editable } from "@/editor/Editable";
import { useSiteText, useSiteImage } from "@/editor/useSiteContent";
import {
  HOME_MATERIAL_MEMORY_BODY,
  HOME_MATERIAL_MEMORY_CTA,
  HOME_MATERIAL_MEMORY_EYEBROW,
  HOME_MATERIAL_MEMORY_FIBRES,
  HOME_MATERIAL_MEMORY_HEADLINE,
  HOME_MATERIAL_MEMORY_ORIGIN_TAG,
} from "@/content/brand";
import materialMemoryScarfAsset from "@/assets/material-memory-scarf.png.asset.json";

const fallbackMacro = materialMemoryScarfAsset.url;

const MaterialCenterpiece = () => {
  const eyebrow = useSiteText("home_material_memory", "eyebrow", HOME_MATERIAL_MEMORY_EYEBROW);
  const headline = useSiteText("home_material_memory", "headline", HOME_MATERIAL_MEMORY_HEADLINE);
  const body = useSiteText("home_material_memory", "body", HOME_MATERIAL_MEMORY_BODY);
  const fibres = useSiteText("home_material_memory", "fibres", HOME_MATERIAL_MEMORY_FIBRES);
  const cta = useSiteText("home_material_memory", "cta_label", HOME_MATERIAL_MEMORY_CTA);
  const originTag = useSiteText("home_material_memory", "origin_tag", HOME_MATERIAL_MEMORY_ORIGIN_TAG);

  const macro1 = useSiteImage("site_image_home_material_macro_1") || fallbackMacro;
  const macro2 = useSiteImage("site_image_home_material_macro_2");
  const macro3 = useSiteImage("site_image_home_material_macro_3");
  const frames = [macro1, macro2, macro3].filter(Boolean) as string[];

  const [active, setActive] = useState(0);
  useEffect(() => {
    if (frames.length < 2) return;
    const id = window.setInterval(() => setActive((n) => (n + 1) % frames.length), 6000);
    return () => window.clearInterval(id);
  }, [frames.length]);

  return (
    <section className="bg-background section-pad-md">
      <div className="luxury-container w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(24px,4vw,56px)] items-center">
          {/* Image — contained left */}
          <ScrollFadeIn>
            <div className="relative w-full aspect-[4/5] max-h-[520px] overflow-hidden bg-secondary">
              {frames.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={i === 0 ? "RUVTIER fabric macro — material as house IP" : ""}
                  aria-hidden={i !== 0}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute left-[clamp(12px,1.5vw,20px)] bottom-[clamp(12px,1.5vw,20px)]">
                <Editable
                  kind="text_block"
                  contentKey="home_material_memory"
                  field="origin_tag"
                  label="Material — origin / traceability tag"
                  as="span"
                  className="inline-block type-eyebrow tracking-luxury-wide text-foreground bg-background/95 px-3 py-1.5 border border-border uppercase"
                >
                  {originTag}
                </Editable>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Copy — right */}
          <ScrollFadeIn delay={0.1}>
            <div className="flex flex-col">
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="eyebrow"
                label="'Material is Memory' eyebrow"
                as="p"
                className="type-eyebrow tracking-luxury-wide text-muted-foreground uppercase mb-4 md:mb-5"
              >
                {eyebrow}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="headline"
                label="'Material is Memory' heading"
                as="h2"
                className="type-display mb-6 md:mb-7"
              >
                {headline}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="body"
                label="'Material is Memory' body"
                as="p"
                className="type-body max-w-[480px] mb-6 md:mb-7 text-foreground/80"
              >
                {body}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="fibres"
                label="'Material is Memory' fibres list"
                as="p"
                className="type-eyebrow tracking-luxury-wide text-muted-foreground mb-8 md:mb-10 uppercase"
              >
                {fibres}
              </Editable>
              <Link to="/materials" className="group inline-flex items-center type-cta tracking-luxury-wide w-fit">
                <span className="relative inline-block pb-1 uppercase">
                  <Editable
                    kind="text_block"
                    contentKey="home_material_memory"
                    field="cta_label"
                    label="'Material is Memory' CTA"
                    as="span"
                  >
                    {cta}
                  </Editable>
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                </span>
                <span aria-hidden className="ml-2">→</span>
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

export default MaterialCenterpiece;
