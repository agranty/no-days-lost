import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MarketingHome from "./pages/MarketingHome";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import Upgrade from "./pages/Upgrade";
import Auth from "./pages/Auth";
import LogWorkout from "./pages/LogWorkout";
import Generate from "./pages/Generate";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Weight from "./pages/Weight";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminBilling from "./pages/AdminBilling";
import AdminMetrics from "./pages/AdminMetrics";
import Marketing from "./pages/Marketing";
import Compare from "./pages/Compare";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<MarketingHome />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/log" element={<LogWorkout />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/history" element={<History />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/weight" element={<Weight />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/billing" element={<AdminBilling />} />
              <Route path="/admin/metrics" element={<AdminMetrics />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/faq" element={<FAQ />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
