import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { RegionProvider } from "./hooks/useRegionCurrency";
import { ADMIN_PREFIX } from "./admin/config";
import ErrorBoundary from "./components/ErrorBoundary";
import { AdminProtectedLayout, AdminPublicLayout } from "./admin/components/AdminRoute";
import CookieConsent from "./components/CookieConsent";
import LaunchStatusBanner from "./components/LaunchStatusBanner";

import MaintenanceGate from "./components/MaintenanceGate";

// Eager-import the home route
import Index from "./pages/Index";

// Lazy-loaded pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Stillness = lazy(() => import("./pages/Stillness"));
const Materials = lazy(() => import("./pages/Materials"));
const MaterialPage = lazy(() => import("./pages/MaterialPage"));
const EditorialPage = lazy(() => import("./pages/EditorialPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const PreorderPage = lazy(() => import("./pages/PreorderPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TheHousePage = lazy(() => import("./pages/TheHousePage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RitualsOfCarePage = lazy(() => import("./pages/RitualsOfCarePage"));
const BoutiqueCategoryPage = lazy(() => import("./pages/BoutiqueCategoryPage"));
const ComingSoonCategoryPage = lazy(() => import("./pages/ComingSoonCategoryPage"));
const AppointmentsPage = lazy(() => import("./pages/AppointmentsPage"));
const MadeToMeasurePage = lazy(() => import("./pages/MadeToMeasurePage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const FindBoutiquePage = lazy(() => import("./pages/FindBoutiquePage"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./admin/pages/AdminProducts"));
const AdminProductForm = lazy(() => import("./admin/pages/AdminProductForm"));
const AdminOrders = lazy(() => import("./admin/pages/AdminOrders"));
const AdminCustomers = lazy(() => import("./admin/pages/AdminCustomers"));
const AdminCarts = lazy(() => import("./admin/pages/AdminCarts"));
const AdminContent = lazy(() => import("./admin/pages/AdminContent"));
const AdminLogs = lazy(() => import("./admin/pages/AdminLogs"));
const AdminSettings = lazy(() => import("./admin/pages/AdminSettings"));
const AdminPreorders = lazy(() => import("./admin/pages/AdminPreorders"));
const AdminAppointments = lazy(() => import("./admin/pages/AdminAppointments"));
const AdminMaintenance = lazy(() => import("./admin/pages/AdminMaintenance"));
const AdminWebsiteEditor = lazy(() => import("./admin/pages/AdminWebsiteEditor"));
const AdminStock = lazy(() => import("./admin/pages/AdminStock"));
const AdminOrderDetail = lazy(() => import("./admin/pages/AdminOrderDetail"));
const AdminStripeReadiness = lazy(() => import("./admin/pages/AdminStripeReadiness"));
const AdminApproval = lazy(() => import("./pages/AdminApproval"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnsPolicy = lazy(() => import("./pages/ReturnsPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

const queryClient = new QueryClient();

function TitleSetter() {
  const location = useLocation();
  useEffect(() => {
    if (!document.title || document.title === "Ruvtier") {
      document.title = "RUVTIER — A Whisper of Luxury";
    }
  }, [location]);
  return null;
}

// Categories that show filtered products from the database.
const genderCategories: Record<string, string> = {
  Women: "women",
  Men: "men",
  Lifestyle: "lifestyle",
};

// Coming-soon categories: refined placeholder pages with Register
// Interest + Book Appointment CTAs. `title` becomes the H1; each
// resolves through <ComingSoonCategoryPage /> below.
const comingSoonCategories: { slug: string; title: string; intent?: string }[] = [
  { slug: "children", title: "Children", intent: "Composed for the smallest wearers, with the same discipline as everything else the house makes." },
  { slug: "footwear", title: "Footwear", intent: "Footwear is composed at the same pace as the pieces it accompanies." },
  { slug: "home-interiors", title: "Home Interiors", intent: "Objects for the life within. Every surface considered." },
  { slug: "leather-goods", title: "Leather Goods", intent: "Composed to develop a patina reflecting time, use and touch." },
  { slug: "accessories", title: "Accessories", intent: "Quiet objects to accompany the pieces of the house." },
  { slug: "textiles", title: "Textiles", intent: "Cloth for the home and for the wearer, held to the same standard." },
  { slug: "objects", title: "Objects", intent: "Small objects composed with the same intention as the garments." },
  { slug: "fragrance", title: "Fragrance", intent: "A dry, matte scent to accompany the house. Composed slowly." },
];

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <RegionProvider>
        <TitleSetter />
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <span
              className="font-serif tracking-[0.4em] text-foreground/40 text-sm md:text-base animate-pulse"
              aria-label="Loading"
            >
              RUVTIER
            </span>
          </div>
        }>

        <MaintenanceGate>
        <LaunchStatusBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lounge" element={<Index />} />
          <Route path="/stillness" element={<Stillness />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/:slug" element={<MaterialPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/preorder/:slug" element={<PreorderPage />} />
          <Route
            path="/boutique"
            element={
              <EditorialPage
                title="Online Boutique"
                subtitle="The first pieces are in quiet preparation."
                body="A curated collection, composed with care and intention."
                actionLabel="Discover"
                actionTo="/collection"
              />
            }
          />
          {/* Gender-filtered listings (real product data) */}
          {Object.entries(genderCategories).map(([label, gender]) => {
            const slug = label.toLowerCase().replace(/\s+/g, "-");
            return (
              <Route
                key={slug}
                path={`/boutique/${slug}`}
                element={
                  <BoutiqueCategoryPage
                    title={label}
                    gender={gender}
                    subtitle={`Curated ${label.toLowerCase()} pieces, composed with intention.`}
                  />
                }
              />
            );
          })}
          {/* Made-to-Measure has its own dedicated page */}
          <Route path="/boutique/made-to-measure" element={<MadeToMeasurePage />} />
          {/* Coming-soon category pages */}
          {comingSoonCategories.map((c) => (
            <Route
              key={c.slug}
              path={`/boutique/${c.slug}`}
              element={<ComingSoonCategoryPage title={c.title} intent={c.intent} />}
            />
          ))}
          {/* Alias — keep /home-interior indexed but consolidated */}
          <Route path="/home-interior" element={<Navigate to="/boutique/home-interiors" replace />} />

          <Route path="/the-house" element={<TheHousePage />} />
          <Route
            path="/craft-career"
            element={
              <EditorialPage
                title="Craft Career"
                body="We seek hands that understand patience. Positions are composed, not filled. Write to careers via contact@ruvtier.com."
                actionLabel="Contact the House"
                actionTo="/contact"
              />
            }
          />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/find-boutique" element={<FindBoutiquePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/rituals-of-care" element={<RitualsOfCarePage />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-approval" element={<AdminApproval />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route
            path="/garment"
            element={
              <EditorialPage
                title="The First Garment"
                subtitle="The first garments are in quiet preparation."
                body="Each piece will arrive when it is ready."
                actionLabel="Explore by material"
                actionTo="/materials"
              />
            }
          />

          {/* Admin — public (login) */}
          <Route path={`${ADMIN_PREFIX}/login`} element={<AdminPublicLayout />}>
            <Route index element={<AdminLogin />} />
          </Route>

          {/* Admin — protected */}
          <Route path={ADMIN_PREFIX} element={<AdminProtectedLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="stripe-readiness" element={<AdminStripeReadiness />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="carts" element={<AdminCarts />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="editor" element={<AdminWebsiteEditor />} />
            <Route path="preorders" element={<AdminPreorders />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="maintenance" element={<AdminMaintenance />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </MaintenanceGate>
        </Suspense>
        <CookieConsent />
        </RegionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
