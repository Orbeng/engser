import { useLocation } from "wouter";

export function QuickActions() {
  const [location, navigate] = useLocation();

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Ações Rápidas</h2>
      </div>
      <div className="p-6 space-y-4">
        <button 
          onClick={() => navigate("/empresas/criar")}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-3 font-medium">Nova Empresa</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => navigate("/servicos/criar")}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-3 font-medium">Novo Serviço</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => navigate("/orcamentos/criar")}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-warning" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-3 font-medium">Novo Orçamento</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => navigate("/relatorios")}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-2a1 1 0 10-2 0v1a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-3 font-medium">Gerar Relatório</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => navigate("/servicos")}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm1 8a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-3 font-medium">Serviços Recentes</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
