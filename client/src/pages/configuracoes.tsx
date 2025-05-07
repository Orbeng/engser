import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "wouter";

const perfilFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }).optional().nullable(),
});

const senhaFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Senha atual é obrigatória" }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(1, { message: "Confirmação de senha é obrigatória" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"]
});

const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.boolean(),
  emailAlerts: z.boolean(),
});

type PerfilFormValues = z.infer<typeof perfilFormSchema>;
type SenhaFormValues = z.infer<typeof senhaFormSchema>;
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export default function Configuracoes() {
  const [tab, setTab] = useState("perfil");
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const perfilForm = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const senhaForm = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: "light",
      notifications: true,
      emailAlerts: false,
    },
  });

  const onPerfilSubmit = (data: PerfilFormValues) => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso.",
    });
  };

  const onSenhaSubmit = (data: SenhaFormValues) => {
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi atualizada com sucesso.",
    });
    senhaForm.reset();
  };

  const onPreferencesSubmit = (data: PreferencesFormValues) => {
    toast({
      title: "Preferências salvas",
      description: "Suas preferências foram salvas com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Configurações</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Opções</CardTitle>
              <CardDescription>Gerencie suas configurações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant={tab === "perfil" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setTab("perfil")}
                >
                  Perfil
                </Button>
                <Button 
                  variant={tab === "senha" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setTab("senha")}
                >
                  Alterar Senha
                </Button>
                <Button 
                  variant={tab === "preferencias" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setTab("preferencias")}
                >
                  Preferências
                </Button>
                <Separator className="my-2" />
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => navigate("/auth")}
                >
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {tab === "perfil" && (
              <Card>
                <CardHeader>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...perfilForm}>
                    <form onSubmit={perfilForm.handleSubmit(onPerfilSubmit)} className="space-y-4">
                      <FormField
                        control={perfilForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={perfilForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input placeholder="seu.email@exemplo.com" type="email" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Salvar alterações</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {tab === "senha" && (
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Atualize sua senha de acesso</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...senhaForm}>
                    <form onSubmit={senhaForm.handleSubmit(onSenhaSubmit)} className="space-y-4">
                      <FormField
                        control={senhaForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha atual</FormLabel>
                            <FormControl>
                              <Input placeholder="Sua senha atual" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={senhaForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova senha</FormLabel>
                            <FormControl>
                              <Input placeholder="Nova senha" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={senhaForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar senha</FormLabel>
                            <FormControl>
                              <Input placeholder="Confirme sua nova senha" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Atualizar senha</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {tab === "preferencias" && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>Personalize sua experiência no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                      <FormField
                        control={preferencesForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Tema</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="light" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Claro
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="dark" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Escuro
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="system" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Sistema
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notificações
                              </FormLabel>
                              <FormDescription>
                                Receber notificações do sistema
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="emailAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Alertas por e-mail
                              </FormLabel>
                              <FormDescription>
                                Receber alertas por e-mail sobre atividades importantes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Salvar preferências</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}