import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceForm, ServiceFormValues } from "@/components/service/service-form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function CreateService() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Get companyId from URL query if it exists
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const companyId = urlParams.get('companyId');

  const defaultValues = companyId 
    ? { companyId } 
    : undefined;

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/services", data);
      
      toast({
        title: "Serviço criado",
        description: "Serviço cadastrado com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      navigate("/servicos");
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      toast({
        title: "Erro ao criar serviço",
        description: "Ocorreu um erro ao cadastrar o serviço. Por favor, tente novamente.",
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
              onClick={() => navigate("/servicos")}
              className="flex items-center text-primary mb-2 hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para serviços
            </button>
            <h1 className="text-2xl font-bold text-neutral-darker">Cadastrar Novo Serviço</h1>
            <p className="text-neutral-dark">Preencha os dados para cadastrar um novo serviço</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <ServiceForm 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
              defaultValues={defaultValues}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
