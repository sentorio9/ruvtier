import ScrollFadeIn from "./ScrollFadeIn";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="py-20 md:py-28 border-t border-border">
      <div className="luxury-container">
        <ScrollFadeIn>
          <div className="flex flex-col items-center text-center gap-8">
            <button onClick={onSubscribeClick} className="luxury-button !text-[13px]">
              Subscribe to newsletter
            </button>
            <a href="#" className="luxury-button !text-[13px]">
              Contact
            </a>
            <a href="#" className="luxury-button !text-[13px]">
              Explore Online Boutique
            </a>
            <a href="#" className="luxury-button !text-[13px]">
              Private Appointments
            </a>

            <div className="flex gap-8 mt-4">
              {["Instagram", "YouTube", "Pinterest"].map((social) => (
                <a key={social} href="#" className="luxury-button !text-[12px]">
                  {social}
                </a>
              ))}
            </div>

            <p className="text-muted-foreground text-xs tracking-wide mt-6">
              © {new Date().getFullYear()} RUVTIER. All rights reserved.
            </p>
          </div>
        </ScrollFadeIn>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
