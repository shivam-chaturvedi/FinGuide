import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Layout } from "./components/Layout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import DOMPatchProvider from "./components/DOMPatchProvider";
import Home from "./pages/Home";
import ModulesDynamic from "./pages/ModulesDynamic";
import ModuleDetail from "./pages/ModuleDetail";
import Calculators from "./pages/Calculators";
import Remittances from "./pages/Remittances";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Component to handle app initialization loading
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">FinGuide</h2>
            <p className="text-sm text-muted-foreground">Initializing your financial learning platform...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute requireAuth={false}>
            <Signup />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <Layout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/dashboard" element={
          <ProtectedRoute requireAuth={true}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="modules" element={<ModulesDynamic />} />
          <Route path="modules/:id" element={<ModuleDetail />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="remittances" element={<Remittances />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <DOMPatchProvider>
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  </DOMPatchProvider>
);

export default App;
