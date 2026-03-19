import AdminLayout from "../components/AdminLayout";
import { FileText } from "lucide-react";

export default function AdminContent() {
  const fontStyle = { fontFamily: "var(--font-sans)" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Content</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Brand page & site content management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Homepage Hero", desc: "Hero text, CTA, background" },
          { title: "The House", desc: "Brand philosophy page content" },
          { title: "Stillness", desc: "Stillness editorial page" },
          { title: "Footer & Social", desc: "Footer links, social URLs, newsletter" },
          { title: "Contact Details", desc: "Contact page information" },
          { title: "SEO Metadata", desc: "Global meta titles & descriptions" },
        ].map((item) => (
          <div key={item.title} className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 hover:border-[hsl(220,10%,20%)] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={14} className="text-[hsl(220,10%,35%)]" />
              <h3 className="text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{item.title}</h3>
            </div>
            <p className="text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>{item.desc}</p>
            <span className="inline-block mt-3 text-[10px] tracking-[0.1em] uppercase text-[hsl(220,10%,30%)] border border-[hsl(220,10%,16%)] px-2 py-0.5" style={fontStyle}>
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
