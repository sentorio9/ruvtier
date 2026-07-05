import LegalPage from "@/components/LegalPage";

const ShippingPolicy = () => (
  <LegalPage
    title="Shipping Policy"
    metaDescription="RUVTIER shipping arrangements during preorder and appointment-only mode."
    lastUpdated="30 April 2026"
    intro={
      <p>
        RUVTIER is currently operating in preorder and appointment-only mode. Online checkout and
        standard shipping are not currently active unless clearly stated on the website or
        confirmed directly by RUVTIER.
      </p>
    }
    sections={[
      {
        heading: "1. Current status",
        paragraphs: [
          "At this stage, customers may register interest, submit a preorder enquiry or request an appointment. Shipping details will be confirmed individually where relevant.",
        ],
      },
      {
        heading: "2. Future shipping",
        paragraphs: [
          "When RUVTIER enables online orders, shipping options, delivery times and shipping costs will be shown before checkout.",
          "Future shipping information may include:",
        ],
        list: [
          "Delivery destination",
          "Available shipping methods",
          "Estimated delivery times",
          "Shipping costs",
          "Tracking information where available",
          "Customs or import duties for international orders",
        ],
      },
      {
        heading: "3. Delivery estimates",
        paragraphs: [
          "Any delivery estimate provided by RUVTIER is an estimate only and may be affected by production timelines, courier delays, customs processing or other circumstances outside our control.",
        ],
      },
      {
        heading: "4. International shipping",
        paragraphs: [
          "International shipping may be available in the future. Customers outside the United Kingdom may be responsible for customs duties, taxes, import fees or local charges unless stated otherwise.",
        ],
      },
      {
        heading: "5. Address accuracy",
        paragraphs: [
          "Customers are responsible for providing accurate delivery information. RUVTIER is not responsible for delays caused by incorrect or incomplete address details.",
        ],
      },
      {
        heading: "6. Contact",
        paragraphs: ["For shipping questions, contact us at contact@ruvtier.com."],
      },
    ]}
  />
);

export default ShippingPolicy;
