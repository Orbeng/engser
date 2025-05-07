import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Printer } from "lucide-react";

export default function PrintQuote() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const quoteId = params.id;
  
  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: [`/api/quotes/${quoteId}`],
  });

  useEffect(() => {
    if (!isQuoteLoading && quote) {
      setIsLoading(false);
    }
  }, [isQuoteLoading, quote]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Orçamento #${quote?.quoteNumber}</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Inter', sans-serif;
                  padding: 20px;
                  color: #1e293b;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  th, td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                  }
                  th {
                    background-color: #f9fafb;
                    font-weight: 600;
                  }
                }
              </style>
            </head>
            <body>
              ${printContents}
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  }
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Format date (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Format currency (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white max-w-4xl mx-auto my-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate("/orcamentos")}
            className="flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para orçamentos
          </button>
          <Button disabled className="bg-primary">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-4 w-36 mb-1" />
              <Skeleton className="h-4 w-40 mb-1" />
            </div>
            <div className="mt-4 md:mt-0">
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-20 mb-1" />
            </div>
          </div>
          
          <Skeleton className="h-32 w-full my-8" />
          <Skeleton className="h-40 w-full my-8" />
          <Skeleton className="h-24 w-full my-8" />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 bg-white max-w-4xl mx-auto my-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate("/orcamentos")}
            className="flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para orçamentos
          </button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Orçamento não encontrado</h2>
          <p className="text-gray-600">O orçamento solicitado não foi encontrado ou não está mais disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate("/orcamentos")}
            className="flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para orçamentos
          </button>
          <Button onClick={handlePrint} className="bg-primary">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
        
        <div ref={printRef} className="print-content">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between border-b pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">EngenhariaApp</h1>
              <p className="mt-1 text-sm text-gray-600">Serviços de Engenharia Profissional</p>
              <p className="mt-4 text-sm">CNPJ: 12.345.678/0001-90</p>
              <p className="text-sm">Av. Engenheiro João Silva, 1000</p>
              <p className="text-sm">São Paulo, SP</p>
              <p className="text-sm">Tel: (11) 3456-7890</p>
              <p className="text-sm">Email: contato@engenhariaapp.com</p>
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
              <div className="inline-block bg-primary-light text-white px-4 py-2 rounded-md mb-2">
                <h2 className="text-xl font-bold">ORÇAMENTO #{quote.quoteNumber}</h2>
              </div>
              <p className="text-sm">Emissão: {formatDate(quote.issueDate)}</p>
              <p className="text-sm">Validade: {formatDate(quote.validUntil)}</p>
              <p className="mt-2 text-sm font-bold">Status: {
                quote.status === "pendente" ? "Pendente" :
                quote.status === "aprovado" ? "Aprovado" :
                "Rejeitado"
              }</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="border-b pb-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Dados do Cliente</h3>
            <p className="font-medium">{quote.company.name}</p>
            <p className="text-sm">CNPJ: {quote.company.cnpj}</p>
            <p className="text-sm">Endereço: {quote.company.address}</p>
            <p className="text-sm">{quote.company.city}, {quote.company.state}</p>
            <p className="text-sm">Contato: {quote.company.contactName}</p>
            <p className="text-sm">Email: {quote.company.email}</p>
            <p className="text-sm">Telefone: {quote.company.phone}</p>
          </div>

          {/* Quote Title and Description */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-bold mb-3">{quote.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">{quote.description}</p>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Itens do Orçamento</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitário</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quote.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatCurrency(parseFloat(item.unitValue))}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(parseFloat(item.totalValue))}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold">VALOR TOTAL:</td>
                    <td className="px-4 py-3 text-right text-lg font-bold">{formatCurrency(parseFloat(quote.totalValue))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t pt-6 text-sm">
            <h3 className="font-bold mb-2">Termos e Condições</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Este orçamento tem validade de 30 dias a partir da data de emissão.</li>
              <li>Os valores apresentados não incluem impostos, exceto quando especificado.</li>
              <li>Condições de pagamento: 50% na aprovação e 50% na conclusão dos serviços.</li>
              <li>O prazo de execução será acordado após a aprovação do orçamento.</li>
              <li>Quaisquer alterações no escopo podem resultar em ajustes nos valores e prazos.</li>
            </ol>
          </div>

          {/* Signature */}
          <div className="mt-10 pt-10 border-t grid grid-cols-2 gap-4">
            <div className="border-t pt-4 mt-16 border-black">
              <p className="text-center text-sm">Cliente: {quote.company.name}</p>
            </div>
            <div className="border-t pt-4 mt-16 border-black">
              <p className="text-center text-sm">EngenhariaApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
