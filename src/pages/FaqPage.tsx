import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageMeta } from "@/hooks/usePageMeta";

const FAQS = [
  {
    q: "How does a private appointment work?",
    a: "Appointments are arranged directly with a steward of the house — in person in our Palermo atelier or by private video. Reserve a preferred date and time on the Appointments page; we will confirm the details in correspondence.",
  },
  {
    q: "What does 'available by allocation' mean?",
    a: "Each edition is composed once. Pieces are offered to registered clients in the order interest is expressed. There is no waitlist and no restock. To register interest, use the Request Allocation action on the piece or category of interest.",
  },
  {
    q: "How do I request Made-to-Measure?",
    a: "Made-to-Measure begins with a private consultation covering silhouette, fabric selection, measurements and fittings. Reserve a consultation on the Appointments page or write to appointments@ruvtier.com.",
  },
  {
    q: "When will pieces be available for direct purchase?",
    a: "The house is currently operating in private appointment and allocation mode. Direct online purchase will be introduced quietly, in due time. Until then, pieces are released to registered clients.",
  },
  {
    q: "How should I care for a RUVTIER piece?",
    a: "See our Rituals of Care for material-specific guidance. In brief: allow each piece to rest and breathe between wear, avoid direct light and unnecessary friction, and store with respect.",
  },
  {
    q: "How does shipping work?",
    a: "During private appointment and allocation mode, shipping is arranged individually with the client. Full shipping terms are set out in the Shipping Policy.",
  },
  {
    q: "What is the returns policy?",
    a: "Since purchases are not yet placed online, there is no online return to process. The Returns Policy sets out how returns will be handled once direct purchase is introduced. Made-to-Measure and personalised pieces are non-returnable.",
  },
  {
    q: "What is Client Services?",
    a: "Client Services is the private line of correspondence between the house and its clients — for questions on care, restoration, appointments and allocation. Write to clientservices@ruvtier.com.",
  },
  {
    q: "How do I contact the house?",
    a: "General enquiries: contact@ruvtier.com · Client services: clientservices@ruvtier.com · Private appointments: appointments@ruvtier.com · Private client: private@ruvtier.com. Or use the Contact page.",
  },
  {
    q: "Where is RUVTIER based?",
    a: "Composed in Palermo, drawing on British and Italian traditions of quiet luxury. The atelier is not a public boutique; visits are by private appointment.",
  },
];

const FaqPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Frequently Asked Questions",
    description: "Answers on private appointments, allocation, made-to-measure, care, shipping and returns at RUVTIER.",
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-20 md:pb-28 min-h-[80vh]">
        <div className="luxury-container max-w-[760px] mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-14 md:mb-20">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                Enquiries
              </p>
              <h1 className="luxury-heading mb-6">Frequently Asked Questions</h1>
              <p className="luxury-body mx-auto max-w-[520px]">
                For anything not addressed here, write to the house directly.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="py-6 text-left font-serif font-light text-[15px] md:text-[17px] tracking-[0.02em] text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 font-sans font-light text-[14px] leading-[1.9] text-foreground/80">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.15}>
            <div className="mt-14 text-center border-t border-border pt-10">
              <p className="font-serif italic text-foreground/80 mb-6">
                For anything else, the house is quietly at your service.
              </p>
              <Link to="/contact" className="luxury-button !text-[12px] tracking-[0.2em]">
                Contact the House
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default FaqPage;
