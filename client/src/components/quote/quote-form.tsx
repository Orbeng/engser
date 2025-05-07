import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash, Plus } from "lucide-react";
import { QuotePreview } from "./quote-preview";

// Schema for quote form
const quoteFormSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  validUntil: z.string().min(1, "Data de validade é obrigatória"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  status: z.enum(["pendente", "aprovado", "rejeitado"], {
    required_error: "Status é obrigatório",
  }),
  items: z.array(z.object({
    description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
    quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    unitValue: z.coerce.number().positive("Valor unitário deve ser maior que zero"),
    serviceId: z.string().optional(),
  })).min(1, "Adicione pelo menos um item ao orçamento")
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  defaultValues?: Partial<QuoteFormValues>;
  onSubmit: (data: QuoteFormValues) => void;
  isSubmitting?: boolean;
}

export function QuoteForm({ defaultValues, onSubmit, isSubmitting = false }: QuoteFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<QuoteFormValues | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies/all'],
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services/all'],
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      issueDate: defaultValues?.issueDate || new Date().toISOString().substring(0, 10),
      validUntil: defaultValues?.validUntil || "",
      companyId: defaultValues?.companyId || "",
      status: defaultValues?.status || "pendente",
      items: defaultValues?.items || [
        {
          description: "",
          quantity: 1,
          unitValue: 0,
          serviceId: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate total value
  const calculateTotal = () => {
    const items = form.getValues("items");
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitValue);
    }, 0);
  };

  // Helper function to format currency (BRL)
  const formatCurrency = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Convert to number (in cents)
    const cents = parseInt(digits, 10);
    
    if (isNaN(cents)) return "";
    
    // Convert cents to reais with 2 decimal places
    return (cents / 100).toFixed(2);
  };

  // When a service is selected, update the item description and value
  const handleServiceChange = (serviceId: string, index: number) => {
    if (!serviceId || serviceId === "") {
      form.setValue(`items.${index}.description`, "");
      form.setValue(`items.${index}.unitValue`, 0);
      return;
    }

    const service = services?.find((s: any) => s.id.toString() === serviceId);
    if (service) {
      form.setValue(`items.${index}.description`, service.description);
      form.setValue(`items.${index}.unitValue`, parseFloat(service.value));
    }
  };

  const handlePreview = () => {
    const isValid = form.trigger();
    if (isValid) {
      setPreviewData(form.getValues());
      setShowPreview(true);
    }
  };

  const handleFormSubmit = (data: QuoteFormValues) => {
    // Calculate total value before submitting
    const totalValue = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitValue);
    }, 0);

    // Add totalValue to the data
    onSubmit({
      ...data,
      // @ts-ignore - adding totalValue to the form data
      totalValue
    });
  };

  const selectedCompany = companies?.find(
    (company: any) => company.id.toString() === form.watch("companyId")
  );

  return (
    <>
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pré-visualização do Orçamento</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)} className="h-8 w-8 p-0">
                <span className="sr-only">Fechar</span>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <QuotePreview
                quote={previewData}
                company={selectedCompany}
                totalValue={calculateTotal()}
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Voltar para edição
              </Button>
              <Button onClick={() => form.handleSubmit(handleFormSubmit)()}>
                {isSubmitting ? "Salvando..." : "Confirmar e Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                  {isLoadingCompanies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies && companies.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Itens do Orçamento</h3>
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
                  <div className="col-span-12 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.serviceId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serviço</FormLabel>
                          {isLoadingServices ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleServiceChange(value, index);
                              }} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um serviço (opcional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Serviço personalizado</SelectItem>
                                {services && services.map((service: any) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.art} - {service.description.substring(0, 30)}
                                    {service.description.length > 30 ? '...' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "1" : e.target.value;
                                field.onChange(parseInt(value, 10));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Unitário <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0,00"
                              value={field.value === 0 ? "" : field.value}
                              onChange={(e) => {
                                const formatted = formatCurrency(e.target.value);
                                field.onChange(formatted === "" ? 0 : parseFloat(formatted));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-10 w-10"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remover item</span>
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, unitValue: 0, serviceId: "" })}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Valor Total do Orçamento:</span>
              <span className="ml-2 text-xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(calculateTotal())}
              </span>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancelar
              </Button>
              <Button type="button" variant="secondary" onClick={handlePreview}>
                Pré-visualizar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Orçamento"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
