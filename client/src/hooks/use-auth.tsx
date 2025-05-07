import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  resetPasswordRequestMutation: UseMutationResult<{ message: string, token?: string }, Error, { username: string }>;
  resetPasswordMutation: UseMutationResult<{ message: string }, Error, { token: string, newPassword: string }>;
};

type LoginData = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
  email?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo(a), ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registro bem-sucedido",
        description: `Bem-vindo(a), ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout bem-sucedido",
        description: "Sessão encerrada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao sair",
        description: error.message || "Ocorreu um erro ao tentar encerrar sua sessão.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordRequestMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await apiRequest("POST", "/api/reset-password-request", { username });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Solicitação enviada",
        description: "Se o usuário existir, você receberá instruções para redefinir sua senha.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha na solicitação",
        description: error.message || "Ocorreu um erro ao solicitar a redefinição de senha.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", { token, newPassword });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha na redefinição",
        description: error.message || "Ocorreu um erro ao redefinir sua senha. O token pode ser inválido ou ter expirado.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordRequestMutation,
        resetPasswordMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}