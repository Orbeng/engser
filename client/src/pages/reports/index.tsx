import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Usando imagens para simular gráficos
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FilePieChart, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const [reportType, setReportType] = useState("services");
  const [period, setPeriod] = useState("mes");

  // Dados para os relatórios
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services/all'],
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['/api/quotes/all'],
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies/all'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Preparar dados para gráficos
  const getServicesData = () => {
    if (!services) return [];
    
    // Mock data para o gráfico de serviços por mês
    return [
      { name: 'Jan/2023', value: 5 },
      { name: 'Fev/2023', value: 7 },
      { name: 'Mar/2023', value: 3 },
      { name: 'Abr/2023', value: 8 },
      { name: 'Mai/2023', value: 12 },
      { name: 'Jun/2023', value: 9 }
    ];
  };

  const getQuotesData = () => {
    if (!quotes) return {};
    
    // Dados para o gráfico de status de orçamentos
    const pendentes = quotes.filter((q: any) => q.status === 'pendente').length || 0;
    const aprovados = quotes.filter((q: any) => q.status === 'aprovado').length || 0;
    const rejeitados = quotes.filter((q: any) => q.status === 'rejeitado').length || 0;
    
    return [
      { name: 'Pendentes', value: pendentes },
      { name: 'Aprovados', value: aprovados },
      { name: 'Rejeitados', value: rejeitados }
    ];
  };

  const getFinancialData = () => {
    if (!quotes || !companies) return [];
    
    // Dados para o gráfico de faturamento por empresa (top 5)
    const financialByCompany: Record<string, number> = {};
    
    quotes.forEach((quote: any) => {
      if (quote.status === 'aprovado' && quote.companyId) {
        const companyId = quote.companyId.toString();
        if (!financialByCompany[companyId]) {
          financialByCompany[companyId] = 0;
        }
        financialByCompany[companyId] += parseFloat(quote.totalValue || 0);
      }
    });
    
    return Object.entries(financialByCompany)
      .map(([companyId, value]) => {
        const company = companies.find((c: any) => c.id.toString() === companyId);
        return {
          name: company ? company.name : 'Desconhecida',
          value
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Visualize dados e estatísticas sobre os serviços e orçamentos</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar relatório
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Período</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
                <SelectItem value="todos">Todos os tempos</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium flex items-center gap-2">
              <FilePieChart className="h-4 w-4 text-primary" />
              <span>Tipo de relatório</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="services">Serviços</SelectItem>
                <SelectItem value="quotes">Orçamentos</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Atualizado em</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={reportType} value={reportType} onValueChange={setReportType}>
        <TabsList className="mb-6">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="quotes">Orçamentos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Serviços por mês</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {servicesLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <img 
                      src="https://placehold.co/600x300/e2e8f0/475569?text=Gráfico+de+Serviços&font=roboto" 
                      alt="Gráfico de Serviços"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Serviços ativos</p>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.activeServices || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serviços concluídos</p>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.completedServices || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Próximos a vencer</p>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.expiringServices || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ART</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : !services || services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Nenhum serviço encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service: any) => (
                        <TableRow key={service.id}>
                          <TableCell>{service.art}</TableCell>
                          <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                          <TableCell>{formatDate(service.serviceDate)}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(service.value))}</TableCell>
                          <TableCell>{service.status}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Status dos orçamentos</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {quotesLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <img 
                      src="https://placehold.co/600x300/e2e8f0/475569?text=Gráfico+de+Orçamentos&font=roboto" 
                      alt="Gráfico de Orçamentos"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total de orçamentos</p>
                    <p className="text-2xl font-bold">
                      {quotes?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taxa de aprovação</p>
                    <p className="text-2xl font-bold">
                      {quotes && quotes.length > 0 
                        ? Math.round((quotes.filter((q: any) => q.status === 'aprovado').length / quotes.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valor médio</p>
                    <p className="text-2xl font-bold">
                      {quotes && quotes.length > 0
                        ? formatCurrency(quotes.reduce((sum: number, q: any) => sum + (parseFloat(q.totalValue) || 0), 0) / quotes.length)
                        : formatCurrency(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotesLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : !quotes || quotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Nenhum orçamento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotes.map((quote: any) => (
                        <TableRow key={quote.id}>
                          <TableCell>{quote.quoteNumber}</TableCell>
                          <TableCell className="max-w-xs truncate">{quote.title}</TableCell>
                          <TableCell>{formatDate(quote.issueDate)}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(quote.totalValue || 0))}</TableCell>
                          <TableCell>
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${quote.status === 'aprovado' ? 'bg-green-100 text-green-800' : 
                                  quote.status === 'rejeitado' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}
                            >
                              {quote.status === 'aprovado' ? 'Aprovado' : 
                                quote.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Faturamento por empresa (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {quotesLoading || companiesLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <img 
                      src="https://placehold.co/600x300/e2e8f0/475569?text=Gráfico+Financeiro&font=roboto" 
                      alt="Gráfico Financeiro"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Faturamento total</p>
                    <p className="text-2xl font-bold">
                      {quotes 
                        ? formatCurrency(quotes
                            .filter((q: any) => q.status === 'aprovado')
                            .reduce((sum: number, q: any) => sum + (parseFloat(q.totalValue) || 0), 0))
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serviços ativos (valor)</p>
                    <p className="text-2xl font-bold">
                      {services 
                        ? formatCurrency(services
                            .filter((s: any) => s.status === 'em_andamento')
                            .reduce((sum: number, s: any) => sum + (parseFloat(s.value) || 0), 0))
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Orçamentos pendentes</p>
                    <p className="text-2xl font-bold">
                      {quotes 
                        ? formatCurrency(quotes
                            .filter((q: any) => q.status === 'pendente')
                            .reduce((sum: number, q: any) => sum + (parseFloat(q.totalValue) || 0), 0))
                        : formatCurrency(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}