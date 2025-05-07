import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopActions } from "@/hooks/use-top-actions";

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const isMobile = useMobile();
  const [location, navigate] = useLocation();
  const { showTopActions } = useTopActions();

  return (
    <header className="bg-white shadow-sm p-2 sm:p-4 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button 
          onClick={onMenuToggle}
          className="text-neutral-dark hover:text-primary focus:outline-none md:hidden"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="relative w-36 sm:w-48 md:w-60">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            aria-label="Buscar"
          />
          <div className="absolute left-2 top-1.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {location === "/" && (
          <div className="hidden md:flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => navigate("/empresas/criar")}
              aria-label="Criar empresa"
            >
              <Plus className="h-4 w-4 mr-1 text-primary" />
              <span className="text-xs">Empresa</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => navigate("/servicos/criar")}
              aria-label="Criar serviço"
            >
              <Plus className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-xs">Serviço</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => navigate("/orcamentos/criar")}
              aria-label="Criar orçamento"
            >
              <Plus className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-xs">Orçamento</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex-1 hidden md:flex justify-center">
        <span className="text-lg font-semibold text-primary">EngenhariaApp</span>
      </div>
      
      {location === "/" && isMobile && (
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => navigate("/empresas/criar")}
            aria-label="Criar empresa"
          >
            <Plus className="h-4 w-4 text-primary" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => navigate("/servicos/criar")}
            aria-label="Criar serviço"
          >
            <Plus className="h-4 w-4 text-green-500" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => navigate("/orcamentos/criar")}
            aria-label="Criar orçamento"
          >
            <Plus className="h-4 w-4 text-amber-500" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          className="text-neutral-dark hover:text-primary focus:outline-none"
          aria-label="Notificações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <div className="relative">
          <button 
            className="flex items-center space-x-1 sm:space-x-2 focus:outline-none"
            onClick={() => navigate("/configuracoes")}
            aria-label="Perfil"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="text-xs sm:text-sm">JS</span>
            </div>
            <span className="hidden md:block text-sm font-medium">João Silva</span>
          </button>
        </div>
      </div>
    </header>
  );
}
