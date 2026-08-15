import LegalPage from "@/components/LegalPage";

const TermsAndConditions = () => (
  <LegalPage
    title="Terms & Conditions"
    metaDescription="The terms governing your use of the RUVTIER website."
    lastUpdated="30 April 2026"
    intro={
      <p>
        These Terms &amp; Conditions govern your use of the RUVTIER website. By using this website,
        you agree to these terms.
      </p>
    }
    sections={[
      {
        heading: "1. About RUVTIER",
        paragraphs: [
          "RUVTIER is a luxury clothing and lifestyle brand.",
          "Business name: RUVTIER",
          "Trading name: RUVTIER",
          "Business address: Palermo, Italy (correspondence address available on request)",
          "Email: contact@ruvtier.com",
        ],
      },
      {
        heading: "2. Website use",
        paragraphs: ["You agree to use this website only for lawful purposes. You must not:"],
        list: [
          "Misuse the website",
          "Attempt to gain unauthorised access to any part of the website",
          "Interfere with website security",
          "Copy, scrape or reproduce website content without permission",
          "Use the website in a way that causes harm to RUVTIER or other users",
        ],
      },
      {
        heading: "3. Preorder and appointment-only status",
        paragraphs: [
          "RUVTIER is currently operating in preorder and appointment-only mode. This means the website may allow you to register interest, request an appointment, contact the brand or submit a preorder enquiry.",
          "Unless clearly stated otherwise, submitting a preorder enquiry does not create a confirmed purchase contract and does not guarantee product availability.",
          "If RUVTIER later enables online checkout, these Terms will be updated to include full ecommerce terms.",
        ],
      },
      {
        heading: "3a. Allocation and private access requests",
        paragraphs: [
          "Certain pieces are released by allocation. Submitting an allocation or private access request is an expression of interest only. RUVTIER decides at its sole discretion whether to offer an allocation, and may decline any request without giving reasons.",
          "Where a piece is described as a limited edition, the stated edition size is a maximum. RUVTIER may hold back pieces for archive, press, atelier or client-service purposes.",
          "An allocation offer, once made, is personal to you, is not transferable, and lapses if not accepted within the period stated in the offer.",
          "No payment is taken at the point of request. Any deposit, balance, cancellation or refund terms will be set out in writing before payment is taken, and those written terms will prevail over this page for that specific piece.",
          "Indicative delivery windows given for preorders and allocations are estimates, not guarantees. Where a stated window will be materially missed, we will contact you and you may withdraw your request.",
          "Requests submitted through automated means, duplicate submissions, or submissions containing information we believe to be false may be refused or removed.",
        ],
      },
      {
        heading: "3b. Appointments and house visits",
        paragraphs: [
          "Appointment and house visit requests are invitations to treat. A visit is only confirmed once RUVTIER has replied in writing with a date and time.",
          "We ask that you tell us as early as possible if you cannot attend a confirmed appointment. Repeated non-attendance may lead us to decline future requests.",
        ],
      },
      {
        heading: "4. Product information",
        paragraphs: [
          "We aim to present product information accurately. However, product descriptions, images, availability, pricing, materials and release details may change.",
          "Images are provided for presentation purposes and colours may vary depending on screen settings.",
        ],
      },
      {
        heading: "5. Pricing",
        paragraphs: [
          "Where prices are shown, they may be subject to change. In preorder and appointment-only mode, any displayed price may be indicative unless clearly confirmed in writing.",
        ],
      },
      {
        heading: "6. Intellectual property",
        paragraphs: [
          "All content on this website belongs to RUVTIER or its licensors. This includes images, text, logos, graphics, designs, product names, layouts and brand materials.",
          "You may not copy, reproduce, distribute or commercially use any content without written permission.",
        ],
      },
      {
        heading: "7. Third-party links",
        paragraphs: [
          "This website may contain links to third-party websites or services. RUVTIER is not responsible for the content, policies or practices of third-party websites.",
        ],
      },
      {
        heading: "8. Account and admin areas",
        paragraphs: [
          "Some areas of the website may be restricted. You must not attempt to access restricted or admin-only areas unless authorised.",
        ],
      },
      {
        heading: "9. Limitation of liability",
        paragraphs: [
          "We aim to keep the website available and accurate, but we do not guarantee that it will always be uninterrupted, error-free or free from harmful components.",
          "Nothing in these Terms excludes liability where it would be unlawful to do so.",
        ],
      },
      {
        heading: "10. Privacy",
        paragraphs: ["Your use of the website is also governed by our Privacy Policy and Cookie Policy."],
      },
      {
        heading: "11. Changes to these Terms",
        paragraphs: [
          "We may update these Terms from time to time. The latest version will be available on this page.",
        ],
      },
      {
        heading: "12. Contact",
        paragraphs: ["For questions about these Terms, contact us at contact@ruvtier.com."],
      },
    ]}
  />
);

export default TermsAndConditions;
