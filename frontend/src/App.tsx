import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

// Pages
import { Home } from "@/pages/Home";
import { LostItems } from "@/pages/LostItems";
import { ItemDetail } from "@/pages/ItemDetail";
import { AddReport } from "@/pages/AddReport";
import { Profile } from "@/pages/Profile";
import { Notifications } from "@/pages/Notifications";
import { MatchChat } from "@/pages/MatchChat";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { VerifyResetCode } from "@/pages/auth/VerifyResetCode";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Wrapper component that provides navigation to AuthProvider
const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const handleUnauthorized = () => {
    // Clear any cached data and navigate to login
    queryClient.clear();
    navigate("/auth/login", { replace: true });
  };

  return (
    <AuthProvider onUnauthorized={handleUnauthorized}>{children}</AuthProvider>
  );
};

// Main app routes component
const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/"
      element={
        <Layout>
          <Home />
        </Layout>
      }
    />
    <Route
      path="/lost-items"
      element={
        <Layout>
          <LostItems />
        </Layout>
      }
    />
    <Route
      path="/report/:id"
      element={
        <Layout>
          <ItemDetail />
        </Layout>
      }
    />

    {/* Auth Routes */}
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
    <Route path="/auth/verify-reset-code" element={<VerifyResetCode />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />

    {/* Protected Routes */}
    <Route
      path="/add-report"
      element={
        <ProtectedRoute>
          <Layout>
            <AddReport />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Layout>
            <Notifications />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/match-chat"
      element={
        <ProtectedRoute>
          <Layout>
            <MatchChat />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProviderWrapper>
          <AppRoutes />
        </AuthProviderWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
