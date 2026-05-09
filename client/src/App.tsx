import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import ExpertHome from "@/pages/expert/ExpertHome";
import ExpertWorldEditor from "@/pages/expert/ExpertWorldEditor";
import ReviewQueue from "@/pages/expert/ReviewQueue";
import WorldBuilder from "@/pages/expert/WorldBuilder";
import PublishedWorlds from "@/pages/expert/PublishedWorlds";
import GraderLobby from "@/pages/grader/GraderLobby";
import GraderWorkspace from "@/pages/grader/GraderWorkspace";
import Login from "@/pages/Login";
import RoleHome from "@/pages/RoleHome";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/login.html" element={<Navigate to="/login" replace />} />

              {/* Expert — specific paths before /expert/* fallback */}
              <Route path="/expert/builder" element={<WorldBuilder />} />
              <Route path="/expert/editor/:worldId" element={<ExpertWorldEditor />} />
              <Route path="/expert/review-queue" element={<ReviewQueue />} />
              <Route path="/expert/worlds" element={<PublishedWorlds />} />
              <Route path="/expert" element={<ExpertHome />} />
              <Route path="/expert/*" element={<Navigate to="/expert" replace />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

              {/* Grader */}
              <Route path="/grader" element={<GraderLobby />} />
              <Route path="/grader/workspace" element={<GraderWorkspace />} />

              <Route path="/" element={<RoleHome />} />
              <Route path="*" element={<RoleHome />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
