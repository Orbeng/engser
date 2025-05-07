import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentServices } from "@/components/dashboard/recent-services";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { QuickSummary } from "@/components/dashboard/quick-summary";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
      
      <div className={`flex-1 transition-all ${sidebarExpanded ? "ml-0 md:ml-64" : "ml-0"}`}>
        <Topbar onMenuToggle={toggleSidebar} />
        
        <main className="p-4 md:p-6 bg-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-darker">Dashboard</h1>
            <p className="text-neutral-dark">Visão geral dos serviços de engenharia</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoadingStats ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-8 w-1/3" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32 ml-2" />
                  </div>
                </div>
              ))
            ) : stats ? (
              <>
                <StatsCard
                  title="Total de Empresas"
                  value={stats.totalCompanies || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  }
                  iconBgColor="bg-blue-100"
                  iconColor="text-primary"
                  changePercentage={8.2}
                />
                
                <StatsCard
                  title="Serviços Ativos"
                  value={stats.activeServices || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-status-success" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  }
                  iconBgColor="bg-green-100"
                  iconColor="text-status-success"
                  changePercentage={12.5}
                />
                
                <StatsCard
                  title="Orçamentos"
                  value={stats.totalQuotes || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-status-warning" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  }
                  iconBgColor="bg-yellow-100" 
                  iconColor="text-status-warning"
                  changePercentage={-3.8}
                />
                
                <StatsCard
                  title="Faturamento"
                  value={new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(stats.totalRevenue || 0)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  }
                  iconBgColor="bg-blue-100"
                  iconColor="text-primary"
                  changePercentage={14.2}
                />
              </>
            ) : null}
          </div>

          <QuickSummary />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentServices />
            </div>

            <div className="lg:col-span-1">
              <QuickActions />
              <UpcomingDeadlines />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
