import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").optional(),
});

const resetPasswordRequestSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a nova senha"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetPasswordRequestFormValues = z.infer<typeof resetPasswordRequestSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const [tab, setTab] = useState<string>("login");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const {
    user,
    isLoading,
    loginMutation,
    registerMutation,
    resetPasswordRequestMutation,
    resetPasswordMutation
  } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });

  // Formulário de solicitação de redefinição de senha
  const resetPasswordRequestForm = useForm<ResetPasswordRequestFormValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      username: "",
    },
  });

  // Formulário de redefinição de senha
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  const onResetPasswordRequestSubmit = (data: ResetPasswordRequestFormValues) => {
    resetPasswordRequestMutation.mutate(data, {
      onSuccess: (response) => {
        // Em ambiente de desenvolvimento, permitimos mostrar o token para teste
        if (response.token) {
          setResetToken(response.token);
          resetPasswordForm.setValue("token", response.token);
        }
        setShowResetForm(true);
      },
    });
  };

  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(
      { token: data.token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setShowResetForm(false);
          setResetToken(null);
          setTab("login");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-5xl shadow-xl rounded-xl overflow-hidden">
        {/* Área de formulário */}
        <div className="bg-white p-6 w-full md:w-1/2 flex flex-col justify-center">
          {showResetForm ? (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Redefinir senha</CardTitle>
                <CardDescription>
                  Digite o token recebido e crie uma nova senha para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...resetPasswordForm}>
                  <form
                    onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={resetPasswordForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o token recebido"
                              {...field}
                              disabled={!!resetToken}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetPasswordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite sua nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirme a senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirme sua nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowResetForm(false);
                          setResetToken(null);
                        }}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                      >
                        {resetPasswordMutation.isPending
                          ? "Redefinindo..."
                          : "Redefinir senha"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              defaultValue="login"
              value={tab}
              onValueChange={setTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registro</TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Faça login para acessar o sistema de gestão de serviços de engenharia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite seu nome de usuário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Digite sua senha"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  Manter conectado
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button
                            variant="link"
                            type="button"
                            className="text-sm px-0"
                            onClick={() => {
                              resetPasswordRequestForm.reset();
                              setShowResetForm(true);
                            }}
                          >
                            Esqueceu a senha?
                          </Button>
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Entrando..." : "Entrar"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Registro */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar conta</CardTitle>
                    <CardDescription>
                      Registre-se para acessar o sistema de gestão de serviços de engenharia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite seu nome completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Escolha um nome de usuário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail (opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Digite seu e-mail"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Crie uma senha segura"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Registrando..." : "Registrar"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Formulário de solicitação de redefinição de senha */}
          {showResetForm && !resetToken && (
            <Card className="w-full mt-4">
              <CardHeader>
                <CardTitle>Recuperação de senha</CardTitle>
                <CardDescription>
                  Informe seu nome de usuário para receber instruções de recuperação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...resetPasswordRequestForm}>
                  <form
                    onSubmit={resetPasswordRequestForm.handleSubmit(
                      onResetPasswordRequestSubmit
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={resetPasswordRequestForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetForm(false)}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetPasswordRequestMutation.isPending}
                      >
                        {resetPasswordRequestMutation.isPending
                          ? "Enviando..."
                          : "Solicitar recuperação"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Área de hero/banner */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary to-blue-600 p-8 text-white">
          <div className="h-full flex flex-col justify-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">
              Sistema de Gestão de Serviços de Engenharia
            </h1>
            <div className="space-y-4 mb-8">
              <p className="text-white/90">
                Gerencie seus serviços de engenharia de forma prática e eficiente:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-xs mr-2">
                    ✓
                  </span>
                  <span>Cadastro de empresas e serviços</span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-xs mr-2">
                    ✓
                  </span>
                  <span>Geração de orçamentos para clientes</span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-xs mr-2">
                    ✓
                  </span>
                  <span>Controle de ARTs e prazos de validade</span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-xs mr-2">
                    ✓
                  </span>
                  <span>Relatórios e estatísticas de serviços</span>
                </li>
              </ul>
            </div>
            <Separator className="bg-white/20 my-6" />
            <p className="text-white/80 text-sm text-center">
              Acesse sua conta ou crie um novo registro para começar a utilizar o sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}