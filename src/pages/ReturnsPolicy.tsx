import LegalPage from "@/components/LegalPage";

const ReturnsPolicy = () => (
  <LegalPage
    title="Returns Policy"
    metaDescription="How returns will be handled when RUVTIER begins accepting online purchases."
    lastUpdated="30 April 2026"
    intro={
      <p>
        RUVTIER is currently operating in preorder and appointment-only mode. If no purchase has
        been completed, there is no product return to process. You may contact us to cancel or
        amend an enquiry where possible. This policy is prepared for future ecommerce use and will
        be updated before full online sales begin.
      </p>
    }
    sections={[
      {
        heading: "1. Future online purchases",
        paragraphs: [
          "When RUVTIER begins accepting online purchases, customers will be able to request a return in accordance with applicable consumer law and the conditions set out on this page.",
        ],
      },
      {
        heading: "2. Change of mind returns",
        paragraphs: [
          "For most online purchases, you will usually have 14 days from receiving your order to notify us that you wish to cancel or return the item.",
          "After notifying us, you will usually have a further 14 days to send the item back.",
        ],
      },
      {
        heading: "3. Return condition",
        paragraphs: ["Returned items must be:"],
        list: [
          "Unworn",
          "Unwashed",
          "Unaltered",
          "In original condition",
          "With tags attached where applicable",
          "In original packaging where possible",
        ],
      },
      {
        paragraphs: [
          "Items that show signs of wear, damage, fragrance, makeup marks or alteration may not be accepted, unless faulty.",
        ],
      },
      {
        heading: "4. Items that may not be returnable",
        paragraphs: ["Certain items may not be eligible for return where permitted by law, such as:"],
        list: [
          "Personalised or made-to-order items",
          "Items altered at the customer's request",
          "Sealed items that cannot be returned for hygiene reasons once opened",
          "Gift cards, where applicable",
        ],
      },
      {
        paragraphs: ["This will be clearly explained before purchase where relevant."],
      },
      {
        heading: "5. Faulty items",
        paragraphs: [
          "If an item is faulty, damaged or not as described, please contact us as soon as possible with your order details and photos where relevant.",
        ],
      },
      {
        heading: "6. How to request a return",
        paragraphs: ["To request a return, contact [insert contact email] with:"],
        list: [
          "Your name",
          "Order number, if available",
          "Item name",
          "Reason for return",
          "Photos if the item is faulty or damaged",
        ],
      },
      {
        heading: "7. Return shipping",
        paragraphs: [
          "Return shipping instructions will be provided after your return request is reviewed. Unless the item is faulty or incorrect, customers may be responsible for return shipping costs.",
        ],
      },
      {
        heading: "8. Contact",
        paragraphs: ["For return questions, contact us at [insert contact email]."],
      },
    ]}
  />
);

export default ReturnsPolicy;
