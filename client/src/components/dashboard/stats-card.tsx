import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string; 
  iconColor: string;
  changePercentage?: number;
  changeText?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercentage,
  changeText = "desde o último mês"
}: StatsCardProps) {
  const isPositiveChange = changePercentage && changePercentage > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-dark text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={cn("p-1.5 sm:p-2 rounded-lg", iconBgColor)}>
          <div className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
      {changePercentage !== undefined && (
        <div className="mt-3 sm:mt-4 flex flex-wrap sm:flex-nowrap items-center">
          <span 
            className={cn(
              "flex items-center text-xs sm:text-sm",
              isPositiveChange ? "text-status-success" : "text-status-error"
            )}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 sm:h-4 sm:w-4 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              {isPositiveChange ? (
                <path 
                  fillRule="evenodd" 
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                  clipRule="evenodd" 
                />
              ) : (
                <path 
                  fillRule="evenodd" 
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" 
                  clipRule="evenodd" 
                />
              )}
            </svg>
            {Math.abs(changePercentage)}%
          </span>
          <span className="text-neutral-medium text-xs sm:text-sm ml-2">{changeText}</span>
        </div>
      )}
    </div>
  );
}
