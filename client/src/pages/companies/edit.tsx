import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CompanyForm, CompanyFormValues } from "@/components/company/company-form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCompany() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const companyId = params.id;
  
  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
  });

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("PUT", `/api/companies/${companyId}`, data);
      
      toast({
        title: "Empresa atualizada",
        description: "Dados da empresa atualizados com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      navigate("/empresas");
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      toast({
        title: "Erro ao atualizar empresa",
        description: "Ocorreu um erro ao atualizar os dados da empresa. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !company) {
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
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className={i < 2 || i > 5 ? "md:col-span-2" : ""}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-neutral-darker">Editar Empresa</h1>
            <p className="text-neutral-dark">Edite os dados da empresa {company.name}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <CompanyForm 
              defaultValues={company} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
