import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { serviceInsertSchema, companyInsertSchema, quoteInsertSchema, quoteItemInsertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Dashboard stats
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas do dashboard" });
    }
  });

  // Recent services for dashboard
  app.get(`${apiPrefix}/services/recent`, async (req, res) => {
    try {
      const recentServices = await storage.getRecentServices();
      res.json(recentServices);
    } catch (error) {
      console.error("Error fetching recent services:", error);
      res.status(500).json({ message: "Erro ao buscar serviços recentes" });
    }
  });

  // Upcoming deadlines for dashboard
  app.get(`${apiPrefix}/services/upcoming-deadlines`, async (req, res) => {
    try {
      const upcomingDeadlines = await storage.getUpcomingDeadlines();
      res.json(upcomingDeadlines);
    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error);
      res.status(500).json({ message: "Erro ao buscar vencimentos próximos" });
    }
  });

  // Company endpoints
  app.get(`${apiPrefix}/companies/all`, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching all companies:", error);
      res.status(500).json({ message: "Erro ao buscar empresas" });
    }
  });

  app.get(`${apiPrefix}/companies`, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      
      const result = await storage.getCompanies(page, pageSize, search);
      res.json(result);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Erro ao buscar empresas" });
    }
  });

  app.get(`${apiPrefix}/companies/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompanyById(id);
      
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Erro ao buscar empresa" });
    }
  });

  app.post(`${apiPrefix}/companies`, async (req, res) => {
    try {
      const validatedData = companyInsertSchema.parse(req.body);
      const newCompany = await storage.createCompany(validatedData);
      res.status(201).json(newCompany);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Erro ao criar empresa" });
    }
  });

  app.put(`${apiPrefix}/companies/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCompany = await storage.updateCompany(id, req.body);
      
      if (!updatedCompany) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      res.json(updatedCompany);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Erro ao atualizar empresa" });
    }
  });

  app.delete(`${apiPrefix}/companies/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedCompany = await storage.deleteCompany(id);
      
      if (!deletedCompany || deletedCompany.length === 0) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      
      res.json({ message: "Empresa excluída com sucesso" });
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Erro ao excluir empresa" });
    }
  });

  // Service endpoints
  app.get(`${apiPrefix}/services/all`, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching all services:", error);
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  app.get(`${apiPrefix}/services`, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      
      const result = await storage.getServices(page, pageSize, search, status);
      res.json(result);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  app.get(`${apiPrefix}/services/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceById(id);
      
      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Erro ao buscar serviço" });
    }
  });

  app.post(`${apiPrefix}/services`, async (req, res) => {
    try {
      const validatedData = serviceInsertSchema.parse(req.body);
      const newService = await storage.createService(validatedData);
      res.status(201).json(newService);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Erro ao criar serviço" });
    }
  });

  app.put(`${apiPrefix}/services/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedService = await storage.updateService(id, req.body);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json(updatedService);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Erro ao atualizar serviço" });
    }
  });

  app.delete(`${apiPrefix}/services/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedService = await storage.deleteService(id);
      
      if (!deletedService || deletedService.length === 0) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json({ message: "Serviço excluído com sucesso" });
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Erro ao excluir serviço" });
    }
  });

  // Quote endpoints
  app.get(`${apiPrefix}/quotes`, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      
      const result = await storage.getQuotes(page, pageSize, search, status);
      res.json(result);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Erro ao buscar orçamentos" });
    }
  });

  app.get(`${apiPrefix}/quotes/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuoteById(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      
      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ message: "Erro ao buscar orçamento" });
    }
  });

  app.post(`${apiPrefix}/quotes`, async (req, res) => {
    try {
      const { quote, items } = req.body;
      
      // Validate quote data
      const validatedQuote = quoteInsertSchema.parse(quote);
      
      // Validate quote items
      const validatedItems = z.array(quoteItemInsertSchema).parse(items);
      
      // Create quote with items
      const newQuote = await storage.createQuote(validatedQuote, validatedItems);
      
      res.status(201).json(newQuote);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Erro ao criar orçamento" });
    }
  });

  app.put(`${apiPrefix}/quotes/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quote, items } = req.body;
      
      // Update quote with items
      const updatedQuote = await storage.updateQuote(id, quote, items);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      
      res.json(updatedQuote);
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Erro ao atualizar orçamento" });
    }
  });

  app.delete(`${apiPrefix}/quotes/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedQuote = await storage.deleteQuote(id);
      
      if (!deletedQuote || deletedQuote.length === 0) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      
      res.json({ message: "Orçamento excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ message: "Erro ao excluir orçamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
