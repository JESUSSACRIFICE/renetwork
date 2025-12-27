import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Dashboard from "./pages/Dashboard";
import DashboardLeads from "./pages/DashboardLeads";
import DashboardFavorites from "./pages/DashboardFavorites";
import Messages from "./pages/Messages";
import SavedSearches from "./pages/SavedSearches";
import Community from "./pages/Community";
import GroupDetail from "./pages/GroupDetail";
import Tools from "./pages/Tools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:id" element={<ProfessionalDetail />} />
            <Route path="/profile/:id/edit" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/leads" element={<DashboardLeads />} />
            <Route path="/dashboard/favorites" element={<DashboardFavorites />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/searches" element={<SavedSearches />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<GroupDetail />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
