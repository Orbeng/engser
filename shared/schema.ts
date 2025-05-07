import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: (schema) => schema.min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: (schema) => schema.min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: (schema) => schema.email("E-mail inválido").optional(),
}).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  art: text("art").notNull(),
  description: text("description").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // agendado, em_andamento, concluido, cancelado
  notes: text("notes"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pendente, aprovado, rejeitado
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quote items
export const quoteItems = pgTable("quote_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitValue: decimal("unit_value", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations setup
export const companiesRelations = relations(companies, ({ many }) => ({
  services: many(services),
  quotes: many(quotes),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  company: one(companies, { fields: [services.companyId], references: [companies.id] }),
  quoteItems: many(quoteItems),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  company: one(companies, { fields: [quotes.companyId], references: [companies.id] }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, { fields: [quoteItems.quoteId], references: [quotes.id] }),
  service: one(services, { fields: [quoteItems.serviceId], references: [services.id] }),
}));

// Validation schemas
export const companyInsertSchema = createInsertSchema(companies, {
  name: (schema) => schema.min(2, "Nome deve ter pelo menos 2 caracteres"),
  cnpj: (schema) => schema.min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  contactName: (schema) => schema.min(2, "Nome do contato deve ter pelo menos 2 caracteres"),
  phone: (schema) => schema.min(10, "Telefone inválido"),
  email: (schema) => schema.email("E-mail inválido"),
  address: (schema) => schema.min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: (schema) => schema.min(2, "Cidade deve ter pelo menos 2 caracteres"),
});

export const companySelectSchema = createSelectSchema(companies);
export type CompanyInsert = z.infer<typeof companyInsertSchema>;
export type Company = typeof companies.$inferSelect;

export const serviceInsertSchema = createInsertSchema(services, {
  art: (schema) => schema.min(2, "ART deve ter pelo menos 2 caracteres"),
  description: (schema) => schema.min(5, "Descrição deve ter pelo menos 5 caracteres"),
  value: (schema) => schema.refine(val => parseFloat(val) > 0, "Valor deve ser maior que zero"),
  status: (schema) => schema.refine(
    val => ["agendado", "em_andamento", "concluido", "cancelado"].includes(val),
    "Status inválido"
  ),
});

export const serviceSelectSchema = createSelectSchema(services);
export type ServiceInsert = z.infer<typeof serviceInsertSchema>;
export type Service = typeof services.$inferSelect;

export const quoteInsertSchema = createInsertSchema(quotes, {
  title: (schema) => schema.min(3, "Título deve ter pelo menos 3 caracteres"),
  description: (schema) => schema.min(5, "Descrição deve ter pelo menos 5 caracteres"),
  totalValue: (schema) => schema.refine(val => parseFloat(val) > 0, "Valor total deve ser maior que zero"),
  status: (schema) => schema.refine(
    val => ["pendente", "aprovado", "rejeitado"].includes(val),
    "Status inválido"
  ),
});

export const quoteSelectSchema = createSelectSchema(quotes);
export type QuoteInsert = z.infer<typeof quoteInsertSchema>;
export type Quote = typeof quotes.$inferSelect;

export const quoteItemInsertSchema = createInsertSchema(quoteItems, {
  description: (schema) => schema.min(3, "Descrição deve ter pelo menos 3 caracteres"),
  quantity: (schema) => schema.refine((val: any) => parseInt(String(val)) > 0, "Quantidade deve ser maior que zero"),
  unitValue: (schema) => schema.refine((val: any) => parseFloat(String(val)) > 0, "Valor unitário deve ser maior que zero"),
  totalValue: (schema) => schema.refine((val: any) => parseFloat(String(val)) > 0, "Valor total deve ser maior que zero"),
});

export const quoteItemSelectSchema = createSelectSchema(quoteItems);
export type QuoteItemInsert = z.infer<typeof quoteItemInsertSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;
