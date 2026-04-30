import LegalPage from "@/components/LegalPage";

const CookiePolicy = () => (
  <LegalPage
    title="Cookie Policy"
    metaDescription="How RUVTIER uses cookies and similar technologies on our website."
    lastUpdated="30 April 2026"
    intro={<p>This Cookie Policy explains how RUVTIER uses cookies and similar technologies on our website.</p>}
    sections={[
      {
        heading: "1. What are cookies?",
        paragraphs: [
          "Cookies are small files placed on your device when you visit a website. They help websites work properly, remember preferences, improve performance and understand visitor behaviour.",
        ],
      },
      {
        heading: "2. How we use cookies",
        paragraphs: ["RUVTIER may use cookies for:"],
        list: [
          "Essential website functionality",
          "Security and fraud prevention",
          "Remembering cookie preferences",
          "Website performance and analytics",
          "Improving the user experience",
          "Understanding how visitors use the website",
        ],
      },
      {
        heading: "3. Types of cookies we may use",
        paragraphs: [
          "Essential cookies — These are needed for the website to work properly. They may support security, navigation, forms, session handling and cookie preference storage.",
          "Analytics cookies — These help us understand how visitors use the website, which pages are visited and how the site can be improved.",
          "Preference cookies — These help remember choices such as region, language or display preferences.",
          "Marketing cookies — These may be used in the future to understand campaign performance or show relevant content. We will only use these where permitted and, where required, with your consent.",
        ],
      },
      {
        heading: "4. Managing cookies",
        paragraphs: [
          "You can manage your cookie preferences through the cookie banner or settings tool where available. You can also block or delete cookies through your browser settings.",
          "Some parts of the website may not work properly if essential cookies are blocked.",
        ],
      },
      {
        heading: "5. Third-party cookies",
        paragraphs: [
          "Some cookies may be set by trusted third-party services used for hosting, analytics, embedded content or website functionality. We will keep these under review.",
        ],
      },
      {
        heading: "6. Changes to this Cookie Policy",
        paragraphs: ["We may update this Cookie Policy when our website or technology changes."],
      },
      {
        heading: "7. Contact",
        paragraphs: ["For questions about cookies, contact us at [insert contact email]."],
      },
    ]}
  />
);

export default CookiePolicy;
