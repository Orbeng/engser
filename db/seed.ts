import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Insert companies
    const existingCompanies = await db.query.companies.findMany();
    
    if (existingCompanies.length === 0) {
      console.log("Seeding companies...");
      
      const companyData = [
        {
          name: "Construtora Horizonte",
          cnpj: "12.345.678/0001-90",
          contactName: "João Almeida",
          email: "contato@horizonte.com",
          phone: "(11) 98765-4321",
          address: "Av. Paulista, 1000",
          city: "São Paulo",
          state: "SP",
          notes: "Cliente desde 2020"
        },
        {
          name: "Empreendimentos Silva",
          cnpj: "23.456.789/0001-01",
          contactName: "Maria Silva",
          email: "contato@silva.com",
          phone: "(11) 91234-5678",
          address: "Rua das Flores, 500",
          city: "São Paulo",
          state: "SP",
          notes: "Projetos residenciais"
        },
        {
          name: "Incorporadora Visão",
          cnpj: "34.567.890/0001-12",
          contactName: "Carlos Souza",
          email: "contato@visao.com",
          phone: "(21) 98765-1234",
          address: "Av. Atlântica, 1500",
          city: "Rio de Janeiro",
          state: "RJ",
          notes: "Especializada em prédios comerciais"
        },
        {
          name: "Construtora Alvorada",
          cnpj: "45.678.901/0001-23",
          contactName: "Ana Costa",
          email: "contato@alvorada.com",
          phone: "(31) 97654-3210",
          address: "Rua dos Andradas, 200",
          city: "Belo Horizonte",
          state: "MG",
          notes: ""
        },
        {
          name: "Tech Buildings",
          cnpj: "56.789.012/0001-34",
          contactName: "Roberto Oliveira",
          email: "contato@techbuildings.com",
          phone: "(41) 99876-5432",
          address: "Rua XV de Novembro, 700",
          city: "Curitiba",
          state: "PR",
          notes: "Edifícios inteligentes"
        }
      ];
      
      for (const company of companyData) {
        await db.insert(schema.companies).values(company);
      }
      
      console.log("Companies seeded successfully!");
    } else {
      console.log("Companies already exist, skipping seed.");
    }

    // Get the companies to use their IDs
    const companies = await db.query.companies.findMany();
    
    // Insert services
    const existingServices = await db.query.services.findMany();
    
    if (existingServices.length === 0 && companies.length > 0) {
      console.log("Seeding services...");
      
      const today = new Date();
      
      // Helper function to add days to a date
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      const serviceData = [
        {
          art: "BR27845632",
          description: "Laudo Técnico Estrutural",
          serviceDate: addDays(today, -8),
          expiryDate: addDays(today, 365),
          value: 4500.00,
          status: "concluido",
          companyId: companies[0].id,
          notes: "Inspeção completa da estrutura"
        },
        {
          art: "BR27845633",
          description: "Projeto de Prevenção de Incêndio",
          serviceDate: addDays(today, -12),
          expiryDate: addDays(today, 3),
          value: 3200.00,
          status: "em_andamento",
          companyId: companies[1].id,
          notes: ""
        },
        {
          art: "BR27845634",
          description: "Vistoria Técnica",
          serviceDate: addDays(today, 5),
          expiryDate: addDays(today, 180),
          value: 1800.00,
          status: "agendado",
          companyId: companies[2].id,
          notes: "Agendado com o responsável técnico"
        },
        {
          art: "BR27845635",
          description: "Análise de Conformidade",
          serviceDate: addDays(today, -20),
          expiryDate: addDays(today, 13),
          value: 2700.00,
          status: "concluido",
          companyId: companies[3].id,
          notes: ""
        },
        {
          art: "BR27845636",
          description: "Projeto Elétrico",
          serviceDate: addDays(today, -25),
          expiryDate: addDays(today, 18),
          value: 5800.00,
          status: "concluido",
          companyId: companies[4].id,
          notes: "Com plantas em alta resolução"
        },
        {
          art: "BR27845637",
          description: "Renovação de Licença Ambiental",
          serviceDate: addDays(today, -40),
          expiryDate: addDays(today, 3),
          value: 3800.00,
          status: "em_andamento",
          companyId: companies[2].id,
          notes: "Documentação completa enviada"
        },
        {
          art: "BR27845638",
          description: "Atualização PPCI",
          serviceDate: addDays(today, -15),
          expiryDate: addDays(today, 13),
          value: 2900.00,
          status: "em_andamento",
          companyId: companies[1].id,
          notes: ""
        },
        {
          art: "BR27845639",
          description: "Renovação ART Estrutural",
          serviceDate: addDays(today, -10),
          expiryDate: addDays(today, 18),
          value: 1200.00,
          status: "em_andamento",
          companyId: companies[0].id,
          notes: ""
        }
      ];
      
      for (const service of serviceData) {
        await db.insert(schema.services).values(service);
      }
      
      console.log("Services seeded successfully!");
    } else {
      console.log("Services already exist, skipping seed.");
    }

    // Get the services to use their IDs
    const services = await db.query.services.findMany();
    
    // Insert quotes
    const existingQuotes = await db.query.quotes.findMany();
    
    if (existingQuotes.length === 0 && companies.length > 0 && services.length > 0) {
      console.log("Seeding quotes...");
      
      const today = new Date();
      
      // Helper function to add days to a date
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      const quoteData = [
        {
          quoteNumber: "ORC-2023001",
          title: "Análise Estrutural Completa",
          description: "Análise completa da estrutura do edifício comercial, incluindo fundações e estrutura metálica.",
          issueDate: today,
          validUntil: addDays(today, 30),
          companyId: companies[0].id,
          totalValue: 7500.00,
          status: "pendente"
        },
        {
          quoteNumber: "ORC-2023002",
          title: "Projeto de PPCI e Instalações",
          description: "Projeto completo de prevenção e combate a incêndio, incluindo instalações hidráulicas e elétricas.",
          issueDate: addDays(today, -15),
          validUntil: addDays(today, 15),
          companyId: companies[1].id,
          totalValue: 8400.00,
          status: "aprovado"
        },
        {
          quoteNumber: "ORC-2023003",
          title: "Vistorias e Laudos Técnicos",
          description: "Conjunto de vistorias técnicas e laudos para regularização de imóveis.",
          issueDate: addDays(today, -20),
          validUntil: addDays(today, 10),
          companyId: companies[2].id,
          totalValue: 4500.00,
          status: "rejeitado"
        }
      ];
      
      for (const quote of quoteData) {
        const [newQuote] = await db.insert(schema.quotes).values(quote).returning();
        
        // Create quote items
        if (newQuote.id === 1) {
          await db.insert(schema.quoteItems).values([
            {
              quoteId: newQuote.id,
              serviceId: services[0].id,
              description: "Laudo Técnico Estrutural",
              quantity: 1,
              unitValue: 4500.00,
              totalValue: 4500.00
            },
            {
              quoteId: newQuote.id,
              serviceId: null,
              description: "Análise de Fundações",
              quantity: 1,
              unitValue: 3000.00,
              totalValue: 3000.00
            }
          ]);
        } else if (newQuote.id === 2) {
          await db.insert(schema.quoteItems).values([
            {
              quoteId: newQuote.id,
              serviceId: services[1].id,
              description: "Projeto de Prevenção de Incêndio",
              quantity: 1,
              unitValue: 3200.00,
              totalValue: 3200.00
            },
            {
              quoteId: newQuote.id,
              serviceId: null,
              description: "Projeto Hidráulico",
              quantity: 1,
              unitValue: 2700.00,
              totalValue: 2700.00
            },
            {
              quoteId: newQuote.id,
              serviceId: services[4].id,
              description: "Projeto Elétrico",
              quantity: 1,
              unitValue: 2500.00,
              totalValue: 2500.00
            }
          ]);
        } else if (newQuote.id === 3) {
          await db.insert(schema.quoteItems).values([
            {
              quoteId: newQuote.id,
              serviceId: services[2].id,
              description: "Vistoria Técnica",
              quantity: 2,
              unitValue: 1800.00,
              totalValue: 3600.00
            },
            {
              quoteId: newQuote.id,
              serviceId: null,
              description: "Emissão de Laudos",
              quantity: 3,
              unitValue: 300.00,
              totalValue: 900.00
            }
          ]);
        }
      }
      
      console.log("Quotes seeded successfully!");
    } else {
      console.log("Quotes already exist, skipping seed.");
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
