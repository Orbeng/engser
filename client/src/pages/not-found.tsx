import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [location, navigate] = useLocation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Página Não Encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            A página que você está procurando não foi encontrada.
          </p>
          
          <div className="mt-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-primary hover:underline"
            >
              <Home className="h-4 w-4 mr-1" />
              Voltar para Dashboard
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
