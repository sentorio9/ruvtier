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
          <Route
            path="/the-house"
            element={
              <EditorialPage
                title="The House"
                body="A house built on silence, craft, and conviction."
                actionLabel="Explore"
                actionTo="/"
              />
            }
          />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
