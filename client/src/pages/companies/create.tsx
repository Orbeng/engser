import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CompanyForm, CompanyFormValues } from "@/components/company/company-form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function CreateCompany() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/companies", data);
      
      toast({
        title: "Empresa criada",
        description: "Empresa cadastrada com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      navigate("/empresas");
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toast({
        title: "Erro ao criar empresa",
        description: "Ocorreu um erro ao cadastrar a empresa. Por favor, tente novamente.",
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
              onClick={() => navigate("/empresas")}
              className="flex items-center text-primary mb-2 hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para empresas
            </button>
            <h1 className="text-2xl font-bold text-neutral-darker">Cadastrar Nova Empresa</h1>
            <p className="text-neutral-dark">Preencha os dados para cadastrar uma nova empresa</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <CompanyForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
          </div>
        </main>
      </div>
    </div>
  );
}
