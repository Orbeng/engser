import { useForm } from "react-hook-form";
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

// Schema for service form
const serviceFormSchema = z.object({
  art: z.string().min(2, "ART deve ter pelo menos 2 caracteres"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  serviceDate: z.string().min(1, "Data do serviço é obrigatória"),
  expiryDate: z.string().min(1, "Validade é obrigatória"),
  value: z.coerce.number().positive("Valor deve ser maior que zero"),
  status: z.enum(["agendado", "em_andamento", "concluido", "cancelado"], {
    required_error: "Status é obrigatório",
  }),
  notes: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormValues) => void;
  isSubmitting?: boolean;
}

export function ServiceForm({ defaultValues, onSubmit, isSubmitting = false }: ServiceFormProps) {
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies/all'],
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      art: defaultValues?.art || "",
      companyId: defaultValues?.companyId || "",
      description: defaultValues?.description || "",
      serviceDate: defaultValues?.serviceDate || new Date().toISOString().substring(0, 10),
      expiryDate: defaultValues?.expiryDate || "",
      value: defaultValues?.value || 0,
      status: defaultValues?.status || "agendado",
      notes: defaultValues?.notes || "",
    },
  });

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="art"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ART <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço <span className="text-destructive">*</span></FormLabel>
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
          
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Serviço <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiryDate"
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
          
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Serviço (R$) <span className="text-destructive">*</span></FormLabel>
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
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={2} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
