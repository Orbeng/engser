import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import CreateCompany from "@/pages/companies/create";
import EditCompany from "@/pages/companies/edit";
import Services from "@/pages/services";
import CreateService from "@/pages/services/create";
import EditService from "@/pages/services/edit";
import Quotes from "@/pages/quotes";
import CreateQuote from "@/pages/quotes/create";
import PrintQuote from "@/pages/quotes/print";
import Reports from "@/pages/reports";
import Configuracoes from "@/pages/configuracoes";
import AuthPage from "@/pages/auth-page";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { TopActionsProvider } from "@/hooks/use-top-actions";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/empresas" component={Companies} />
      <ProtectedRoute path="/empresas/criar" component={CreateCompany} />
      <ProtectedRoute path="/empresas/editar/:id" component={EditCompany} />
      <ProtectedRoute path="/servicos" component={Services} />
      <ProtectedRoute path="/servicos/criar" component={CreateService} />
      <ProtectedRoute path="/servicos/editar/:id" component={EditService} />
      <ProtectedRoute path="/orcamentos" component={Quotes} />
      <ProtectedRoute path="/orcamentos/criar" component={CreateQuote} />
      <ProtectedRoute path="/orcamentos/imprimir/:id" component={PrintQuote} />
      <ProtectedRoute path="/relatorios" component={Reports} />
      <ProtectedRoute path="/configuracoes" component={Configuracoes} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TopActionsProvider>
            <Router />
            <Toaster />
          </TopActionsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
