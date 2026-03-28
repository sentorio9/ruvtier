import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { AdminAuthProvider } from "./admin/hooks/useAdminAuth";
import AdminGuard from "./admin/components/AdminGuard";
import { ADMIN_PREFIX } from "./admin/config";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Stillness = lazy(() => import("./pages/Stillness"));
const Materials = lazy(() => import("./pages/Materials"));
const MaterialPage = lazy(() => import("./pages/MaterialPage"));
const EditorialPage = lazy(() => import("./pages/EditorialPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TheHousePage = lazy(() => import("./pages/TheHousePage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BoutiqueCategoryPage = lazy(() => import("./pages/BoutiqueCategoryPage"));
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

const queryClient = new QueryClient();

function TitleSetter() {
  const location = useLocation();
  useEffect(() => {
    // Default title; individual pages override via usePageMeta
    if (!document.title || document.title === "Ruvtier") {
      document.title = "RUVTIER — A Whisper of Luxury";
    }
  }, [location]);
  return null;
}

// Categories that show filtered products from database
const genderCategories: Record<string, string> = {
  Women: "women",
  Men: "men",
  Lifestyle: "lifestyle",
};

// Categories that remain editorial placeholders
const editorialCategories = [
  "Children", "Footwear", "Made-to-Measure",
  "Home Interiors", "Leather Goods", "Accessories",
  "Textiles", "Objects", "Fragrance",
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <TitleSetter />
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stillness" element={<Stillness />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/:slug" element={<MaterialPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
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
          {editorialCategories.map((cat) => {
            const slug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <Route
                key={slug}
                path={`/boutique/${slug}`}
                element={
                  <EditorialPage
                    title={cat}
                    body="The first pieces are in quiet preparation."
                    actionLabel="Explore"
                    actionTo="/boutique"
                  />
                }
              />
            );
          })}
          <Route
            path="/home-interior"
            element={
              <EditorialPage
                title="Home Interior"
                subtitle="Objects for the life within."
                body="This chapter of the house is being composed."
                actionLabel="Discover"
                actionTo="/"
              />
            }
          />
          <Route path="/the-house" element={<TheHousePage />} />
          <Route
            path="/craft-career"
            element={
              <EditorialPage
                title="Craft Career"
                body="We seek hands that understand patience. Positions are composed, not filled."
                actionLabel="Return"
                actionTo="/"
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <EditorialPage
                title="Private Appointments"
                body="Reserve a moment with the house. Each appointment is personal and unhurried."
                actionLabel="Return"
                actionTo="/"
              />
            }
          />
          <Route
            path="/find-boutique"
            element={
              <EditorialPage
                title="Find a Boutique"
                body="Our spaces are forthcoming. Each one will be a quiet room of its own."
                actionLabel="Return"
                actionTo="/"
              />
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          {/* Admin routes - hidden, not linked publicly */}
          <Route path={`${ADMIN_PREFIX}/login`} element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
          <Route path={ADMIN_PREFIX} element={<AdminAuthProvider><AdminGuard><AdminDashboard /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/products`} element={<AdminAuthProvider><AdminGuard><AdminProducts /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/products/new`} element={<AdminAuthProvider><AdminGuard><AdminProductForm /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/products/:id`} element={<AdminAuthProvider><AdminGuard><AdminProductForm /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/orders`} element={<AdminAuthProvider><AdminGuard><AdminOrders /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/customers`} element={<AdminAuthProvider><AdminGuard><AdminCustomers /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/carts`} element={<AdminAuthProvider><AdminGuard><AdminCarts /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/content`} element={<AdminAuthProvider><AdminGuard><AdminContent /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/logs`} element={<AdminAuthProvider><AdminGuard><AdminLogs /></AdminGuard></AdminAuthProvider>} />
          <Route path={`${ADMIN_PREFIX}/settings`} element={<AdminAuthProvider><AdminGuard><AdminSettings /></AdminGuard></AdminAuthProvider>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
