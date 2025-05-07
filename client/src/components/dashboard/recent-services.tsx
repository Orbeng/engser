import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type ServiceStatus = "concluido" | "em_andamento" | "agendado" | "cancelado";

export const statusClasses: Record<ServiceStatus, string> = {
  concluido: "bg-green-100 text-status-success",
  em_andamento: "bg-yellow-100 text-status-warning",
  agendado: "bg-blue-100 text-primary",
  cancelado: "bg-red-100 text-status-error"
};

export const statusLabels: Record<ServiceStatus, string> = {
  concluido: "Concluído",
  em_andamento: "Em andamento",
  agendado: "Agendado",
  cancelado: "Cancelado"
};

export function RecentServices() {
  const { data: recentServices = [], isLoading } = useQuery({
    queryKey: ['/api/services/recent'],
  }) as { data: any[] | undefined, isLoading: boolean };

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Serviços Recentes</h2>
          <Link href="/servicos" className="text-primary text-sm hover:underline">
            Ver todos
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-neutral-dark border-b border-gray-200">
                <th className="pb-3 font-medium">ART</th>
                <th className="pb-3 font-medium">Descrição</th>
                <th className="pb-3 font-medium">Empresa</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : recentServices && recentServices.length > 0 ? (
                recentServices.map((service: any) => (
                  <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-sm">{service.art}</td>
                    <td className="py-3 pr-4 text-sm">{service.description}</td>
                    <td className="py-3 pr-4 text-sm">{service.company.name}</td>
                    <td className="py-3 pr-4 text-sm">{formatDate(service.serviceDate)}</td>
                    <td className="py-3 pr-4 text-sm">{formatCurrency(service.value)}</td>
                    <td className="py-3 pr-4">
                      <span 
                        className={cn(
                          "px-2 py-1 text-xs rounded-full", 
                          statusClasses[service.status as ServiceStatus]
                        )}
                      >
                        {statusLabels[service.status as ServiceStatus]}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-neutral-dark">
                    Nenhum serviço encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
