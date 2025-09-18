import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertClientSchema, insertPetSchema, insertPlanSchema, insertNetworkUnitSchema, insertFaqItemSchema, insertContactSubmissionSchema, insertSiteSettingsSchema, insertRulesSettingsSchema, insertThemeSettingsSchema, insertGuideSchema, insertUserSchema, updateNetworkUnitCredentialsSchema, insertProcedureSchema, insertProcedurePlanSchema, type InsertUser } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateUniqueSlug } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const clients = await storage.getClients(
        startDate as string | undefined,
        endDate as string | undefined
      );
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
      // Handle empty string or undefined planId
      const requestData = { ...req.body };
      if (requestData.planId === "" || requestData.planId === undefined) {
        delete requestData.planId;
      }
      
      const petData = insertPetSchema.parse(requestData);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    try {
      // Handle empty string or undefined planId
      const requestData = { ...req.body };
      if (requestData.planId === "" || requestData.planId === undefined) {
        delete requestData.planId;
      }
      
      const petData = insertPetSchema.partial().parse(requestData);
      const pet = await storage.updatePet(req.params.id, petData);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid pet data" });
      }
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
      const { startDate, endDate } = req.query;
      const plans = await storage.getPlans(
        startDate as string | undefined,
        endDate as string | undefined
      );
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
      const { startDate, endDate } = req.query;
      const units = await storage.getActiveNetworkUnits(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active network units" });
    }
  });

  // Network unit credentials routes (must come before /:id route)
  app.get("/api/network-units/credentials", async (req, res) => {
    try {
      const units = await storage.getNetworkUnitsWithCredentials();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network units with credentials" });
    }
  });

  app.put("/api/network-units/:id/credentials", async (req, res) => {
    try {
      // Validate request data with zod schema
      const credentialData = updateNetworkUnitCredentialsSchema.parse(req.body);
      
      // Hash the password
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(credentialData.password, saltRounds);

      const updated = await storage.updateNetworkUnitCredentials(req.params.id, {
        login: credentialData.login,
        senhaHash,
      });

      if (!updated) {
        return res.status(404).json({ message: "Network unit not found" });
      }

      res.json({ message: "Credentials updated successfully" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        res.status(400).json({ message: "Login already exists for another unit" });
      } else if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ message: "Invalid credential data", details: error.message });
      } else {
        res.status(500).json({ message: "Failed to update credentials" });
      }
    }
  });

  app.put("/api/network-units/:id/regenerate-slug", async (req, res) => {
    try {
      // Get the network unit to regenerate slug for
      const unit = await storage.getNetworkUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Network unit not found" });
      }

      // Generate a new unique slug based on the unit's name
      const newSlug = await generateUniqueSlug(unit.name, req.params.id);
      
      // Update the unit with the new slug
      const updatedUnit = await storage.updateNetworkUnit(req.params.id, {
        urlSlug: newSlug
      });

      if (!updatedUnit) {
        return res.status(500).json({ message: "Failed to update network unit slug" });
      }

      res.json({ 
        message: "URL slug regenerated successfully",
        newSlug: newSlug,
        fullUrl: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/${newSlug}`
      });
    } catch (error) {
      console.error("Error regenerating slug:", error);
      res.status(500).json({ message: "Failed to regenerate URL slug" });
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
      
      // Generate unique slug from unit name if not provided
      const urlSlug = unitData.urlSlug || await generateUniqueSlug(unitData.name);
      
      const unit = await storage.createNetworkUnit({
        ...unitData,
        urlSlug
      });
      res.status(201).json(unit);
    } catch (error) {
      console.error("Error creating network unit:", error);
      res.status(400).json({ message: "Invalid network unit data" });
    }
  });

  app.put("/api/network-units/:id", async (req, res) => {
    try {
      const unitData = insertNetworkUnitSchema.partial().parse(req.body);
      
      // Handle slug updates - generate new slug if name changed and no explicit slug provided
      let updateData = { ...unitData };
      if (unitData.name && !unitData.urlSlug) {
        updateData.urlSlug = await generateUniqueSlug(unitData.name, req.params.id);
      }
      
      const unit = await storage.updateNetworkUnit(req.params.id, updateData);
      if (!unit) {
        return res.status(404).json({ message: "Network unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error updating network unit:", error);
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


  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword,
        permissions: Array.isArray(userData.permissions) ? userData.permissions as string[] : [] as string[],
      };

      const user = await storage.createUser(userWithHashedPassword);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        res.status(400).json({ message: "Username or email already exists" });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Hash password if provided
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }
      
      // Ensure permissions is an array and create properly typed update object
      if (userData.permissions && !Array.isArray(userData.permissions)) {
        userData.permissions = [] as string[];
      }

      // Create properly typed update object to avoid type inference issues
      const updateData: Partial<InsertUser> = {
        ...userData,
        permissions: userData.permissions ? userData.permissions as string[] : undefined
      };

      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        res.status(400).json({ message: "Username or email already exists" });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
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

  // Procedure routes
  app.get("/api/procedures", async (req, res) => {
    try {
      const procedures = await storage.getProcedures();
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedures" });
    }
  });

  app.get("/api/procedures/active", async (req, res) => {
    try {
      const procedures = await storage.getActiveProcedures();
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active procedures" });
    }
  });

  app.get("/api/procedures/:id", async (req, res) => {
    try {
      const procedure = await storage.getProcedure(req.params.id);
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedure" });
    }
  });

  app.post("/api/procedures", async (req, res) => {
    try {
      const procedureData = insertProcedureSchema.parse(req.body);
      const procedure = await storage.createProcedure(procedureData);
      res.status(201).json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });

  app.put("/api/procedures/:id", async (req, res) => {
    try {
      const procedureData = insertProcedureSchema.partial().parse(req.body);
      const procedure = await storage.updateProcedure(req.params.id, procedureData);
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });

  app.delete("/api/procedures/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProcedure(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete procedure" });
    }
  });

  // Procedure Plans routes - relacionamento entre procedimentos e planos
  app.get("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const procedurePlans = await storage.getProcedurePlans(req.params.procedureId);
      res.json(procedurePlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedure plans" });
    }
  });

  app.get("/api/plans/:planId/procedures", async (req, res) => {
    try {
      const planProcedures = await storage.getPlanProcedures(req.params.planId);
      res.json(planProcedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan procedures" });
    }
  });

  app.post("/api/procedure-plans", async (req, res) => {
    try {
      const procedurePlanData = insertProcedurePlanSchema.parse(req.body);
      const procedurePlan = await storage.createProcedurePlan(procedurePlanData);
      res.status(201).json(procedurePlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure plan data" });
    }
  });

  app.post("/api/procedure-plans/bulk", async (req, res) => {
    try {
      const { procedurePlans } = req.body;
      if (!Array.isArray(procedurePlans)) {
        return res.status(400).json({ message: "procedurePlans must be an array" });
      }
      
      const validatedPlans = procedurePlans.map(plan => insertProcedurePlanSchema.parse(plan));
      const result = await storage.bulkCreateProcedurePlans(validatedPlans);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure plans data" });
    }
  });

  app.put("/api/procedure-plans/:id", async (req, res) => {
    try {
      const procedurePlanData = insertProcedurePlanSchema.partial().parse(req.body);
      const procedurePlan = await storage.updateProcedurePlan(req.params.id, procedurePlanData);
      if (!procedurePlan) {
        return res.status(404).json({ message: "Procedure plan not found" });
      }
      res.json(procedurePlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure plan data" });
    }
  });

  app.delete("/api/procedure-plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProcedurePlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Procedure plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete procedure plan" });
    }
  });

  app.delete("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const deleted = await storage.deleteProcedurePlansByProcedure(req.params.procedureId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete procedure plans" });
    }
  });

  // Atomic PUT endpoint for updating procedure-plan relationships
  app.put("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const { procedurePlans } = req.body;
      if (!Array.isArray(procedurePlans)) {
        return res.status(400).json({ message: "procedurePlans must be an array" });
      }
      
      // Validate each procedure plan
      const validatedPlans = procedurePlans.map(plan => 
        insertProcedurePlanSchema.parse({
          ...plan,
          procedureId: req.params.procedureId
        })
      );
      
      // Use atomic bulk update method
      const result = await storage.bulkUpdateProcedurePlansForProcedure(req.params.procedureId, validatedPlans);
      res.json(result);
    } catch (error) {
      console.error("Error updating procedure plans atomically:", error);
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ message: "Invalid procedure plans data", details: error.message });
      } else {
        res.status(500).json({ message: "Failed to update procedure plans" });
      }
    }
  });

  // Contact submission routes
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const submissions = await storage.getContactSubmissions(
        startDate as string | undefined,
        endDate as string | undefined
      );
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
      const { startDate, endDate } = req.query;
      const guides = await storage.getGuides(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get("/api/guides/with-network-units", async (req, res) => {
    try {
      const { 
        startDate, 
        endDate, 
        page: pageParam, 
        limit: limitParam,
        search,
        status,
        type
      } = req.query;
      
      // Extract and validate pagination parameters
      const page = pageParam ? parseInt(pageParam as string) : 1;
      const limit = limitParam ? parseInt(limitParam as string) : 10;
      
      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ message: "Page must be >= 1" });
      }
      
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Limit must be between 1 and 100" });
      }
      
      const guides = await storage.getAllGuidesWithNetworkUnits(
        startDate as string | undefined,
        endDate as string | undefined,
        page,
        limit,
        search as string | undefined,
        status as string | undefined,
        type as string | undefined
      );
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides with network units" });
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

  // Rules settings routes
  app.get("/api/settings/rules", async (req, res) => {
    try {
      console.log("=== API /api/settings/rules called ===");
      const settings = await storage.getRulesSettings();
      console.log("Rules settings from DB:", settings);
      
      // If no data, return an empty object
      if (!settings) {
        const defaultSettings = {
          fixedPercentage: 0,
        };
        console.log("No existing rules settings, returning defaults:", defaultSettings);
        res.json(defaultSettings);
      } else {
        console.log("Returning existing rules settings:", settings);
        res.json(settings);
      }
    } catch (error) {
      console.error("Error in /api/settings/rules:", error);
      res.status(500).json({ message: "Failed to fetch rules settings" });
    }
  });

  app.put("/api/settings/rules", async (req, res) => {
    try {
      console.log("=== PUT /api/settings/rules called ===");
      console.log("Request body:", req.body);
      const settingsData = insertRulesSettingsSchema.parse(req.body);
      console.log("Parsed settings data:", settingsData);
      const settings = await storage.updateRulesSettings(settingsData);
      console.log("Updated rules settings:", settings);
      res.json(settings);
    } catch (error) {
      console.error("Error in PUT /api/settings/rules:", error);
      res.status(400).json({ message: "Invalid rules settings data" });
    }
  });


  // Cache para theme settings (settings mudam raramente)
  let themeCache: any = null;
  let themeCacheTime = 0;
  const THEME_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // Theme settings routes  
  app.get("/api/settings/theme", async (req, res) => {
    try {
      // Verificar cache primeiro
      const now = Date.now();
      if (themeCache && (now - themeCacheTime) < THEME_CACHE_TTL) {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
        return res.json(themeCache);
      }

      const settings = await storage.getThemeSettings();
      const result = settings || {};
      
      // Atualizar cache
      themeCache = result;
      themeCacheTime = now;
      
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
      res.json(result);
    } catch (error) {
      console.error("Theme settings API error:", error);
      res.json({}); // Return empty object instead of 500 to allow fallback
    }
  });


  app.put("/api/settings/theme", async (req, res) => {
    try {
      console.log("Theme settings request body:", JSON.stringify(req.body, null, 2));
      const settingsData = insertThemeSettingsSchema.parse(req.body);
      const settings = await storage.updateThemeSettings(settingsData);
      
      // Invalidar cache
      themeCache = null;
      themeCacheTime = 0;
      
      res.json(settings);
    } catch (error) {
      console.error("Theme validation error:", error);
      res.status(400).json({ message: "Invalid theme settings data" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getDashboardStats(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/plan-distribution", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const distribution = await storage.getPlanDistribution(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(distribution);
    } catch (error) {
      console.error("Plan distribution error:", error);
      res.status(500).json({ message: "Failed to fetch plan distribution" });
    }
  });

  app.get("/api/dashboard/plan-revenue", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const revenue = await storage.getPlanRevenue(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(revenue);
    } catch (error) {
      console.error("Plan revenue error:", error);
      res.status(500).json({ message: "Failed to fetch plan revenue" });
    }
  });

  // Cache para dashboard data (dados mudam com menos frequência)
  let dashboardCache: Map<string, {data: any, timestamp: number}> = new Map();
  const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutos

  // Aggregated dashboard endpoint - reduces 8 API calls to 1
  app.get("/api/dashboard/all", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const cacheKey = `${startDate || 'all'}-${endDate || 'all'}`;
      const now = Date.now();

      // Verificar cache primeiro
      const cached = dashboardCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < DASHBOARD_CACHE_TTL) {
        res.set('Cache-Control', 'public, max-age=120'); // 2 minutos
        return res.json(cached.data);
      }

      const dashboardData = await storage.getDashboardData(
        startDate as string | undefined,
        endDate as string | undefined
      );

      // Atualizar cache
      dashboardCache.set(cacheKey, {
        data: dashboardData,
        timestamp: now
      });

      // Limpar cache antigo (manter só os últimos 10 itens)
      if (dashboardCache.size > 10) {
        const firstKey = dashboardCache.keys().next().value;
        dashboardCache.delete(firstKey);
      }

      res.set('Cache-Control', 'public, max-age=120'); // 2 minutos
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard all data error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
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

  // JWT secret key for unit authentication
  const JWT_SECRET = process.env.JWT_SECRET || 'unit-secret-key-change-in-production';

  // Network unit authentication routes
  app.post("/api/unit/login", async (req, res) => {
    try {
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(400).json({ message: "Login e senha são obrigatórios" });
      }

      // Find unit by login
      const unit = await storage.getNetworkUnitByLogin(login);
      if (!unit || !unit.senhaHash) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Check if unit is active
      if (!unit.isActive) {
        return res.status(401).json({ message: "Unidade inativa" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, unit.senhaHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Create JWT token
      const tokenPayload = {
        unitId: unit.id,
        urlSlug: unit.urlSlug,
        type: 'unit'
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { 
        expiresIn: '24h',
        issuer: 'unipet-units'
      });

      // Set secure cookie with proper flags
      res.cookie('unit_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        token,
        unit: {
          id: unit.id,
          name: unit.name,
          urlSlug: unit.urlSlug,
          address: unit.address
        }
      });
    } catch (error) {
      console.error("Unit login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/unit/logout", async (req, res) => {
    try {
      // Clear cookie
      res.clearCookie('unit_token');
      res.json({ success: true, message: "Logout realizado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });

  app.get("/api/unit/verify-session", async (req, res) => {
    try {
      // Check for token in Authorization header or cookie
      let token = null;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.unit_token) {
        token = req.cookies.unit_token;
      }

      if (!token) {
        return res.status(401).json({ message: "Token de autorização necessário" });
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Verify it's a unit token
        if (decoded.type !== 'unit') {
          return res.status(401).json({ message: "Token inválido" });
        }
        
        // Verify unit still exists and is active
        const unit = await storage.getNetworkUnit(decoded.unitId);
        if (!unit || !unit.isActive) {
          return res.status(401).json({ message: "Sessão inválida" });
        }

        res.json({
          valid: true,
          unit: {
            id: unit.id,
            name: unit.name,
            urlSlug: unit.urlSlug,
            address: unit.address
          }
        });
      } catch (jwtError) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar sessão" });
    }
  });

  // Middleware to authenticate unit requests
  const authenticateUnit = async (req: any, res: any, next: any) => {
    try {
      let token = null;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.unit_token) {
        token = req.cookies.unit_token;
      }

      if (!token) {
        return res.status(401).json({ message: "Token de autorização necessário" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== 'unit') {
        return res.status(401).json({ message: "Token inválido" });
      }
      
      const unit = await storage.getNetworkUnit(decoded.unitId);
      if (!unit || !unit.isActive) {
        return res.status(401).json({ message: "Unidade inativa ou não encontrada" });
      }

      req.unit = unit;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  };

  // Get guides for authenticated unit (unitId derived from JWT)
  app.get("/api/unit/:unitId/guides", authenticateUnit, async (req: any, res) => {
    try {
      const { unitId } = req.params;
      
      // Critical security check: unit can only access its own guides
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade não autorizada" });
      }

      const guides = await storage.getGuidesByNetworkUnit(unitId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching unit guides:", error);
      res.status(500).json({ message: "Erro ao buscar guias" });
    }
  });

  // Update guide status by unit - critical security isolation
  app.put("/api/unit/guides/:guideId/status", authenticateUnit, async (req: any, res) => {
    try {
      const { guideId } = req.params;
      const { unitStatus } = req.body;

      if (!unitStatus || !['pending', 'accepted', 'rejected', 'completed'].includes(unitStatus)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      // Critical security check: verify guide belongs to authenticated unit
      const guide = await storage.getGuide(guideId);
      if (!guide) {
        return res.status(404).json({ message: "Guia não encontrada" });
      }
      
      if (guide.networkUnitId !== req.unit.id) {
        return res.status(403).json({ message: "Acesso negado - guia não pertence a esta unidade" });
      }

      const updated = await storage.updateGuideUnitStatus(guideId, unitStatus);
      if (!updated) {
        return res.status(500).json({ message: "Erro ao atualizar status da guia" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating guide status:", error);
      res.status(500).json({ message: "Erro ao atualizar status da guia" });
    }
  });

  // Get clients linked to authenticated unit (via guides)
  app.get("/api/unit/:unitId/clients", authenticateUnit, async (req: any, res) => {
    try {
      const { unitId } = req.params;
      
      // Critical security check: unit can only access its own clients
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade não autorizada" });
      }

      const clients = await storage.getClientsByNetworkUnit(unitId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching unit clients:", error);
      res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  });

  // Get coverage table for authenticated unit
  app.get("/api/unit/:unitId/coverage", authenticateUnit, async (req: any, res) => {
    try {
      const { unitId } = req.params;
      
      // Critical security check: unit can only access its own coverage
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade não autorizada" });
      }

      const coverage = await storage.getCoverageByNetworkUnit(unitId);
      res.json(coverage);
    } catch (error) {
      console.error("Error fetching unit coverage:", error);
      res.status(500).json({ message: "Erro ao buscar cobertura" });
    }
  });

  // Create new guide from unit dashboard
  app.post("/api/unit/guides", authenticateUnit, async (req: any, res) => {
    try {
      // Parse and validate guide data
      const guideData = insertGuideSchema.parse({
        ...req.body,
        networkUnitId: req.unit.id, // Ensure guide is assigned to authenticated unit
        unitStatus: 'accepted' // Guides created by units are automatically accepted
      });

      const guide = await storage.createGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating guide from unit:", error);
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ message: "Dados da guia inválidos", details: error.message });
      } else {
        res.status(400).json({ message: "Erro ao criar guia" });
      }
    }
  });

  // API route to check if slug corresponds to a valid network unit
  app.get("/api/unit/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Check if unit exists with this slug
      const unit = await storage.getNetworkUnitBySlug(slug);
      if (!unit) {
        return res.status(404).json({ message: "Unidade não encontrada", exists: false, isActive: false });
      }

      // Return public unit data with exists and isActive flags
      res.json({
        exists: true,
        isActive: unit.isActive,
        unit: {
          id: unit.id,
          name: unit.name,
          address: unit.address,
          urlSlug: unit.urlSlug
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor", exists: false, isActive: false });
    }
  });

  // Dynamic unit routes - must be after all API routes but before static files
  app.get("/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;
      
      // Comprehensive filtering of known routes/paths that should NOT be handled as unit slugs
      const staticPaths = [
        'api', 'assets', 'favicon.ico', 'favicon.png', 'robots.txt', 'sitemap.xml',
        '@vite', '@fs', '__vite_ping', 'src', 'node_modules', 'public',
        'admin', 'rede', 'clientes', 'pets', 'guias', 'planos', 
        'perguntas-frequentes', 'formularios', 'configuracoes', 'administracao',
        'health', 'login', 'logout'
      ];
      
      // Skip known paths and any path with file extensions
      if (staticPaths.includes(slug) || 
          slug.includes('.') || 
          slug.startsWith('_') || 
          slug.startsWith('@')) {
        return next(); // Let other middleware handle it
      }

      // Check if unit exists with this slug and is active
      const unit = await storage.getNetworkUnitBySlug(slug);
      if (!unit || !unit.isActive) {
        return next(); // Let other middleware handle 404
      }

      // Valid unit found - serve the white-label page
      // In development, let Vite handle the frontend routing
      // In production, serve the static index.html
      if (process.env.NODE_ENV === 'production') {
        return res.sendFile(path.resolve(__dirname, '../dist/public/index.html'));
      } else {
        // In development, mark this as a unit page for frontend handling
        (req as any).isUnitPage = true;
        return next();
      }
    } catch (error) {
      console.error("Dynamic route error:", error);
      return next(); // Let error middleware handle it
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
