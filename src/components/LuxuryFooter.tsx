import { useState } from "react";
import ScrollFadeIn from "./ScrollFadeIn";

const footerLinks = [
  "The House",
  "Craft Career",
  "Private Appointments",
  "Find a Boutique",
  "Explore Online Boutique",
  "Contact",
];

const LuxuryFooter = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="luxury-section border-t border-border">
      <div className="luxury-container">
        <ScrollFadeIn>
          <div className="flex flex-col items-center text-center mb-20">
            <h3 className="luxury-heading mb-6">Subscribe to Our Newsletter</h3>
            <p className="luxury-body mx-auto mb-8">
              Receive and discover our world, collections, and latest news.
            </p>
            <div className="w-full max-w-md">
              <div className="flex border-b border-foreground/30">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <button className="luxury-button px-4 py-3 !text-[12px]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-16">
            {footerLinks.map((link) => (
              <a key={link} href="#" className="luxury-button !text-[13px]">
                {link}
              </a>
            ))}
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.2}>
          <div className="flex justify-center gap-8 mb-16">
            {["Instagram", "YouTube", "Pinterest"].map((social) => (
              <a key={social} href="#" className="luxury-button !text-[12px]">
                {social}
              </a>
            ))}
          </div>
        </ScrollFadeIn>

        <div className="text-center">
          <p className="text-muted-foreground text-xs tracking-wide">
            © {new Date().getFullYear()} RUVTIER. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
