import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Stillness from "./pages/Stillness.tsx";
import Materials from "./pages/Materials.tsx";
import MaterialPage from "./pages/MaterialPage.tsx";
import EditorialPage from "./pages/EditorialPage.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import TheHousePage from "./pages/TheHousePage.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { AuthProvider } from "./hooks/useAuth";
import { AdminAuthProvider } from "./admin/hooks/useAdminAuth";
import AdminGuard from "./admin/components/AdminGuard";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminProductForm from "./admin/pages/AdminProductForm";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminCarts from "./admin/pages/AdminCarts";
import AdminContent from "./admin/pages/AdminContent";
import AdminLogs from "./admin/pages/AdminLogs";
import AdminSettings from "./admin/pages/AdminSettings";

const queryClient = new QueryClient();

function TitleSetter() {
  const location = useLocation();
  useEffect(() => {
    document.title = "Ruvtier";
  }, [location]);
  return null;
}

const boutiqueCategories = [
  "Lifestyle", "Men", "Women", "Children",
  "Footwear", "Made-to-Measure", "Home Interiors",
  "Leather Goods", "Accessories",
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
          {boutiqueCategories.map((cat) => {
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
          <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
          <Route path="/admin" element={<AdminAuthProvider><AdminGuard><AdminDashboard /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/products" element={<AdminAuthProvider><AdminGuard><AdminProducts /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/products/new" element={<AdminAuthProvider><AdminGuard><AdminProductForm /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/products/:id" element={<AdminAuthProvider><AdminGuard><AdminProductForm /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/orders" element={<AdminAuthProvider><AdminGuard><AdminOrders /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/customers" element={<AdminAuthProvider><AdminGuard><AdminCustomers /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/carts" element={<AdminAuthProvider><AdminGuard><AdminCarts /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/content" element={<AdminAuthProvider><AdminGuard><AdminContent /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/logs" element={<AdminAuthProvider><AdminGuard><AdminLogs /></AdminGuard></AdminAuthProvider>} />
          <Route path="/admin/settings" element={<AdminAuthProvider><AdminGuard><AdminSettings /></AdminGuard></AdminAuthProvider>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
