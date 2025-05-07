import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QuoteForm, QuoteFormValues } from "@/components/quote/quote-form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function CreateQuote() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Get parameters from URL query
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const companyId = urlParams.get('companyId');
  const serviceId = urlParams.get('serviceId');

  // If serviceId is provided, fetch the service details
  const { data: service } = useQuery({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId // Only run query if serviceId exists
  });

  // Prepare default values based on URL parameters
  const defaultValues: Partial<QuoteFormValues> = {};

  if (companyId) {
    defaultValues.companyId = companyId;
  }
  
  // If service data is loaded, add it as the first item
  if (service) {
    defaultValues.companyId = service.companyId.toString();
    defaultValues.items = [
      {
        description: service.description,
        quantity: 1,
        unitValue: parseFloat(service.value),
        serviceId: service.id.toString()
      }
    ];
  }

  // Set default dates
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 30); // Default validity: 30 days
  
  defaultValues.issueDate = today.toISOString().substring(0, 10);
  defaultValues.validUntil = validUntil.toISOString().substring(0, 10);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare data structure expected by the API
      const quoteData = {
        quote: {
          title: data.title,
          description: data.description,
          issueDate: data.issueDate,
          validUntil: data.validUntil,
          companyId: parseInt(data.companyId),
          totalValue: data.totalValue,
          status: data.status,
        },
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
          totalValue: item.quantity * item.unitValue,
          serviceId: item.serviceId ? parseInt(item.serviceId) : null,
        }))
      };

      await apiRequest("POST", "/api/quotes", quoteData);
      
      toast({
        title: "Orçamento criado",
        description: "Orçamento cadastrado com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate("/orcamentos");
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast({
        title: "Erro ao criar orçamento",
        description: "Ocorreu um erro ao cadastrar o orçamento. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
      
      <div className={`flex-1 transition-all ${sidebarExpanded ? "ml-0 md:ml-64" : "ml-0"}`}>
        <Topbar onMenuToggle={toggleSidebar} />
        
        <main className="p-4 md:p-6 bg-gray-100">
          <div className="mb-6">
            <button 
              onClick={() => navigate("/orcamentos")}
              className="flex items-center text-primary mb-2 hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para orçamentos
            </button>
            <h1 className="text-2xl font-bold text-neutral-darker">Criar Novo Orçamento</h1>
            <p className="text-neutral-dark">Preencha os dados para gerar um novo orçamento</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <QuoteForm 
              defaultValues={defaultValues}
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
