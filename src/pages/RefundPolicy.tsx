import LegalPage from "@/components/LegalPage";

const RefundPolicy = () => (
  <LegalPage
    title="Refund Policy"
    metaDescription="How refunds will be handled when RUVTIER begins accepting online payments."
    lastUpdated="30 April 2026"
    intro={
      <p>
        RUVTIER is currently operating in preorder and appointment-only mode. If no payment has
        been taken, no refund is required. If a deposit or payment is introduced in the future,
        this policy will be updated before use.
      </p>
    }
    sections={[
      {
        heading: "1. Future refunds",
        paragraphs: [
          "When RUVTIER begins accepting online payments, refunds will be processed in accordance with applicable consumer law and this policy.",
        ],
      },
      {
        heading: "2. Refund timing",
        paragraphs: [
          "Once an eligible returned item has been received and inspected, we will confirm whether the refund has been approved.",
          "Where a refund is due, it will usually be processed within 14 days of receiving the returned item.",
        ],
      },
      {
        heading: "3. Refund method",
        paragraphs: ["Refunds will normally be issued to the original payment method used for the purchase."],
      },
      {
        heading: "4. Original delivery cost",
        paragraphs: [
          "Where required by law, standard delivery charges may be refunded. If you selected a more expensive delivery option, only the standard delivery amount may be refundable.",
        ],
      },
      {
        heading: "5. Deductions",
        paragraphs: [
          "We may reduce a refund where an item has been handled beyond what is necessary to inspect it, or where it has been worn, damaged, altered or returned in an unsuitable condition, unless the item is faulty.",
        ],
      },
      {
        heading: "6. Faulty or incorrect items",
        paragraphs: [
          "If an item is faulty, damaged or incorrect, please contact us at [insert contact email]. We may ask for photos and order details to help resolve the issue.",
        ],
      },
      {
        heading: "7. Preorder cancellations",
        paragraphs: [
          "If RUVTIER accepts paid preorders in the future, cancellation rights and refund terms will be clearly explained before payment is taken.",
        ],
      },
      {
        heading: "8. Contact",
        paragraphs: ["For refund questions, contact us at [insert contact email]."],
      },
    ]}
  />
);

export default RefundPolicy;
