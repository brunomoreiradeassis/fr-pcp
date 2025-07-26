
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrimeiroTurno from "./pages/PrimeiroTurno";
import SegundoTurno from "./pages/SegundoTurno";
import Processamento from "./pages/Processamento";
import Resultados from "./pages/Resultados";
import Produtos from "./pages/Produtos";
import Sistema from "./pages/Sistema";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/primeiro-turno" element={
              <ProtectedRoute>
                <AppLayout>
                  <PrimeiroTurno />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/segundo-turno" element={
              <ProtectedRoute>
                <AppLayout>
                  <SegundoTurno />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/processamento" element={
              <ProtectedRoute>
                <AppLayout>
                  <Processamento />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/resultados" element={
              <ProtectedRoute>
                <AppLayout>
                  <Resultados />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/produtos" element={
              <ProtectedRoute>
                <AppLayout>
                  <Produtos />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/sistema" element={
              <ProtectedRoute>
                <AppLayout>
                  <Sistema />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
