import { QuoteFormValues } from "./quote-form";

interface QuotePreviewProps {
  quote: QuoteFormValues;
  company: any;
  totalValue: number;
}

export function QuotePreview({ quote, company, totalValue }: QuotePreviewProps) {
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

  if (!company) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        Empresa não encontrada. Por favor, selecione uma empresa válida.
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex flex-col">
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
              <h2 className="text-xl font-bold">ORÇAMENTO</h2>
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
          <p className="font-medium">{company.name}</p>
          <p className="text-sm">CNPJ: {company.cnpj}</p>
          <p className="text-sm">Endereço: {company.address}</p>
          <p className="text-sm">{company.city}, {company.state}</p>
          <p className="text-sm">Contato: {company.contactName}</p>
          <p className="text-sm">Email: {company.email}</p>
          <p className="text-sm">Telefone: {company.phone}</p>
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
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.unitValue)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(item.quantity * item.unitValue)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold">VALOR TOTAL:</td>
                  <td className="px-4 py-3 text-right text-lg font-bold">{formatCurrency(totalValue)}</td>
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
            <p className="text-center text-sm">Cliente: {company.name}</p>
          </div>
          <div className="border-t pt-4 mt-16 border-black">
            <p className="text-center text-sm">EngenhariaApp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
