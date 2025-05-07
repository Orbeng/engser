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
import { ThemeProvider } from "@/components/ui/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/empresas" component={Companies} />
      <Route path="/empresas/criar" component={CreateCompany} />
      <Route path="/empresas/editar/:id" component={EditCompany} />
      <Route path="/servicos" component={Services} />
      <Route path="/servicos/criar" component={CreateService} />
      <Route path="/servicos/editar/:id" component={EditService} />
      <Route path="/orcamentos" component={Quotes} />
      <Route path="/orcamentos/criar" component={CreateQuote} />
      <Route path="/orcamentos/imprimir/:id" component={PrintQuote} />
      <Route path="/relatorios" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
