import LegalPage from "@/components/LegalPage";

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    metaDescription="How RUVTIER collects, uses and protects personal information."
    lastUpdated="30 April 2026"
    intro={
      <p>
        RUVTIER respects your privacy and is committed to protecting your personal information.
        This Privacy Policy explains how we collect, use and protect personal data when you visit
        our website, contact us, join our mailing list, request an appointment, submit a preorder
        enquiry or interact with RUVTIER online.
      </p>
    }
    sections={[
      {
        heading: "1. Who we are",
        paragraphs: [
          "RUVTIER is a luxury clothing and lifestyle brand.",
          "Business name: RUVTIER",
          "Trading name: RUVTIER",
          "Business address: Palermo, Italy (correspondence address available on request)",
          "Email: contact@ruvtier.com",
          "For the purposes of data protection law, RUVTIER is the controller of the personal data collected through this website.",
        ],
      },
      {
        heading: "2. Information we collect",
        paragraphs: ["We may collect the following information:"],
        list: [
          "Name",
          "Email address",
          "Phone number, if provided",
          "Client Lounge account details: email, display name, phone and password (the password is stored only as a secure hash by our authentication provider)",
          "Shipping and billing addresses saved to your Client Lounge account",
          "Appointment, house visit, allocation and preorder request details, including preferred dates, sizes and delivery region",
          "Basket contents held against your session or account",
          "Order records, including items, totals and delivery address, once ordering is live",
          "Delivery or location preferences, if provided",
          "Messages sent through contact forms",
          "Newsletter and private-list subscription preferences",
          "Website usage information",
          "Device, browser and IP-related technical information",
          "Cookie and analytics preferences",
        ],
      },
      {
        paragraphs: [
          "We do not use artificial intelligence to process your personal data. Nothing you submit through this website is sent to an AI provider.",
        ],
      },
      {
        paragraphs: [
          "We do not intentionally collect payment card details through this website while RUVTIER is operating in preorder and appointment-only mode.",
        ],
      },
      {
        heading: "3. How we use your information",
        paragraphs: ["We use your personal information to:"],
        list: [
          "Respond to enquiries",
          "Manage appointment requests",
          "Manage preorder interest",
          "Send requested updates about RUVTIER",
          "Provide customer support",
          "Improve our website and services",
          "Maintain website security",
          "Understand how visitors use the website",
          "Comply with legal obligations",
        ],
      },
      {
        heading: "4. Our lawful basis",
        paragraphs: ["Depending on the situation, we may use your information because:"],
        list: [
          "You have given consent, such as when joining the newsletter",
          "We need it to respond to your request",
          "We have a legitimate interest in operating and improving the website",
          "We need to comply with legal obligations",
        ],
      },
      {
        paragraphs: [
          "You may withdraw consent to marketing emails at any time by using the unsubscribe link or contacting us.",
        ],
      },
      {
        heading: "5. Newsletter and marketing",
        paragraphs: [
          "If you sign up to receive RUVTIER updates, we may send you occasional emails about collections, appointments, brand news and private releases. We will not send marketing emails without your consent where consent is required.",
          "You can unsubscribe at any time.",
        ],
      },
      {
        heading: "6. Sharing your information",
        paragraphs: [
          "We do not sell your personal information.",
          "We work with a small number of trusted providers who process personal data on our behalf. They must handle your information securely and only for the purposes we instruct:",
        ],
        list: [
          "Supabase — database, authentication and file hosting for this website",
          "Resend — delivery of account, appointment and newsletter emails from notify.ruvtier.com",
          "Stripe — payment processing and fraud prevention, once ordering is live. Card details are entered on Stripe's own secure surface and are never held by RUVTIER",
          "Our website hosting provider — serving this website and its static assets",
          "An IP-based geolocation service, used only to suggest a shipping region and currency",
        ],
      },
      {
        paragraphs: [
          "We may also share information if required by law, regulation or legal process.",
        ],
      },
      {
        heading: "7. International transfers",
        paragraphs: [
          "Some service providers may process information outside the United Kingdom. Where this happens, we will take reasonable steps to ensure appropriate safeguards are in place.",
        ],
      },
      {
        heading: "8. How long we keep your information",
        paragraphs: ["We keep personal information only for as long as necessary for the purpose it was collected. For example:"],
        list: [
          "Newsletter data is kept until you unsubscribe or ask us to delete it.",
          "Enquiry and appointment data is kept for as long as needed to respond and manage the relationship.",
          "Technical and security records may be kept for a reasonable period to protect the website.",
          "Legal or business records may be kept where required by law.",
        ],
      },
      {
        heading: "9. Your rights",
        paragraphs: ["Depending on the circumstances, you may have the right to:"],
        list: [
          "Access your personal data",
          "Correct inaccurate personal data",
          "Request deletion of your personal data",
          "Restrict how we use your personal data",
          "Object to certain uses of your personal data",
          "Request a copy of your personal data",
          "Withdraw consent where we rely on consent",
        ],
      },
      {
        paragraphs: [
          "To exercise any of these rights, email contact@ruvtier.com from the address you used with RUVTIER, stating what you would like us to do. We will verify that the request comes from you, confirm receipt, and respond within one month. Where we cannot verify ownership of an address, we may ask for further information before acting.",
          "Account deletion removes your Client Lounge profile, saved addresses, saved basket, and appointment, allocation and preorder history, except where we are required to keep records for legal, tax or fraud-prevention purposes.",
        ],
      },
      {
        heading: "10. Security",
        paragraphs: [
          "We use reasonable technical and organisational measures to protect personal information. However, no website or online service can be guaranteed to be completely secure.",
        ],
      },
      {
        heading: "11. Cookies",
        paragraphs: [
          "We use cookies and similar technologies to operate the website, improve performance and understand how visitors interact with RUVTIER. More information is available in our Cookie Policy.",
        ],
      },
      {
        heading: "12. Complaints",
        paragraphs: [
          "If you have concerns about how we use your personal information, please contact us first at contact@ruvtier.com.",
          "You may also contact the UK Information Commissioner's Office if you are unhappy with how your data has been handled.",
        ],
      },
      {
        heading: "13. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The latest version will always be available on this page.",
        ],
      },
    ]}
  />
);

export default PrivacyPolicy;
