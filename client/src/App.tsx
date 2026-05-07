import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import ExpertHome from "@/pages/expert/ExpertHome";
import ReviewQueue from "@/pages/expert/ReviewQueue";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import GraderLobby from "@/pages/grader/GraderLobby";
import GraderWorkspace from "@/pages/grader/GraderWorkspace";
import { useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

function AdminOnly() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return profile?.role === "admin" ? <AdminDashboard /> : <Navigate to="/expert" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Expert */}
              <Route path="/expert" element={<ExpertHome />} />
              <Route path="/expert/review-queue" element={<ReviewQueue />} />
              <Route path="/expert/*" element={<Navigate to="/expert" replace />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminOnly />} />

              {/* Grader */}
              <Route path="/grader" element={<GraderLobby />} />
              <Route path="/grader/workspace" element={<GraderWorkspace />} />

              {/* Root catch-all → expert home */}
              <Route path="*" element={<Navigate to="/expert" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
