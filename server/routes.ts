import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertPetSchema, insertPlanSchema, insertNetworkUnitSchema, insertFaqItemSchema, insertContactSubmissionSchema, insertSiteSettingsSchema, insertThemeSettingsSchema, insertGuideSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.get("/api/clients/search/:query", async (req, res) => {
    try {
      const clients = await storage.searchClients(req.params.query);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to search clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, clientData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Pet routes
  app.get("/api/pets", async (req, res) => {
    try {
      const pets = await storage.getPets();
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  app.get("/api/clients/:clientId/pets", async (req, res) => {
    try {
      const pets = await storage.getPetsByClient(req.params.clientId);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.post("/api/pets", async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    try {
      const petData = insertPetSchema.partial().parse(req.body);
      const pet = await storage.updatePet(req.params.id, petData);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  app.delete("/api/pets/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePet(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });

  // Plan routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/active", async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active plans" });
    }
  });

  app.get("/api/plans/:id", async (req, res) => {
    try {
      const plan = await storage.getPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post("/api/plans", async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });

  app.put("/api/plans/:id", async (req, res) => {
    try {
      const planData = insertPlanSchema.partial().parse(req.body);
      const plan = await storage.updatePlan(req.params.id, planData);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });

  app.delete("/api/plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Plan Procedures routes
  app.post("/api/plan-procedures", async (req, res) => {
    try {
      const procedure = await storage.createPlanProcedure(req.body);
      res.status(201).json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });

  app.get("/api/plan-procedures/:planId", async (req, res) => {
    try {
      const procedures = await storage.getPlanProcedures(req.params.planId);
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan procedures" });
    }
  });

  app.delete("/api/plan-procedures/:planId", async (req, res) => {
    try {
      const deleted = await storage.deletePlanProcedures(req.params.planId);
      if (!deleted) {
        return res.status(404).json({ message: "Plan procedures not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan procedures" });
    }
  });

  // Network unit routes
  app.get("/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network units" });
    }
  });

  app.get("/api/network-units/active", async (req, res) => {
    try {
      const units = await storage.getActiveNetworkUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active network units" });
    }
  });

  app.get("/api/network-units/:id", async (req, res) => {
    try {
      const unit = await storage.getNetworkUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Network unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network unit" });
    }
  });

  app.post("/api/network-units", async (req, res) => {
    try {
      const unitData = insertNetworkUnitSchema.parse(req.body);
      const unit = await storage.createNetworkUnit(unitData);
      res.status(201).json(unit);
    } catch (error) {
      res.status(400).json({ message: "Invalid network unit data" });
    }
  });

  app.put("/api/network-units/:id", async (req, res) => {
    try {
      const unitData = insertNetworkUnitSchema.partial().parse(req.body);
      const unit = await storage.updateNetworkUnit(req.params.id, unitData);
      if (!unit) {
        return res.status(404).json({ message: "Network unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: "Invalid network unit data" });
    }
  });

  app.delete("/api/network-units/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNetworkUnit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Network unit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete network unit" });
    }
  });

  // FAQ routes
  app.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.get("/api/faq/active", async (req, res) => {
    try {
      const items = await storage.getActiveFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active FAQ items" });
    }
  });

  app.post("/api/faq", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const item = await storage.createFaqItem(faqData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid FAQ data" });
    }
  });

  app.put("/api/faq/:id", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.partial().parse(req.body);
      const item = await storage.updateFaqItem(req.params.id, faqData);
      if (!item) {
        return res.status(404).json({ message: "FAQ item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid FAQ data" });
    }
  });

  app.delete("/api/faq/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFaqItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "FAQ item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ item" });
    }
  });

  // Contact submission routes
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.post("/api/contact-submissions", async (req, res) => {
    try {
      const submissionData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact submission data" });
    }
  });

  app.delete("/api/contact-submissions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContactSubmission(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact submission not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact submission" });
    }
  });

  // Guide routes
  app.get("/api/guides", async (req, res) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get("/api/guides/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const guides = await storage.getRecentGuides(limit);
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent guides" });
    }
  });

  app.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.get("/api/clients/:clientId/guides", async (req, res) => {
    try {
      const guides = await storage.getGuidesByClient(req.params.clientId);
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      res.status(400).json({ message: "Invalid guide data" });
    }
  });

  app.put("/api/guides/:id", async (req, res) => {
    try {
      const guideData = insertGuideSchema.partial().parse(req.body);
      const guide = await storage.updateGuide(req.params.id, guideData);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      res.status(400).json({ message: "Invalid guide data" });
    }
  });

  app.delete("/api/guides/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGuide(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });

  // Settings routes
  app.get("/api/settings/site", async (req, res) => {
    try {
      console.log("=== API /api/settings/site called ===");
      console.log("Storage object:", storage);
      console.log("getSiteSettings method:", typeof storage.getSiteSettings);
      
      const settings = await storage.getSiteSettings();
      console.log("Site settings from DB:", settings);
      
      // Se não há dados, retorna um objeto com campos vazios
      if (!settings) {
        const defaultSettings = {
          whatsapp: "",
          email: "",
          phone: "",
          instagramUrl: "",
          facebookUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          cnpj: "",
          businessHours: "",
          ourStory: "",
          privacyPolicy: "",
          termsOfUse: "",
          address: "",
          mainImage: "",
          networkImage: "",
          aboutImage: "",
          cores: {}
        };
        console.log("No settings found, returning defaults:", defaultSettings);
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      
      // Em caso de erro, retorna dados padrão em vez de erro 500
      const defaultSettings = {
        whatsapp: "",
        email: "",
        phone: "",
        instagramUrl: "",
        facebookUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
        cnpj: "",
        businessHours: "",
        ourStory: "",
        privacyPolicy: "",
        termsOfUse: "",
        address: "",
        mainImage: "",
        networkImage: "",
        aboutImage: "",
        cores: {}
      };
      console.log("Error occurred, returning default settings:", defaultSettings);
      res.json(defaultSettings);
    }
  });

  app.put("/api/settings/site", async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid site settings data" });
    }
  });


  // Theme settings routes
  app.get("/api/settings/theme", async (req, res) => {
    try {
      const settings = await storage.getThemeSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theme settings" });
    }
  });

  app.put("/api/settings/theme", async (req, res) => {
    try {
      const settingsData = insertThemeSettingsSchema.parse(req.body);
      const settings = await storage.updateThemeSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid theme settings data" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/plan-distribution", async (req, res) => {
    try {
      const distribution = await storage.getPlanDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Plan distribution error:", error);
      res.status(500).json({ message: "Failed to fetch plan distribution" });
    }
  });

  // Verificação de senha do administrador
  app.post("/api/admin/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.SENHA_ADMIN;
      
      if (!adminPassword) {
        return res.status(500).json({ message: "Senha do administrador não configurada" });
      }
      
      if (password === adminPassword) {
        res.json({ valid: true });
      } else {
        res.status(401).json({ valid: false, message: "Senha incorreta" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar senha" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
