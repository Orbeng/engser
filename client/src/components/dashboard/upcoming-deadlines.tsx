import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UpcomingDeadlines() {
  const { data: upcomingDeadlines, isLoading } = useQuery({
    queryKey: ['/api/services/upcoming-deadlines'],
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  function getDaysRemaining(expiryDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  function getDeadlineColor(daysRemaining: number) {
    if (daysRemaining <= 7) return "bg-red-100 text-status-error";
    if (daysRemaining <= 15) return "bg-yellow-100 text-status-warning";
    return "bg-blue-100 text-primary";
  }
  
  function getDeadlineIconColor(daysRemaining: number) {
    if (daysRemaining <= 7) return "text-status-error";
    if (daysRemaining <= 15) return "text-status-warning";
    return "text-primary";
  }
  
  function getDeadlineIconBg(daysRemaining: number) {
    if (daysRemaining <= 7) return "bg-red-100";
    if (daysRemaining <= 15) return "bg-yellow-100";
    return "bg-blue-100";
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Próximos Vencimentos</h2>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <li key={index} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </li>
            ))
          ) : upcomingDeadlines && upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((deadline: any) => {
              const daysRemaining = getDaysRemaining(deadline.expiryDate);
              return (
                <li key={deadline.id} className="flex items-center space-x-3">
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                    getDeadlineIconBg(daysRemaining)
                  )}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={cn("h-5 w-5", getDeadlineIconColor(daysRemaining))}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{deadline.description}</p>
                    <p className="text-sm text-neutral-medium">
                      {deadline.company.name} - {formatDate(deadline.expiryDate)}
                    </p>
                  </div>
                  <div>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getDeadlineColor(daysRemaining)
                    )}>
                      {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-center py-4 text-neutral-dark">
              Nenhum vencimento próximo
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
