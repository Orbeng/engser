import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  ChevronRight, 
  BarChart4, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Check
} from "lucide-react";

export function QuickSummary() {
  const [summaryType, setSummaryType] = useState("status");
  
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services/all'],
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['/api/quotes/all'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getServicesByStatus = () => {
    if (!services || !Array.isArray(services)) return [];
    
    const emAndamento = services.filter((s: any) => s.status === 'em_andamento').length;
    const concluidos = services.filter((s: any) => s.status === 'concluido').length;
    const agendados = services.filter((s: any) => s.status === 'agendado').length;
    const cancelados = services.filter((s: any) => s.status === 'cancelado').length;
    
    return [
      { name: 'Em andamento', value: emAndamento, color: 'bg-blue-500' },
      { name: 'Concluídos', value: concluidos, color: 'bg-green-500' },
      { name: 'Agendados', value: agendados, color: 'bg-yellow-500' },
      { name: 'Cancelados', value: cancelados, color: 'bg-red-500' }
    ];
  };
  
  const getQuotesByStatus = () => {
    if (!quotes || !Array.isArray(quotes)) return [];
    
    const pendentes = quotes.filter((q: any) => q.status === 'pendente').length;
    const aprovados = quotes.filter((q: any) => q.status === 'aprovado').length;
    const rejeitados = quotes.filter((q: any) => q.status === 'rejeitado').length;
    
    return [
      { name: 'Pendentes', value: pendentes, color: 'bg-yellow-500' },
      { name: 'Aprovados', value: aprovados, color: 'bg-green-500' },
      { name: 'Rejeitados', value: rejeitados, color: 'bg-red-500' }
    ];
  };
  
  const getFinancialSummary = () => {
    if (!quotes || !Array.isArray(quotes) || !services || !Array.isArray(services) || !stats) {
      return {
        totalRevenue: 0,
        pendingQuotesValue: 0,
        activeServicesValue: 0,
        avgQuoteValue: 0
      };
    }
    
    const pendingQuotesValue = quotes
      .filter((q: any) => q.status === 'pendente')
      .reduce((sum: number, q: any) => sum + (parseFloat(q.totalValue) || 0), 0);
      
    const activeServicesValue = services
      .filter((s: any) => s.status === 'em_andamento')
      .reduce((sum: number, s: any) => sum + (parseFloat(s.value) || 0), 0);
      
    const avgQuoteValue = quotes.length > 0
      ? quotes.reduce((sum: number, q: any) => sum + (parseFloat(q.totalValue) || 0), 0) / quotes.length
      : 0;
    
    return {
      totalRevenue: stats.totalRevenue || 0,
      pendingQuotesValue,
      activeServicesValue,
      avgQuoteValue
    };
  };
  
  const getAlerts = () => {
    if (!services || !Array.isArray(services)) return [];
    
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const expiringServices = services.filter((s: any) => {
      try {
        const expiryDate = new Date(s.expiryDate);
        return s.status === 'em_andamento' && expiryDate <= nextMonth && expiryDate >= today;
      } catch (e) {
        return false;
      }
    });
    
    const expiredServices = services.filter((s: any) => {
      try {
        const expiryDate = new Date(s.expiryDate);
        return s.status === 'em_andamento' && expiryDate < today;
      } catch (e) {
        return false;
      }
    });
    
    return [
      { type: 'expiring', count: expiringServices.length, icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
      { type: 'expired', count: expiredServices.length, icon: <AlertTriangle className="h-4 w-4 text-red-500" /> }
    ];
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChart4 className="h-5 w-5 text-primary mr-2" />
            Resumo Rápido
          </CardTitle>
          <Button variant="link" className="text-primary p-0 h-auto flex items-center text-sm" onClick={() => window.location.href = "/relatorios"}>
            Ver relatórios completos <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={summaryType} onValueChange={setSummaryType} className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-3 md:flex md:justify-start">
            <TabsTrigger value="status" className="text-xs sm:text-sm">Status</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs sm:text-sm">Alertas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Serviços por Status</h3>
              {servicesLoading ? (
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getServicesByStatus().map((status, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-normal flex items-center">
                      <div className={`w-2 h-2 rounded-full ${status.color} mr-1.5`}></div>
                      {status.name}: <span className="font-medium ml-1">{status.value}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Orçamentos por Status</h3>
              {quotesLoading ? (
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getQuotesByStatus().map((status, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-normal flex items-center">
                      <div className={`w-2 h-2 rounded-full ${status.color} mr-1.5`}></div>
                      {status.name}: <span className="font-medium ml-1">{status.value}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Atualizado em:</span>
              <span className="flex items-center text-gray-700">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {format(new Date(), "dd/MM/yyyy, HH:mm", { locale: ptBR })}
              </span>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            {statsLoading || quotesLoading || servicesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-gray-50 rounded-md p-2 sm:p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Faturamento total</div>
                    <div className="text-lg sm:text-xl font-semibold">{formatCurrency(getFinancialSummary().totalRevenue)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2 sm:p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Serviços ativos</div>
                    <div className="text-lg sm:text-xl font-semibold">{formatCurrency(getFinancialSummary().activeServicesValue)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2 sm:p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Orçamentos pendentes</div>
                    <div className="text-lg sm:text-xl font-semibold">{formatCurrency(getFinancialSummary().pendingQuotesValue)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2 sm:p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Valor médio por orçamento</div>
                    <div className="text-lg sm:text-xl font-semibold">{formatCurrency(getFinancialSummary().avgQuoteValue)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm text-gray-700">Taxa de aprovação: {
                      quotes && quotes.length > 0 
                        ? Math.round((quotes.filter((q: any) => q.status === 'aprovado').length / quotes.length) * 100)
                        : 0
                    }%</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                    <span className="text-xs sm:text-sm text-gray-700">Taxa de rejeição: {
                      quotes && quotes.length > 0 
                        ? Math.round((quotes.filter((q: any) => q.status === 'rejeitado').length / quotes.length) * 100)
                        : 0
                    }%</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Atualizado em:</span>
              <span className="flex items-center text-gray-700">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {format(new Date(), "dd/MM/yyyy, HH:mm", { locale: ptBR })}
              </span>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            {servicesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-full mr-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Serviços próximos do vencimento</div>
                      <div className="text-sm text-gray-600">Serviços que expiram nos próximos 30 dias</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {getAlerts()[0]?.count || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-full mr-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Serviços vencidos</div>
                      <div className="text-sm text-gray-600">Serviços com data de expiração ultrapassada</div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    {getAlerts()[1]?.count || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Serviços regulares</div>
                      <div className="text-sm text-gray-600">Serviços com documentação em dia</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {Array.isArray(services) ? services.filter((s: any) => 
                      s.status === 'em_andamento' && 
                      new Date(s.expiryDate) > new Date(new Date().setMonth(new Date().getMonth() + 1))
                    ).length : 0}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Atualizado em:</span>
              <span className="flex items-center text-gray-700">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {format(new Date(), "dd/MM/yyyy, HH:mm", { locale: ptBR })}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}