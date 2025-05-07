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
  const [_, navigate] = useLocation();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuToggle}
          className="text-neutral-dark hover:text-primary focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative w-48 md:w-60">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="hidden md:flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => navigate("/empresas/criar")}
          >
            <Plus className="h-4 w-4 mr-1 text-primary" />
            <span className="text-xs">Empresa</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => navigate("/servicos/criar")}
          >
            <Plus className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-xs">Serviço</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => navigate("/orcamentos/criar")}
          >
            <Plus className="h-4 w-4 mr-1 text-amber-500" />
            <span className="text-xs">Orçamento</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 hidden md:flex justify-center">
        <span className="text-lg font-semibold text-primary">EngenhariaApp</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-neutral-dark hover:text-primary focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <div className="relative">
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => navigate("/configuracoes")}
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span>JS</span>
            </div>
            <span className="hidden md:block text-sm font-medium">João Silva</span>
          </button>
        </div>
      </div>
    </header>
  );
}
