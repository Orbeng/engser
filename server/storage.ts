import { db, pool } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, sql, gte, lte, like, or, lt, isNull } from "drizzle-orm";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Configuração da store de sessão
const PostgresSessionStore = connectPg(session);

export const storage = {
  // Armazenamento da sessão
  sessionStore: new PostgresSessionStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true
  }),

  // Usuários
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  },

  async getUser(id: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  },

  async createUser(data: schema.InsertUser) {
    try {
      const validatedData = schema.insertUserSchema.parse(data);
      const [newUser] = await db.insert(schema.users)
        .values({
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Removendo a senha do objeto retornado por segurança
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async updateUserLastLogin(id: number) {
    return await db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
  },

  async storeResetToken(userId: number, token: string, expiry: Date) {
    return await db.update(schema.users)
      .set({ 
        resetToken: token,
        resetTokenExpiry: expiry,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
  },

  async getUserByResetToken(token: string) {
    return await db.query.users.findFirst({
      where: and(
        eq(schema.users.resetToken, token),
        gte(schema.users.resetTokenExpiry, new Date())
      )
    });
  },

  async updateUserPassword(userId: number, hashedPassword: string) {
    return await db.update(schema.users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
  },

  async clearResetToken(userId: number) {
    return await db.update(schema.users)
      .set({ 
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
  },
  // Companies
  async getAllCompanies() {
    return await db.query.companies.findMany({
      orderBy: desc(schema.companies.name),
    });
  },

  async getCompanies(page: number, pageSize: number, search?: string) {
    const offset = (page - 1) * pageSize;
    
    let query = db.select().from(schema.companies);
    
    if (search) {
      query = query.where(
        or(
          like(schema.companies.name, `%${search}%`),
          like(schema.companies.cnpj, `%${search}%`),
          like(schema.companies.contactName, `%${search}%`),
          like(schema.companies.email, `%${search}%`),
          like(schema.companies.city, `%${search}%`)
        )
      );
    }
    
    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.companies)
      .execute()
      .then(result => Number(result[0].count));
    
    const companies = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(schema.companies.name))
      .execute();
      
    return {
      companies,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount
    };
  },

  async getCompanyById(id: number) {
    return await db.query.companies.findFirst({
      where: eq(schema.companies.id, id)
    });
  },

  async createCompany(data: schema.CompanyInsert) {
    try {
      const validatedData = schema.companyInsertSchema.parse(data);
      const [newCompany] = await db.insert(schema.companies)
        .values({
          ...validatedData,
          updatedAt: new Date()
        })
        .returning();
      return newCompany;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async updateCompany(id: number, data: Partial<schema.CompanyInsert>) {
    try {
      const [updatedCompany] = await db.update(schema.companies)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.companies.id, id))
        .returning();
      return updatedCompany;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async deleteCompany(id: number) {
    // Check if the company has related services or quotes
    const relatedServices = await db.query.services.findMany({
      where: eq(schema.services.companyId, id)
    });
    
    const relatedQuotes = await db.query.quotes.findMany({
      where: eq(schema.quotes.companyId, id)
    });

    if (relatedServices.length > 0 || relatedQuotes.length > 0) {
      throw { 
        status: 400, 
        message: "Não é possível excluir a empresa pois existem serviços ou orçamentos vinculados a ela." 
      };
    }

    return await db.delete(schema.companies)
      .where(eq(schema.companies.id, id))
      .returning();
  },

  // Services
  async getAllServices() {
    return await db.query.services.findMany({
      orderBy: desc(schema.services.createdAt),
      with: {
        company: true
      }
    });
  },

  async getServices(page: number, pageSize: number, search?: string, status?: string) {
    const offset = (page - 1) * pageSize;
    
    let query = db.select().from(schema.services).leftJoin(schema.companies, eq(schema.services.companyId, schema.companies.id));
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(schema.services.art, `%${search}%`),
          like(schema.services.description, `%${search}%`),
          like(schema.companies.name, `%${search}%`)
        )
      );
    }
    
    if (status && status !== 'all_statuses') {
      conditions.push(eq(schema.services.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Count total records with filters
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(schema.services)
      .leftJoin(schema.companies, eq(schema.services.companyId, schema.companies.id));
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const totalCount = await countQuery
      .execute()
      .then(result => Number(result[0].count));
    
    // Get paginated services with company information
    const servicesWithCompany = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(schema.services.createdAt))
      .execute();
    
    // Transform joined result to nested structure
    const services = servicesWithCompany.map(row => ({
      ...row.services,
      company: row.companies
    }));
    
    return {
      services,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount
    };
  },

  async getServiceById(id: number) {
    return await db.query.services.findFirst({
      where: eq(schema.services.id, id),
      with: {
        company: true
      }
    });
  },

  async getRecentServices(limit = 5) {
    return await db.query.services.findMany({
      limit,
      orderBy: desc(schema.services.createdAt),
      with: {
        company: true
      }
    });
  },

  async getUpcomingDeadlines(limit = 3) {
    return await db.query.services.findMany({
      where: and(
        gte(schema.services.expiryDate, new Date()),
        lt(schema.services.expiryDate, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // Within next 30 days
      ),
      orderBy: schema.services.expiryDate,
      limit,
      with: {
        company: true
      }
    });
  },

  async createService(data: schema.ServiceInsert) {
    try {
      const validatedData = schema.serviceInsertSchema.parse(data);
      const [newService] = await db.insert(schema.services)
        .values({
          ...validatedData,
          updatedAt: new Date()
        })
        .returning();
      return newService;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async updateService(id: number, data: Partial<schema.ServiceInsert>) {
    try {
      const [updatedService] = await db.update(schema.services)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.services.id, id))
        .returning();
      return updatedService;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async deleteService(id: number) {
    // Check if the service is used in any quotes
    const relatedQuoteItems = await db.query.quoteItems.findMany({
      where: eq(schema.quoteItems.serviceId, id)
    });

    if (relatedQuoteItems.length > 0) {
      throw { 
        status: 400, 
        message: "Não é possível excluir o serviço pois ele está vinculado a orçamentos." 
      };
    }

    return await db.delete(schema.services)
      .where(eq(schema.services.id, id))
      .returning();
  },

  // Quotes
  async getAllQuotes() {
    return await db.query.quotes.findMany({
      orderBy: desc(schema.quotes.createdAt),
      with: {
        company: true
      }
    });
  },

  async getQuotes(page: number, pageSize: number, search?: string, status?: string) {
    const offset = (page - 1) * pageSize;
    
    let query = db.select().from(schema.quotes).leftJoin(schema.companies, eq(schema.quotes.companyId, schema.companies.id));
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(schema.quotes.quoteNumber, `%${search}%`),
          like(schema.quotes.title, `%${search}%`),
          like(schema.companies.name, `%${search}%`)
        )
      );
    }
    
    if (status && status !== 'all_statuses') {
      conditions.push(eq(schema.quotes.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Count total records with filters
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(schema.quotes)
      .leftJoin(schema.companies, eq(schema.quotes.companyId, schema.companies.id));
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const totalCount = await countQuery
      .execute()
      .then(result => Number(result[0].count));
    
    // Get paginated quotes with company information
    const quotesWithCompany = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(schema.quotes.createdAt))
      .execute();
    
    // Transform joined result to nested structure
    const quotes = quotesWithCompany.map(row => ({
      ...row.quotes,
      company: row.companies
    }));
    
    return {
      quotes,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount
    };
  },

  async getQuoteById(id: number) {
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, id),
      with: {
        company: true,
        items: {
          with: {
            service: true
          }
        }
      }
    });
    
    return quote;
  },

  async createQuote(data: schema.QuoteInsert, items: schema.QuoteItemInsert[]) {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Generate a quote number
        const quoteNumber = `ORC-${Date.now().toString().substring(7)}`;
        
        // Create the quote
        const [newQuote] = await tx.insert(schema.quotes)
          .values({
            ...data,
            quoteNumber,
            updatedAt: new Date()
          })
          .returning();
        
        // Create all quote items
        if (items.length > 0) {
          const itemsWithQuoteId = items.map(item => ({
            ...item,
            quoteId: newQuote.id,
            updatedAt: new Date()
          }));
          
          await tx.insert(schema.quoteItems)
            .values(itemsWithQuoteId);
        }
        
        return newQuote;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async updateQuote(id: number, data: Partial<schema.QuoteInsert>, items?: schema.QuoteItemInsert[]) {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Update the quote
        const [updatedQuote] = await tx.update(schema.quotes)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(schema.quotes.id, id))
          .returning();
        
        // If items are provided, delete old items and create new ones
        if (items) {
          // Delete existing items
          await tx.delete(schema.quoteItems)
            .where(eq(schema.quoteItems.quoteId, id));
          
          // Create new items
          if (items.length > 0) {
            const itemsWithQuoteId = items.map(item => ({
              ...item,
              quoteId: id,
              updatedAt: new Date()
            }));
            
            await tx.insert(schema.quoteItems)
              .values(itemsWithQuoteId);
          }
        }
        
        return updatedQuote;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw { status: 400, message: "Dados inválidos", errors: error.errors };
      }
      throw error;
    }
  },

  async deleteQuote(id: number) {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Delete all quote items first
        await tx.delete(schema.quoteItems)
          .where(eq(schema.quoteItems.quoteId, id));
        
        // Then delete the quote
        const deletedQuote = await tx.delete(schema.quotes)
          .where(eq(schema.quotes.id, id))
          .returning();
        
        return deletedQuote;
      });
    } catch (error) {
      throw error;
    }
  },

  // Dashboard
  async getDashboardStats() {
    const totalCompanies = await db.select({ count: sql<number>`count(*)` })
      .from(schema.companies)
      .execute()
      .then(result => Number(result[0].count));
    
    const activeServices = await db.select({ count: sql<number>`count(*)` })
      .from(schema.services)
      .where(eq(schema.services.status, "em_andamento"))
      .execute()
      .then(result => Number(result[0].count));
    
    const totalQuotes = await db.select({ count: sql<number>`count(*)` })
      .from(schema.quotes)
      .execute()
      .then(result => Number(result[0].count));
    
    const totalRevenue = await db.select({ total: sql<string>`COALESCE(SUM(value), 0)` })
      .from(schema.services)
      .where(eq(schema.services.status, "concluido"))
      .execute()
      .then(result => parseFloat(result[0].total || "0"));
    
    return {
      totalCompanies,
      activeServices,
      totalQuotes,
      totalRevenue
    };
  }
};
