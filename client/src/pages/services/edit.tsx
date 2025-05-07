import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceForm, ServiceFormValues } from "@/components/service/service-form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditService() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const serviceId = params.id;
  
  const { data: service, isLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}`],
  });

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("PUT", `/api/services/${serviceId}`, data);
      
      toast({
        title: "Serviço atualizado",
        description: "Dados do serviço atualizados com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] });
      navigate("/servicos");
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar os dados do serviço. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !service) {
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
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(7).fill(0).map((_, i) => (
                  <div key={i} className={i === 2 || i === 6 ? "md:col-span-2" : ""}>
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

  // Transform service data to match form structure
  const formDefaultValues = {
    ...service,
    companyId: service.companyId.toString(),
    serviceDate: new Date(service.serviceDate).toISOString().substring(0, 10),
    expiryDate: new Date(service.expiryDate).toISOString().substring(0, 10)
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
            <h1 className="text-2xl font-bold text-neutral-darker">Editar Serviço</h1>
            <p className="text-neutral-dark">Edite os dados do serviço</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <ServiceForm 
              defaultValues={formDefaultValues} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
