import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertContactSubmissionSchema, 
  insertPlanSchema, 
  insertNetworkUnitSchema,
  updateNetworkUnitSchema,
  insertFaqItemSchema,
  insertSiteSettingsSchema,
  insertClientSchema,
  insertClientSchemaStep2,
  clientLoginSchema,
  adminLoginSchema,
  insertUserSchema,
  insertPetSchema,
  updatePetSchema,
  type InsertNetworkUnit,
  type InsertSiteSettings,
  type InsertClient,
  type ClientLogin,
  type AdminLogin,
  type InsertPet
} from "../shared/schema.js";
import { sanitizeText } from "./utils/text-sanitizer.js";
import { setupAuth, requireAuth, requireAdmin } from "./auth.js";
import bcrypt from "bcryptjs";
import { supabaseStorage } from "./supabase-storage.js";
import { CieloService, type CreditCardPaymentRequest } from "./services/cielo-service.js";
import { PaymentStatusService } from "./services/payment-status-service.js";
import { 
  checkoutProcessSchema, 
  paymentCaptureSchema, 
  paymentCancelSchema, 
  cieloWebhookSchema 
} from "../shared/schema.js";
import express from "express";
import chatRoutes from "./routes/chat.js";
import rateLimit from "express-rate-limit";



// Middleware to check client authentication
const requireClient = (req: any, res: any, next: any) => {
  if (!req.session) {
    return res.status(401).json({ error: "Client authentication required - no session" });
  }

  if (!req.session.client) {
    return res.status(401).json({ error: "Client authentication required - not logged in" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Static file serving disabled - using Supabase Storage for all images
  console.log('📁 [STATIC-FILES] Static file serving disabled - using Supabase Storage');

  // Health check route is defined later with database connectivity check


  // Registrar rotas de chat
  app.use("/api/chat", chatRoutes);

  // CEP LOOKUP ROUTE
  app.get("/api/cep/:cep", async (req, res) => {
    try {
      
      // Import the CEP service
      const { CepService } = await import("./services/cep-service.js");
      
      // Buscar dados do CEP
      const addressData = await CepService.lookup(req.params.cep);
      
      if (!addressData) {
        return res.status(404).json({
          success: false,
          error: 'CEP não encontrado ou inválido'
        });
      }

      res.json({
        success: true,
        data: addressData
      });

    } catch (error: any) {
      console.error('❌ [CEP API] Erro ao buscar CEP:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  });

  // IMAGE SERVING
  // Note: All images now served from Supabase Storage or client/public folder





  // REMOVIDO: Rotas deprecated de /api/objects/* completamente removidas

  // Setup authentication
  setupAuth(app);

  // Rate limiting for admin login endpoint
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Admin login endpoint
  app.post("/admin/api/login", adminLoginLimiter, async (req, res) => {
    try {
      const loginData = adminLoginSchema.parse(req.body);

      // Check credentials against environment variables
      const adminLogin = process.env.LOGIN;
      const adminPassword = process.env.SENHA;

      if (!adminLogin || !adminPassword) {
        console.error("❌ [ADMIN-LOGIN] Missing environment variables LOGIN or SENHA");
        return res.status(500).json({ error: "Configuração do servidor incorreta" });
      }

      // Secure password comparison
      const isValidLogin = loginData.login === adminLogin;
      let isValidPassword = false;

      // Check if password is bcrypt hash or plain text (for backwards compatibility)
      if (adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$')) {
        // It's a bcrypt hash
        isValidPassword = await bcrypt.compare(loginData.password, adminPassword);
      } else {
        // Plain text comparison (less secure, for backwards compatibility)
        isValidPassword = loginData.password === adminPassword;
        console.warn("⚠️ [ADMIN-LOGIN] Using plain text password comparison. Consider using bcrypt hash for SENHA environment variable.");
      }

      if (isValidLogin && isValidPassword) {
        // Set admin session
        req.session.admin = { login: adminLogin, authenticated: true };
        
        console.log("✅ [ADMIN-LOGIN] Admin authenticated successfully");
        res.json({ success: true, message: "Login realizado com sucesso" });
      } else {
        console.log("❌ [ADMIN-LOGIN] Invalid credentials provided");
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error("❌ [ADMIN-LOGIN] Error during admin login:", error);
      res.status(400).json({ error: "Dados de login inválidos" });
    }
  });

  // Admin authentication status endpoint
  app.get("/admin/api/auth/status", (req, res) => {
    try {
      if (req.session && req.session.admin && req.session.admin.authenticated) {
        res.json({ 
          authenticated: true, 
          admin: { 
            login: req.session.admin.login 
          } 
        });
      } else {
        res.json({ authenticated: false });
      }
    } catch (error) {
      console.error("❌ [ADMIN-AUTH-STATUS] Error checking auth status:", error);
      res.status(500).json({ 
        authenticated: false, 
        error: "Erro interno do servidor" 
      });
    }
  });



  // Protect all admin API routes except login and auth status
  app.use("/admin/api/*", (req, res, next) => {
    // Skip authentication for login and auth status endpoints
    if (req.path === "/admin/api/login" || req.path === "/admin/api/auth/status") {
      return next();
    }
    // Apply admin authentication for all other admin routes
    return requireAdmin(req, res, next);
  });

  // Contact form submission (public)
  app.post("/api/contact", async (req, res) => {
    try {

      const validatedData = insertContactSubmissionSchema.parse(req.body);

      const submission = await storage.createContactSubmission(validatedData as any);

      res.json({ 
        success: true, 
        message: "Cotação enviada com sucesso! Entraremos em contato em breve." 
      });
    } catch (error) {
      console.error("❌ [CONTACT] Error processing contact form:", error);
      res.status(400).json({ 
        error: "Erro ao processar formulário. Verifique os dados e tente novamente." 
      });
    }
  });


  // Chat settings routes are handled by chatRoutes - removed duplicated versions

  // Chat send route is handled by chatRoutes - removed hardcoded version

  // Chat conversations routes are handled by chatRoutes - removed duplicated version

  // PUBLICROUTES (for frontend to consume)

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection by counting plans
      const plans = await storage.getPlans();
      res.json({ 
        status: "healthy",
        database: "connected",
        plansCount: plans?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });
  // CRITICAL: Dashboard aggregated data endpoint (required by admin dashboard)
  app.get("/admin/api/dashboard/all", async (req, res) => {
    try {
      console.log("📊 [DASHBOARD] Processing dashboard data request");
      
      // Extract date filter parameters from query
      const { startDate, endDate } = req.query;
      const hasDateFilter = startDate || endDate;
      
      console.log("📊 [DASHBOARD] Date filters:", { startDate, endDate, hasDateFilter });
      
      // Fetch all required data in parallel for optimal performance
      const [
        allGuides,
        networkUnits, 
        clients,
        contactSubmissions,
        plans,
        allPets
      ] = await Promise.all([
        storage.getAllGuides(),
        storage.getNetworkUnits(), 
        storage.getAllClients(),
        storage.getAllContactSubmissions(),
        storage.getAllPlans(),
        storage.getAllPets()
      ]);

      // Apply date filters if present
      let filteredGuides = allGuides;
      let filteredClients = clients;
      let filteredContactSubmissions = contactSubmissions;
      let filteredPets = allPets;

      if (hasDateFilter) {
        const startDateTime = startDate ? new Date(startDate as string) : null;
        const endDateTime = endDate ? (() => {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          return end;
        })() : null;

        // Filter guides by createdAt
        if (startDateTime || endDateTime) {
          filteredGuides = allGuides.filter(guide => {
            if (!guide.createdAt) return false;
            const createdAt = new Date(guide.createdAt);
            if (startDateTime && createdAt < startDateTime) return false;
            if (endDateTime && createdAt > endDateTime) return false;
            return true;
          });
        }

        // Filter clients by createdAt
        if (startDateTime || endDateTime) {
          filteredClients = clients.filter(client => {
            if (!client.createdAt) return false;
            const createdAt = new Date(client.createdAt);
            if (startDateTime && createdAt < startDateTime) return false;
            if (endDateTime && createdAt > endDateTime) return false;
            return true;
          });
        }

        // Filter contactSubmissions by createdAt
        if (startDateTime || endDateTime) {
          filteredContactSubmissions = contactSubmissions.filter(submission => {
            if (!submission.createdAt) return false;
            const createdAt = new Date(submission.createdAt);
            if (startDateTime && createdAt < startDateTime) return false;
            if (endDateTime && createdAt > endDateTime) return false;
            return true;
          });
        }

        // Filter pets by createdAt
        if (startDateTime || endDateTime) {
          filteredPets = allPets.filter(pet => {
            if (!pet.createdAt) return false;
            const createdAt = new Date(pet.createdAt);
            if (startDateTime && createdAt < startDateTime) return false;
            if (endDateTime && createdAt > endDateTime) return false;
            return true;
          });
        }

        console.log("📊 [DASHBOARD] After date filtering:", {
          guides: `${filteredGuides.length}/${allGuides.length}`,
          clients: `${filteredClients.length}/${clients.length}`,
          contactSubmissions: `${filteredContactSubmissions.length}/${contactSubmissions.length}`,
          pets: `${filteredPets.length}/${allPets.length}`
        });
      }

      console.log("📊 [DASHBOARD] Data fetched successfully:", {
        guides: hasDateFilter ? `${filteredGuides.length}/${allGuides.length}` : allGuides.length,
        networkUnits: networkUnits.length,
        clients: hasDateFilter ? `${filteredClients.length}/${clients.length}` : clients.length,
        contactSubmissions: hasDateFilter ? `${filteredContactSubmissions.length}/${contactSubmissions.length}` : contactSubmissions.length,
        plans: plans.length,
        pets: hasDateFilter ? `${filteredPets.length}/${allPets.length}` : allPets.length
      });

      // Calculate basic statistics using filtered data
      const stats = {
        activeClients: filteredClients.length,
        registeredPets: filteredPets.length,
        openGuides: filteredGuides.filter(g => g.status === 'open').length,
        totalGuides: filteredGuides.length,
        totalPlans: plans.length,
        activePlans: plans.filter(p => p.isActive).length,
        inactivePlans: plans.filter(p => !p.isActive).length,
        activeNetwork: networkUnits.filter(u => u.isActive).length,
        totalProcedures: 0, // TODO: Add if getAllProcedures method exists
        monthlyRevenue: filteredPets.length * 0, // Will be calculated after planRevenue
        totalRevenue: filteredPets.length * 0 // Will be calculated after planRevenue
      };

      // Calculate plan distribution using filtered pets
      const totalFilteredPets = filteredPets.length;
      const planDistribution = plans.map(plan => {
        const petCount = filteredPets.filter(pet => pet.planId === plan.id).length;
        const percentage = totalFilteredPets > 0 ? Math.round((petCount / totalFilteredPets) * 100) : 0;
        return {
          planId: plan.id,
          planName: plan.name,
          petCount,
          percentage
        };
      });

      // Calculate plan revenue using filtered pets (basic calculation using base price)
      const planRevenue = plans.map(plan => {
        const petCount = filteredPets.filter(pet => pet.planId === plan.id).length;
        const monthlyPrice = parseFloat(plan.basePrice || '0');
        const totalRevenue = petCount * monthlyPrice;
        return {
          planId: plan.id,
          planName: plan.name,
          petCount,
          monthlyPrice,
          totalRevenue
        };
      });

      // Calculate total revenue from all plans
      const totalMonthlyRevenue = planRevenue.reduce((sum, plan) => sum + plan.totalRevenue, 0);
      
      // Update stats with calculated revenue
      stats.monthlyRevenue = totalMonthlyRevenue;
      stats.totalRevenue = totalMonthlyRevenue; // For now, using monthly as total

      const dashboardData = {
        stats,
        guides: filteredGuides.slice(0, 5), // Return first 5 for performance using filtered data
        networkUnits: networkUnits.slice(0, 10), // Return first 10 for performance (not date-filtered)
        clients: filteredClients.slice(0, 10), // Return first 10 for performance using filtered data
        contactSubmissions: filteredContactSubmissions.slice(0, 10), // Return first 10 for performance using filtered data
        plans,
        planDistribution,
        planRevenue,
        // Include filter info for debugging
        dateFilter: hasDateFilter ? { startDate, endDate } : null
      };

      // Cache headers for performance
      res.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
      res.json(dashboardData);
      
      console.log("✅ [DASHBOARD] Dashboard data sent successfully");
      
    } catch (error) {
      console.error("❌ [DASHBOARD] Error fetching aggregated dashboard data:", error);
      res.status(500).json({ 
        error: "Erro ao buscar dados do dashboard",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ==== ADMIN ROUTES ====
  // Admin clients routes
  app.get("/admin/api/clients", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching clients:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  app.get("/admin/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      res.json(client);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching client:", error);
      res.status(500).json({ error: "Erro ao buscar cliente" });
    }
  });

  app.get("/admin/api/clients/:id/pets", async (req, res) => {
    try {
      const pets = await storage.getPetsByClientId(req.params.id);
      res.json(pets);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching client pets:", error);
      res.status(500).json({ error: "Erro ao buscar pets do cliente" });
    }
  });

  app.get("/admin/api/clients/search/:query", async (req, res) => {
    try {
      // Temporary fix: use getAllClients and filter manually
      const allClients = await storage.getAllClients();
      const query = req.params.query.toLowerCase();
      const clients = allClients.filter(client => 
        (client.fullName || '').toLowerCase().includes(query) || 
        client.email.toLowerCase().includes(query) || 
        client.phone.includes(query)
      );
      res.json(clients);
    } catch (error) {
      console.error("❌ [ADMIN] Error searching clients:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  // Admin contact submissions routes  
  app.get("/admin/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching contact submissions:", error);
      res.status(500).json({ error: "Erro ao buscar contatos" });
    }
  });

  // Admin FAQ routes
  app.get("/admin/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getFaqItems();
      res.json(faqItems);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching FAQ items:", error);
      res.status(500).json({ error: "Erro ao buscar FAQ" });
    }
  });

  // Admin guides routes
  app.get("/admin/api/guides", async (req, res) => {
    try {
      const guides = await storage.getAllGuides();
      res.json(guides);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching guides:", error);
      res.status(500).json({ error: "Erro ao buscar guias" });
    }
  });

  app.get("/admin/api/guides/with-network-units", async (req, res) => {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || 'all';
      const type = (req.query.type as string) || 'all';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Get all guides first (we'll implement filtering here directly)
      const allGuides = await storage.getAllGuides();
      
      // Apply filters
      let filteredGuides = allGuides;
      
      // Search filter - search in procedure, procedureNotes, or generalNotes
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        filteredGuides = filteredGuides.filter(guide => 
          (guide.procedure && guide.procedure.toLowerCase().includes(searchTerm)) ||
          (guide.procedureNotes && guide.procedureNotes.toLowerCase().includes(searchTerm)) ||
          (guide.generalNotes && guide.generalNotes.toLowerCase().includes(searchTerm))
        );
      }
      
      // Status filter
      if (status && status !== 'all') {
        filteredGuides = filteredGuides.filter(guide => guide.status === status);
      }
      
      // Type filter
      if (type && type !== 'all') {
        filteredGuides = filteredGuides.filter(guide => guide.type === type);
      }
      
      // Date filters
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filteredGuides = filteredGuides.filter(guide => 
          guide.createdAt && new Date(guide.createdAt) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredGuides = filteredGuides.filter(guide => 
          guide.createdAt && new Date(guide.createdAt) <= end
        );
      }
      
      // Sort by createdAt descending (newest first)
      filteredGuides.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      // Calculate pagination
      const total = filteredGuides.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedGuides = filteredGuides.slice(offset, offset + limit);
      
      // Return paginated response in the format expected by frontend
      const response = {
        data: paginatedGuides,
        total,
        totalPages,
        page
      };
      
      res.json(response);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching guides with network units:", error);
      res.status(500).json({ error: "Erro ao buscar guias" });
    }
  });

  app.get("/admin/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ error: "Guia não encontrado" });
      }
      res.json(guide);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching guide:", error);
      res.status(500).json({ error: "Erro ao buscar guia" });
    }
  });

  // Admin plans routes
  app.get("/admin/api/plans", async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching plans:", error);
      res.status(500).json({ error: "Erro ao buscar planos" });
    }
  });

  app.get("/admin/api/plans/active", async (req, res) => {
    try {
      const plans = await storage.getPlans(); // Get active plans
      res.json(plans);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching active plans:", error);
      res.status(500).json({ error: "Erro ao buscar planos ativos" });
    }
  });

  // Admin network units routes
  app.get("/admin/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching network units:", error);
      res.status(500).json({ error: "Erro ao buscar unidades da rede" });
    }
  });

  // Network units with credentials route (must come before :id route)
  app.get("/admin/api/network-units/credentials", async (req, res) => {
    try {
      const units = await storage.getAllNetworkUnits();
      
      // Map units to include credential status
      const unitsWithCredentials = units.map(unit => ({
        ...unit,
        hasLogin: !!unit.login,
        hasPassword: !!unit.senhaHash,
        credentialStatus: (unit.login && unit.senhaHash) ? 'configured' : 'pending'
      }));
      
      res.json(unitsWithCredentials);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching network units with credentials:", error);
      res.status(500).json({ error: "Erro ao buscar unidades com credenciais" });
    }
  });

  app.put("/admin/api/network-units/:id/credentials", async (req, res) => {
    try {
      const { id } = req.params;
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(400).json({ error: "Login e senha são obrigatórios" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUnit = await storage.updateNetworkUnit(id, {
        login,
        senhaHash: hashedPassword
      });
      
      if (!updatedUnit) {
        return res.status(404).json({ error: "Unidade não encontrada" });
      }
      
      // Remove sensitive data from response
      const { senhaHash, ...unitResponse } = updatedUnit;
      res.json({
        ...unitResponse,
        hasLogin: !!updatedUnit.login,
        hasPassword: !!updatedUnit.senhaHash,
        credentialStatus: 'configured'
      });
    } catch (error) {
      console.error("❌ [ADMIN] Error updating network unit credentials:", error);
      res.status(400).json({ error: "Erro ao atualizar credenciais" });
    }
  });

  app.get("/admin/api/network-units/:id", async (req, res) => {
    try {
      const unit = await storage.getNetworkUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unidade não encontrada" });
      }
      res.json(unit);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching network unit:", error);
      res.status(500).json({ error: "Erro ao buscar unidade" });
    }
  });

  // Admin procedures routes
  app.get("/admin/api/procedures", async (req, res) => {
    try {
      const procedures = await storage.getAllProcedures();
      res.json(procedures);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching procedures:", error);
      res.status(500).json({ error: "Erro ao buscar procedimentos" });
    }
  });

  // Admin users routes
  app.get("/admin/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching users:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.post("/admin/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const newUser = await storage.createUser({
        ...validatedData,
        username: validatedData.username || validatedData.email || 'user',
        email: validatedData.email || '',
        isActive: Boolean(validatedData.isActive),
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("❌ [ADMIN] Error creating user:", error);
      res.status(400).json({ error: "Erro ao criar usuário" });
    }
  });

  app.put("/admin/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("❌ [ADMIN] Error updating user:", error);
      res.status(400).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/admin/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json({ success: true, message: "Usuário removido com sucesso" });
    } catch (error) {
      console.error("❌ [ADMIN] Error deleting user:", error);
      res.status(500).json({ error: "Erro ao remover usuário" });
    }
  });

  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();

      // If no plans found, return empty array instead of error
      if (!plans || plans.length === 0) {
        console.log("No plans found in database, returning empty array");
        return res.json([]);
      }

      res.json(plans);
    } catch (error) {
      console.error("Error in /api/plans:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);

      // Return more specific error information
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("does not exist")) {
        console.log("Database schema issue detected, attempting to initialize...");
        // Return empty array for now, the database initialization will run on next restart
        return res.json([]);
      }

      res.status(500).json({ 
        error: "Erro ao buscar planos",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  // Site Settings (public read access)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();

      if (siteSettings) {
        // Return only URL fields - images served from Supabase Storage
        const cleanSettings = {
          ...siteSettings,
          // Remove BYTEA fields, keep only URL fields
          mainImage: undefined,
          networkImage: undefined,
          aboutImage: undefined,
        };
        
        return res.json(cleanSettings);
      }

      res.json({});
    } catch (error) {
      console.error('❌ Erro ao buscar configurações do site:', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  

  app.get("/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      console.error("Erro ao buscar unidades da rede:", error);
      res.status(500).json({ error: "Erro ao buscar unidades da rede" });
    }
  });

  app.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getFaqItems();

      // Garantir que as quebras de linha sejam preservadas na resposta
      const formattedItems = items.map(item => ({
        ...item,
        question: item.question || '',
        answer: item.answer || ''
      }));

      res.json(formattedItems);
    } catch (error) {
      console.error("Erro detalhado ao buscar FAQ:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      res.status(500).json({ error: "Erro ao buscar itens do FAQ", details: errorMessage, stack: errorStack });
    }
  });

  // Species routes (public)
  app.get("/api/species", async (req, res) => {
    try {
      const species = await storage.getSpecies();
      res.json(species);
    } catch (error) {
      console.error("Erro ao buscar espécies:", error);
      res.status(500).json({ error: "Erro ao buscar espécies" });
    }
  });

  // CIELO WEBHOOK ENDPOINT
  app.post("/api/webhooks/cielo", express.raw({ type: 'application/json' }), async (req, res) => {
    const correlationId = req.headers['x-correlation-id'] as string || 
                         req.headers['requestid'] as string || 
                         Math.random().toString(36).substring(7);
    
    try {
      console.log('📥 [CIELO-WEBHOOK] Webhook recebido', {
        correlationId,
        headers: {
          'content-type': req.headers['content-type'],
          'cielo-signature': req.headers['cielo-signature'],
          'user-agent': req.headers['user-agent']
        },
        ip: req.ip || req.connection.remoteAddress,
        bodyLength: req.body?.length || 0
      });

      // Import webhook service
      const { CieloWebhookService } = await import("./services/cielo-webhook-service.js");
      const webhookService = new CieloWebhookService();

      // Validate request format
      if (!req.body) {
        console.error('❌ [CIELO-WEBHOOK] Body vazio recebido', { correlationId });
        return res.status(400).json({ error: 'Body é obrigatório' });
      }

      // Convert raw body to string for signature validation
      const rawBody = req.body.toString('utf8');
      const signature = req.headers['cielo-signature'] as string || 
                       req.headers['x-cielo-signature'] as string || '';

      // Validate webhook signature
      if (!webhookService.validateWebhookSignature(rawBody, signature, correlationId)) {
        console.error('🚨 [CIELO-WEBHOOK] Assinatura inválida', { 
          correlationId,
          signature: signature ? 'presente' : 'ausente'
        });
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      // Parse JSON payload
      let notification;
      try {
        notification = JSON.parse(rawBody);
      } catch (parseError) {
        console.error('❌ [CIELO-WEBHOOK] Erro ao fazer parse do JSON', {
          correlationId,
          error: parseError instanceof Error ? parseError.message : 'Erro desconhecido',
          bodyPreview: rawBody.substring(0, 100)
        });
        return res.status(400).json({ error: 'JSON inválido' });
      }

      // Validate notification structure
      if (!notification.PaymentId || typeof notification.ChangeType !== 'number') {
        console.error('❌ [CIELO-WEBHOOK] Estrutura de notificação inválida', {
          correlationId,
          notification: {
            hasPaymentId: !!notification.PaymentId,
            changeType: notification.ChangeType,
            hasClientOrderId: !!notification.ClientOrderId
          }
        });
        return res.status(400).json({ error: 'Estrutura de notificação inválida' });
      }

      // Log security audit event
      console.log('🔒 [SECURITY-AUDIT] Webhook Cielo recebido', {
        timestamp: new Date().toISOString(),
        correlationId,
        paymentId: notification.PaymentId,
        changeType: notification.ChangeType,
        clientOrderId: notification.ClientOrderId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Process webhook notification
      await webhookService.processWebhookNotification(notification, correlationId);

      // Return success response immediately (webhook should respond quickly)
      res.status(200).json({ 
        status: 'success', 
        correlationId,
        timestamp: new Date().toISOString()
      });

      console.log('✅ [CIELO-WEBHOOK] Webhook processado com sucesso', {
        correlationId,
        paymentId: notification.PaymentId
      });

    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro ao processar webhook', {
        correlationId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Log critical security event
      console.log('🚨 [SECURITY-AUDIT] Webhook processing failed', {
        timestamp: new Date().toISOString(),
        correlationId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        ip: req.ip || req.connection.remoteAddress
      });

      res.status(500).json({ 
        error: 'Erro interno do servidor',
        correlationId,
        timestamp: new Date().toISOString()
      });
    }
  });



  // === CHECKOUT ROUTES ===
  
  // Step 2: Save customer and pets data (after consent accepted)
  app.post("/api/checkout/save-customer-data", async (req, res) => {
    try {
      console.log("🛒 [CHECKOUT-STEP2] Iniciando salvamento dos dados do cliente e pets");
      
      const { clientData, petsData } = req.body;
      
      if (!clientData || !petsData || !Array.isArray(petsData)) {
        return res.status(400).json({ 
          error: "Dados inválidos - clientData e petsData são obrigatórios" 
        });
      }
      
      // Remove CPF do clientData se vier vazio, nulo ou for enviado no Step 2
      if (!clientData.cpf || clientData.cpf === '' || clientData.cpf === null) {
        delete clientData.cpf;
      }
      
      console.log("🔍 [CHECKOUT-STEP2] Dados recebidos (sem CPF):", {
        email: clientData.email,
        hasPassword: !!clientData.password,
        petsCount: petsData.length
      });
      
      // Validate client data (using schema without mandatory CPF for Step 2)
      const parsedClientData = insertClientSchemaStep2.parse(clientData);
      
      // Check if client already exists
      const existingClient = await storage.getClientByEmail(parsedClientData.email);
      if (existingClient) {
        console.log("⚠️ [CHECKOUT-STEP2] Cliente já existe, atualizando dados e adicionando pets...");
        
        // Update existing client with partial data (without overwriting existing fields)
        const updateData: any = {
          fullName: parsedClientData.full_name,
          phone: parsedClientData.phone || existingClient.phone,
        };
        
        
        // Skip client update to avoid Drizzle errors for now
        const updatedClient = existingClient;
        
        // Save pets for existing client
        const savedPets: any[] = [];
        for (const petData of petsData) {
          const petToSave = {
            ...petData,
            clientId: existingClient.id,
            weight: petData.weight?.toString() || "0",
            sex: petData.sex || "",
            age: petData.age?.toString() || "1"
          };
          
          const parsedPetData = insertPetSchema.parse(petToSave);
          console.log("✅ [CHECKOUT-STEP2] Pet validado para cliente existente (será criado após pagamento):", parsedPetData.name);
          // Pet será criado apenas após pagamento aprovado no endpoint simple-process
          // savedPets.push(savedPet as any); - removido pois pet não será criado aqui
        }
        
        const { password: _, ...clientResponse } = updatedClient || existingClient;
        
        return res.status(200).json({
          success: true,
          message: "Cliente existente - dados validados (pets serão criados após pagamento)",
          client: clientResponse,
          pets: [], // Pets não são mais criados neste endpoint
          clientId: existingClient.id,
          isExistingClient: true
        });
      }
      
      // New client - create without CPF (will be added in Step 3)
      console.log("🆕 [CHECKOUT-STEP2] Criando novo cliente sem CPF (será adicionado no Step 3)");
      
      // Hash password
      const hashedPassword = null; // Sistema não usa senhas
      
      // Create client with UUID - CPF null for Step 2
      const clientToSave = {
        ...parsedClientData,
        fullName: parsedClientData.full_name,
        password: null, // Sistema não usa senhas para compras
        cpf: null, // CPF null temporariamente (será adicionado no Step 3)
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log("🏗️ [CHECKOUT-STEP2] Criando cliente:", clientToSave.email);
      const savedClient = await storage.createClient(clientToSave as any);
      
      // Save pets data
      const savedPets = [];
      for (const petData of petsData) {
        const petToSave = {
          ...petData,
          clientId: savedClient.id,
          weight: petData.weight?.toString() || "0", // Ensure weight is string for validation
          sex: petData.sex || "Macho", // Valor padrão para sex se não fornecido
          age: petData.age?.toString() || "1" // Ensure age is string
        };
        
        // Validate pet data
        const parsedPetData = insertPetSchema.parse(petToSave);
        
        console.log("✅ [CHECKOUT-STEP2] Pet validado (será criado após pagamento):", parsedPetData.name);
        // Pet será criado apenas após pagamento aprovado no endpoint simple-process
        // savedPets.push(savedPet); - removido pois pet não será criado aqui
      }
      
      console.log("✅ [CHECKOUT-STEP2] Dados salvos com sucesso", {
        clientId: savedClient.id,
        petsValidated: 0 // Pets não são mais salvos neste endpoint
      });
      
      // Return success without password
      const { password: _, ...clientResponse } = savedClient;
      
      res.status(201).json({
        success: true,
        message: "Cliente criado com sucesso (pets serão criados após pagamento)",
        client: clientResponse,
        pets: [], // Pets não são mais criados neste endpoint
        clientId: savedClient.id
      });
      
    } catch (error: any) {
      console.error("❌ [CHECKOUT-STEP2] Erro ao salvar dados:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // NEW ROUTE: Complete client registration with CPF and address (Step 3)
  app.post("/api/checkout/complete-registration", async (req, res) => {
    try {
      console.log("📝 [CHECKOUT-STEP3] Completando registro do cliente com CPF e endereço");
      
      const { clientId, cpf, addressData } = req.body;
      
      if (!clientId || !cpf || !addressData) {
        return res.status(400).json({
          error: "Dados incompletos - clientId, cpF e addressData são obrigatórios"
        });
      }
      
      // Clean CPF (remove formatting)
      const cleanCpf = cpf.replace(/\D/g, '');
      
      // Validate CPF format
      if (cleanCpf.length !== 11) {
        return res.status(400).json({
          error: "CPF inválido - deve conter 11 dígitos"
        });
      }
      
      // Check if CPF is already in use
      const existingClients = await storage.getAllClients();
      const clientWithCpf = existingClients.find(c => c.cpf === cleanCpf);
      
      // Se o CPF já existe para outro cliente, retornamos o cliente existente
      // Isso permite que um cliente existente adicione novos pets/planos
      let targetClientId = clientId;
      let isExistingClient = false;
      
      if (clientWithCpf) {
        if (clientWithCpf.id !== clientId) {
          // CPF pertence a outro cliente - usamos esse cliente existente
          targetClientId = clientWithCpf.id;
          isExistingClient = true;
          console.log(`✅ [CHECKOUT-STEP3] CPF já cadastrado para cliente: ${targetClientId}, usando cliente existente`);
          
          // Limpar cliente temporário criado no Step 2 já que vamos usar o existente
          try {
            console.log(`🗑️ [CHECKOUT-STEP3] Removendo cliente temporário: ${clientId}`);
            await storage.deleteClient(clientId);
            console.log(`✅ [CHECKOUT-STEP3] Cliente temporário removido com sucesso`);
          } catch (deleteError) {
            console.error(`⚠️ [CHECKOUT-STEP3] Erro ao remover cliente temporário (não crítico):`, deleteError);
          }
        } else {
          // CPF já pertence ao mesmo cliente
          console.log(`✅ [CHECKOUT-STEP3] CPF já pertence ao mesmo cliente: ${clientId}`);
        }
      }
      
      // Update client with CPF and address
      const updateData = {
        cpf: cleanCpf,
        cep: addressData.cep?.replace(/\D/g, '') || null,
        address: addressData.address || null,
        number: addressData.number || null,
        complement: addressData.complement || null,
        district: addressData.district || null,
        state: addressData.state || null,
        city: addressData.city || null
      };
      
      console.log("🔄 [CHECKOUT-STEP3] Atualizando cliente com dados completos:", {
        clientId: targetClientId,
        cpf: cleanCpf,
        hasAddress: !!addressData.address,
        isExistingClient
      });
      
      const updatedClient = await storage.updateClient(targetClientId, updateData);
      
      if (!updatedClient) {
        return res.status(404).json({
          error: "Cliente não encontrado"
        });
      }
      
      // Remove password from response
      const { password: _, ...clientResponse } = updatedClient;
      
      console.log("✅ [CHECKOUT-STEP3] Registro completado com sucesso");
      
      res.status(200).json({
        success: true,
        message: isExistingClient ? 
          "Cliente existente atualizado com sucesso" : 
          "Registro completado com sucesso",
        client: clientResponse,
        clientId: targetClientId // Retornamos o ID do cliente usado (existente ou novo)
      });
      
    } catch (error: any) {
      console.error("❌ [CHECKOUT-STEP3] Erro ao completar registro:", error);
      
      res.status(500).json({
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // NEW SIMPLE CHECKOUT ENDPOINT - Find or Create Client + Process Payment
  app.post("/api/checkout/simple-process", async (req, res) => {
    try {
      console.log("🛒 [SIMPLE-CHECKOUT] Iniciando checkout simplificado");
      
      const { paymentData, planData, paymentMethod, addressData } = req.body;
      
      if (!paymentData || !planData || !paymentMethod) {
        return res.status(400).json({ 
          error: "Dados incompletos - paymentData, planData e paymentMethod são obrigatórios" 
        });
      }

      // ============================================
      // STEP 1: FIND OR CREATE CLIENT (SIMPLE LOGIC)
      // ============================================
      
      const customerCpf = paymentData.customer?.cpf?.replace(/\D/g, '');
      const customerEmail = paymentData.customer?.email?.toLowerCase().trim();
      const customerName = paymentData.customer?.name || 'Cliente';
      
      console.log("🔍 [SIMPLE] Buscando cliente:", { cpf: customerCpf, email: customerEmail, name: customerName });
      
      let client;
      
      // Try to find existing client by CPF first (priority)
      if (customerCpf) {
        const allClients = await storage.getAllClients();
        client = allClients.find(c => c.cpf === customerCpf);
        if (client) {
          console.log(`✅ [SIMPLE] Cliente encontrado por CPF: ${client.id}`);
        }
      }
      
      // If not found by CPF, try by email
      if (!client && customerEmail) {
        client = await storage.getClientByEmail(customerEmail);
        if (client) {
          console.log(`✅ [SIMPLE] Cliente encontrado por Email: ${client.id}`);
        }
      }
      
      // If client doesn't exist, create new one
      if (!client) {
        console.log(`🆕 [SIMPLE] Criando novo cliente`);
        
        const newClientData = {
          id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          fullName: customerName,
          email: customerEmail,
          phone: addressData?.phone || null,
          cpf: customerCpf || null,
          password: null,
          address: addressData?.address || null,
          number: addressData?.number || null,
          complement: addressData?.complement || null,
          district: addressData?.district || null,
          city: addressData?.city || null,
          state: addressData?.state || null,
          cep: addressData?.cep?.replace(/\D/g, '') || null
        };
        
        try {
          client = await storage.createClient(newClientData);
          console.log(`✅ [SIMPLE] Cliente criado: ${client.id}`);
        } catch (createError: any) {
          // If duplicate, try to find existing again
          if (createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
            const allClients = await storage.getAllClients();
            client = allClients.find(c => c.cpf === customerCpf || c.email === customerEmail);
            if (client) {
              console.log(`🔄 [SIMPLE] Usando cliente existente após erro de duplicação: ${client.id}`);
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }

      // ============================================
      // STEP 2: VALIDATE PET DATA (NOT CREATE YET)
      // ============================================
      
      // Pets serão criados apenas após pagamento aprovado
      const petsToCreate = paymentData.pets || [];
      console.log(`📋 [SIMPLE] ${petsToCreate.length} pets serão criados após pagamento aprovado`);

      // ============================================
      // STEP 3: PROCESS PAYMENT
      // ============================================
      
      // Get plan details for pricing
      const selectedPlan = await storage.getPlan(planData.planId);
      if (!selectedPlan) {
        return res.status(400).json({
          error: "Plano não encontrado",
          planId: planData.planId
        });
      }

      // ============================================
      // CALCULATE CORRECT PRICE WITH MULTI-PET DISCOUNTS
      // ============================================
      
      // Contar pets do payload
      const petCount = paymentData.pets?.length || 1;
      
      // Calcular preço correto usando basePrice do banco de dados e aplicando descontos
      const basePriceDecimal = parseFloat(selectedPlan.basePrice || '0');
      let basePriceCents = Math.round(basePriceDecimal * 100);
      
      // Para planos COMFORT e PLATINUM, multiplicar por 12 (cobrança anual)
      if (['COMFORT', 'PLATINUM'].some(type => selectedPlan.name.toUpperCase().includes(type))) {
        basePriceCents = basePriceCents * 12;
      }
      
      // Aplicar desconto apenas para planos Basic/Infinity e pets a partir do 2º
      let totalCents = 0;
      for (let i = 0; i < petCount; i++) {
        let petPriceCents = basePriceCents;
        
        if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && i > 0) {
          const discountPercentage = i === 1 ? 5 :  // 2º pet: 5%
                                   i === 2 ? 10 : // 3º pet: 10%
                                   15;             // 4º+ pets: 15%
          petPriceCents = Math.round(basePriceCents * (1 - discountPercentage / 100));
        }
        
        totalCents += petPriceCents;
      }
      
      const correctAmountInCents = totalCents;
      
      console.log("💰 [PRICE-CALCULATION] Preço calculado no servidor:", {
        planName: selectedPlan.name,
        basePrice: basePriceDecimal,
        isAnnualPlan: ['COMFORT', 'PLATINUM'].some(type => selectedPlan.name.toUpperCase().includes(type)),
        basePriceCents: basePriceCents,
        petCount: petCount,
        totalWithDiscounts: (correctAmountInCents / 100).toFixed(2),
        correctAmountInCents: correctAmountInCents,
        isDiscountEligible: ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type))
      });

      // Process payment via Cielo
      let paymentResult;
      
      if (paymentMethod === 'credit_card') {
        const cieloService = new CieloService();
        const creditCardRequest = {
          merchantOrderId: `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          customer: {
            name: paymentData.customer.name || paymentData.payment.holder || 'Cliente',
            email: client.email,
            cpf: client.cpf,
            address: {
              street: client.address || '',
              number: client.number || '',
              complement: client.complement || '',
              zipCode: client.cep || '',
              city: client.city || '',
              state: client.state || '',
              country: 'BRA'
            }
          },
          payment: {
            type: 'CreditCard' as const,
            amount: correctAmountInCents,
            installments: paymentData.payment?.installments || 1,
            creditCard: {
              cardNumber: paymentData.payment.cardNumber,
              holder: paymentData.payment.holder,
              expirationDate: paymentData.payment.expirationDate,
              securityCode: paymentData.payment.securityCode
            }
          }
        };
        
        paymentResult = await cieloService.createCreditCardPayment(creditCardRequest);
        
        console.log(`💳 [SIMPLE] Resultado do pagamento:`, {
          paymentId: paymentResult.payment?.paymentId,
          status: paymentResult.payment?.status,
          approved: paymentResult.payment?.status === 2
        });
        
        if (paymentResult.payment?.status === 2) {
          // Payment approved - primeiro criar os pets
          const createdPets = [];
          if (petsToCreate && Array.isArray(petsToCreate) && petsToCreate.length > 0) {
            for (const petData of petsToCreate) {
              const newPetData = {
                id: `pet-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
                clientId: client.id,
                name: petData.name || 'Pet',
                species: petData.species || 'Cão',
                breed: petData.breed || '',
                age: petData.age?.toString() || '1',
                sex: petData.sex || '',
                castrated: petData.castrated || false,
                weight: petData.weight?.toString() || '1',
                vaccineData: JSON.stringify([]),
                planId: planData.planId,
                isActive: true
              };
              
              try {
                const pet = await storage.createPet(newPetData);
                createdPets.push(pet);
                console.log(`✅ [SIMPLE] Pet criado após pagamento aprovado: ${pet.name} (${pet.id})`);
              } catch (petError) {
                console.error(`⚠️ [SIMPLE] Erro ao criar pet (continuando):`, petError);
              }
            }
          }
          
          // Create contract for each pet
          const contracts: any[] = [];
          for (let i = 0; i < createdPets.length; i++) {
            const pet = createdPets[i];
            
            // Calculate the correct price for this pet including discount
            let petMonthlyAmount = parseFloat(selectedPlan.basePrice || '0');
            
            // Apply discount for 2nd, 3rd, 4th+ pets for BASIC and INFINITY plans
            if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && i > 0) {
              const discountPercentage = i === 1 ? 5 :  // 2nd pet: 5%
                                       i === 2 ? 10 : // 3rd pet: 10%
                                       15;             // 4th+ pets: 15%
              petMonthlyAmount = petMonthlyAmount * (1 - discountPercentage / 100);
            }
            
            const contractData = {
              clientId: client.id,
              planId: planData.planId,
              petId: pet.id,
              contractNumber: `UNIPET-${Date.now()}-${pet.id.substring(0, 4).toUpperCase()}`,
              status: 'active' as const,
              startDate: new Date(),
              monthlyAmount: petMonthlyAmount.toFixed(2),
              paymentMethod: 'credit_card',
              cieloPaymentId: paymentResult.payment.paymentId,
              proofOfSale: paymentResult.payment.proofOfSale,
              authorizationCode: paymentResult.payment.authorizationCode,
              tid: paymentResult.payment.tid,
              receivedDate: new Date(), // Add the payment received date
              returnCode: paymentResult.payment.returnCode,
              returnMessage: paymentResult.payment.returnMessage
            };
            
            try {
              const contract = await storage.createContract(contractData);
              contracts.push(contract);
              console.log(`✅ [SIMPLE] Contrato criado para pet ${pet.name}: ${contract.id}`);
            } catch (contractError) {
              console.error(`⚠️ [SIMPLE] Erro ao criar contrato para pet ${pet.name}:`, contractError);
            }
          }
          
          // Generate payment receipt with all pets
          if (contracts.length > 0) {
            try {
              const { PaymentReceiptService } = await import("./services/payment-receipt-service.js");
              const receiptService = new PaymentReceiptService();
              
              // Prepare pets data for receipt
              const petsForReceipt = createdPets.map((pet, index) => {
                const basePrice = parseFloat(selectedPlan.basePrice || '0');
                let discountPercentage = 0;
                
                // Apply discount for 2nd, 3rd, 4th+ pets for BASIC and INFINITY plans
                if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && index > 0) {
                  discountPercentage = index === 1 ? 5 :  // 2nd pet: 5%
                                      index === 2 ? 10 : // 3rd pet: 10%
                                      15;             // 4th+ pets: 15%
                }
                
                const discountedPrice = basePrice * (1 - discountPercentage / 100);
                
                return {
                  name: pet.name || 'Pet',
                  species: pet.species || 'Cão',
                  breed: pet.breed,
                  age: pet.age,
                  weight: pet.weight,
                  sex: pet.sex,
                  planName: selectedPlan.name,
                  planType: selectedPlan.planType || 'BASIC',
                  value: Math.round(basePrice * 100),
                  discount: discountPercentage,
                  discountedValue: Math.round(discountedPrice * 100)
                };
              });
              
              const receiptData = {
                contractId: contracts[0].id,
                cieloPaymentId: paymentResult.payment.paymentId,
                clientName: client.fullName,
                clientEmail: client.email,
                clientCPF: client.cpf,
                clientPhone: client.phone,
                pets: petsForReceipt,
                paymentMethod: 'credit_card',
                installments: paymentData.payment?.installments || 1,
                installmentValue: correctAmountInCents,
                totalDiscount: 0,
                finalAmount: correctAmountInCents
              };
              
              console.log(`📄 [SIMPLE-RECEIPT] Gerando comprovante consolidado para ${createdPets.length} pets`);
              const receiptResult = await receiptService.generatePaymentReceipt(receiptData, `simple_${paymentResult.payment.paymentId}`);
              
              if (receiptResult.success) {
                console.log("✅ [SIMPLE-RECEIPT] Comprovante oficial gerado com sucesso:", {
                  receiptId: receiptResult.receiptId,
                  receiptNumber: receiptResult.receiptNumber,
                  petsIncluded: createdPets.length
                });
              } else {
                console.error("❌ [SIMPLE-RECEIPT] Erro ao gerar comprovante:", receiptResult.error);
              }
            } catch (receiptError: any) {
              console.error("❌ [SIMPLE-RECEIPT] Erro ao gerar comprovante de pagamento:", receiptError.message);
            }
          }
          
          return res.status(200).json({
            success: true,
            message: "Pagamento aprovado com sucesso!",
            payment: {
              paymentId: paymentResult.payment.paymentId,
              status: paymentResult.payment.status,
              method: paymentMethod
            },
            client: {
              id: client.id,
              name: client.fullName,
              email: client.email
            }
          });
        } else {
          // Payment not approved
          return res.status(400).json({
            error: "Pagamento não autorizado",
            details: paymentResult.payment?.returnMessage || "Transação recusada",
            paymentMethod,
            status: paymentResult.payment?.status,
            returnCode: paymentResult.payment?.returnCode
          });
        }
      } else if (paymentMethod === 'pix') {
        // Process PIX payment
        console.log('🔄 [SIMPLE-PIX] Processando pagamento PIX');
        
        // Initialize Cielo service
        const cieloService = new CieloService();
        
        const pixRequest = {
          MerchantOrderId: `UNIPET-${Date.now()}`,
          Customer: {
            Name: customerName,
            Identity: customerCpf.replace(/\D/g, ''),
            IdentityType: 'CPF' as 'CPF' | 'CNPJ',
            Email: customerEmail
          },
          Payment: {
            Type: 'Pix' as const,
            Amount: correctAmountInCents,
            Provider: 'Cielo' as const
          }
        };
        
        let pixPaymentResult: any;
        try {
          pixPaymentResult = await cieloService.createPixPayment(pixRequest);
          console.log('✅ [SIMPLE-PIX] PIX gerado com sucesso:', {
            paymentId: pixPaymentResult.payment?.paymentId,
            hasQrCode: !!pixPaymentResult.payment?.qrCodeBase64Image,
            hasQrCodeString: !!pixPaymentResult.payment?.qrCodeString
          });
        } catch (pixError: any) {
          console.error('❌ [SIMPLE-PIX] Erro ao gerar PIX:', pixError);
          return res.status(400).json({
            error: 'Erro ao gerar código PIX',
            details: pixError.message
          });
        }
        
        // Check if PIX was generated successfully (status 12 = Pending)
        if (pixPaymentResult.payment?.status === 12) {
          // Create pets for PIX payment (immediately, not waiting for confirmation)
          let firstPetId = null;
          
          // Create pets immediately for PIX
          const createdPetsPix: any[] = [];
          if (petsToCreate && petsToCreate.length > 0) {
            for (const petData of petsToCreate) {
              const newPetData = {
                id: `pet-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
                clientId: client.id,
                name: petData.name || 'Pet',
                species: petData.species || 'Cão',
                breed: petData.breed || '',
                age: petData.age?.toString() || '1',
                sex: petData.sex || '',
                castrated: petData.castrated || false,
                weight: petData.weight?.toString() || '1',
                vaccineData: JSON.stringify([]),
                planId: selectedPlan.id,
                isActive: true
              };
              
              try {
                const pet = await storage.createPet(newPetData);
                createdPetsPix.push(pet);
                if (!firstPetId) firstPetId = pet.id;
                console.log(`✅ [SIMPLE-PIX] Pet criado: ${pet.name} (${pet.id})`);
              } catch (petError) {
                console.error(`⚠️ [SIMPLE-PIX] Erro ao criar pet (continuando):`, petError);
              }
            }
          }
          
          if (!firstPetId) {
            firstPetId = `temp-${Date.now()}`;
          }
          
          console.log(`📋 [SIMPLE-PIX] PIX gerado - ${createdPetsPix.length} pets criados com sucesso`);
          
          // Validate PIX response has required fields
          if (!pixPaymentResult.payment.qrCodeBase64Image || !pixPaymentResult.payment.qrCodeString) {
            console.error('❌ [SIMPLE-PIX] Resposta PIX incompleta - faltam QR Code ou código copia-cola');
            return res.status(400).json({
              error: 'Resposta PIX incompleta',
              details: 'QR Code ou código copia-cola não foram gerados corretamente'
            });
          }
          
          // Create contract for each pet (PIX pending payment)
          const contractsPix: any[] = [];
          for (let i = 0; i < createdPetsPix.length; i++) {
            const pet = createdPetsPix[i];
            
            // Calculate the correct price for this pet including discount
            let petMonthlyAmount = parseFloat(selectedPlan.basePrice || '0');
            
            // Apply discount for 2nd, 3rd, 4th+ pets for BASIC and INFINITY plans
            if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && i > 0) {
              const discountPercentage = i === 1 ? 5 :  // 2nd pet: 5%
                                       i === 2 ? 10 : // 3rd pet: 10%
                                       15;             // 4th+ pets: 15%
              petMonthlyAmount = petMonthlyAmount * (1 - discountPercentage / 100);
            }
            
            const contractData = {
              clientId: client.id,
              petId: pet.id,
              planId: selectedPlan.id,
              contractNumber: `UNIPET-${Date.now()}-${pet.id.substring(0, 4).toUpperCase()}`,
              billingPeriod: 'monthly' as const,
              status: 'active' as const,
              startDate: new Date(),
              monthlyAmount: petMonthlyAmount.toFixed(2),
              paymentMethod: 'pix',
              cieloPaymentId: pixPaymentResult.payment.paymentId,
              proofOfSale: pixPaymentResult.payment.proofOfSale || '',
              authorizationCode: pixPaymentResult.payment.authorizationCode || '',
              tid: pixPaymentResult.payment.tid || '',
              receivedDate: new Date(),
              returnCode: pixPaymentResult.payment.returnCode,
              returnMessage: pixPaymentResult.payment.returnMessage,
              pixQrCode: pixPaymentResult.payment.qrCodeBase64Image || null,
              pixCode: pixPaymentResult.payment.qrCodeString || null
            };
            
            try {
              const contract = await storage.createContract(contractData);
              contractsPix.push(contract);
              console.log(`✅ [SIMPLE-PIX] Contrato criado para pet ${pet.name}: ${contract.id}`);
            } catch (contractError: any) {
              console.error(`❌ [SIMPLE-PIX] Erro ao criar contrato para pet ${pet.name}:`, contractError);
            }
          }
          
          if (contractsPix.length === 0) {
            console.error(`❌ [SIMPLE-PIX] Nenhum contrato foi criado`);
            return res.status(503).json({
              error: 'Erro ao registrar pagamento',
              details: 'Não foi possível registrar o pagamento PIX. Por favor, tente novamente.',
              technicalDetails: process.env.NODE_ENV === 'development' ? 'Nenhum contrato foi criado' : undefined
            });
          }
          
          // Generate payment receipt with all pets for PIX
          try {
            const { PaymentReceiptService } = await import("./services/payment-receipt-service.js");
            const receiptService = new PaymentReceiptService();
            
            // Prepare pets data for receipt
            const petsForReceipt = createdPetsPix.map((pet, index) => {
              const basePrice = parseFloat(selectedPlan.basePrice || '0');
              let discountPercentage = 0;
              
              // Apply discount for 2nd, 3rd, 4th+ pets for BASIC and INFINITY plans
              if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && index > 0) {
                discountPercentage = index === 1 ? 5 :  // 2nd pet: 5%
                                    index === 2 ? 10 : // 3rd pet: 10%
                                    15;             // 4th+ pets: 15%
              }
              
              const discountedPrice = basePrice * (1 - discountPercentage / 100);
              
              return {
                name: pet.name || 'Pet',
                species: pet.species || 'Cão',
                breed: pet.breed,
                age: pet.age,
                weight: pet.weight,
                sex: pet.sex,
                planName: selectedPlan.name,
                planType: selectedPlan.planType || 'BASIC',
                value: Math.round(basePrice * 100),
                discount: discountPercentage,
                discountedValue: Math.round(discountedPrice * 100)
              };
            });
            
            const receiptData = {
              contractId: contractsPix[0].id,
              cieloPaymentId: pixPaymentResult.payment.paymentId,
              clientName: client.fullName,
              clientEmail: client.email,
              clientCPF: client.cpf,
              clientPhone: client.phone,
              pets: petsForReceipt,
              paymentMethod: 'pix',
              totalDiscount: 0,
              finalAmount: correctAmountInCents
            };
            
            console.log(`📄 [SIMPLE-PIX-RECEIPT] Gerando comprovante consolidado para ${createdPetsPix.length} pets`);
            const receiptResult = await receiptService.generatePaymentReceipt(receiptData, `simple_pix_${pixPaymentResult.payment.paymentId}`);
            
            if (receiptResult.success) {
              console.log("✅ [SIMPLE-PIX-RECEIPT] Comprovante oficial gerado com sucesso:", {
                receiptId: receiptResult.receiptId,
                receiptNumber: receiptResult.receiptNumber,
                petsIncluded: createdPetsPix.length
              });
            } else {
              console.error("❌ [SIMPLE-PIX-RECEIPT] Erro ao gerar comprovante:", receiptResult.error);
            }
          } catch (receiptError: any) {
            console.error("❌ [SIMPLE-PIX-RECEIPT] Erro ao gerar comprovante de pagamento PIX:", receiptError.message);
          }
          
          return res.status(200).json({
            success: true,
            message: "QR Code PIX gerado com sucesso!",
            payment: {
              paymentId: pixPaymentResult.payment.paymentId,
              status: pixPaymentResult.payment.status,
              method: paymentMethod,
              pixQrCode: pixPaymentResult.payment.qrCodeBase64Image,
              pixCode: pixPaymentResult.payment.qrCodeString
            },
            client: {
              id: client.id,
              name: client.fullName,
              email: client.email
            }
          });
        } else {
          // PIX generation failed
          return res.status(400).json({
            error: "Erro ao gerar código PIX",
            details: pixPaymentResult.payment?.returnMessage || "Não foi possível gerar o QR Code",
            paymentMethod,
            status: pixPaymentResult.payment?.status,
            returnCode: pixPaymentResult.payment?.returnCode
          });
        }
      } else {
        return res.status(400).json({
          error: "Método de pagamento não suportado",
          paymentMethod
        });
      }
      
    } catch (error: any) {
      console.error("❌ [SIMPLE-CHECKOUT] Erro:", error);
      
      return res.status(500).json({
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Step 3: Complete checkout with payment processing (after address/payment form)
  app.post("/api/checkout/process", async (req, res) => {
    try {
      console.log("🛒 [CHECKOUT-STEP3] Iniciando processamento do checkout");
      
      const { 
        clientId, 
        addressData, 
        paymentData, 
        planData,
        paymentMethod, // 'credit_card', 'pix'
        isRenewal,
        renewalContractId
      } = req.body;
      
      if (!clientId || !addressData || !paymentData || !planData || !paymentMethod) {
        return res.status(400).json({ 
          error: "Dados incompletos - clientId, addressData, paymentData, planData e paymentMethod são obrigatórios" 
        });
      }
      
      // CORREÇÃO: Validar consistência de cliente de forma mais robusta
      console.log("🔍 [CHECKOUT-VALIDATION] Validando dados do checkout:", {
        clientId,
        customerEmail: paymentData.customer?.email,
        customerName: paymentData.customer?.name
      });
      
      // Primeiro, verificar se o clientId enviado existe
      const clientById = await storage.getClientById(clientId);
      if (!clientById) {
        console.error("❌ [CHECKOUT-VALIDATION] Cliente não encontrado:", { clientId });
        return res.status(400).json({ 
          field: "clientId",
          error: "Cliente não encontrado no sistema",
          details: "Por favor, refaça o processo de checkout do início"
        });
      }
      
      // Verificar se há outro cliente que tem o mesmo email
      const clientByEmail = await storage.getClientByEmail(paymentData.customer?.email);
      let validatedClient = clientById;
      
      if (clientByEmail && clientByEmail.id !== clientId) {
        // Email já existe em outra conta - usar automaticamente a conta existente
        console.log("🔄 [CHECKOUT-VALIDATION] Email já vinculado a outra conta, usando conta existente:", {
          clientIdSent: clientId,
          clientIdExistente: clientByEmail.id,
          email: paymentData.customer?.email,
          nomeExistente: clientByEmail.fullName
        });
        
        validatedClient = clientByEmail;
        
        // Limpar cliente temporário se for diferente do existente
        if (clientId !== clientByEmail.id) {
          try {
            console.log(`🗑️ [CHECKOUT-VALIDATION] Removendo cliente temporário: ${clientId}`);
            await storage.deleteClient(clientId);
            console.log(`✅ [CHECKOUT-VALIDATION] Cliente temporário removido`);
          } catch (deleteError) {
            console.error(`⚠️ [CHECKOUT-VALIDATION] Erro ao remover cliente temporário:`, deleteError);
          }
        }
      }
      
      console.log("✅ [CHECKOUT-VALIDATION] Cliente validado com sucesso:", {
        clientId: validatedClient.id,
        email: validatedClient.email,
        name: validatedClient.fullName
      });
      
      // Track if we need to create a client after payment approval (não mais necessário pois já validamos)
      const needsClientCreation = false;

      // ============================================
      // VALIDATE PLAN-SPECIFIC PAYMENT RULES
      // ============================================
      
      // Plan ID mappings for business rules
      const PLAN_BUSINESS_RULES = {
        BASIC: '87aee1ab-774f-45bb-b43f-a4ca46ab21e5',
        COMFORT: '8e5dba0c-1ae1-44f6-a341-5f0139c1ec16', 
        PLATINUM: '734da3d8-a66f-4b44-ae63-befc6a3307fd',
        INFINITY: 'b48fabf4-1644-46e1-99c8-f8187de286ad'
      };

      // Function to determine plan type based on business rules
      const getPlanType = (planId: string): 'BASIC_INFINITY' | 'COMFORT_PLATINUM' | 'UNKNOWN' => {
        if (planId === PLAN_BUSINESS_RULES.BASIC || planId === PLAN_BUSINESS_RULES.INFINITY) {
          return 'BASIC_INFINITY';
        }
        
        if (planId === PLAN_BUSINESS_RULES.COMFORT || planId === PLAN_BUSINESS_RULES.PLATINUM) {
          return 'COMFORT_PLATINUM';
        }
        
        return 'UNKNOWN';
      };

      // Validate payment rules based on plan type
      const planType = getPlanType(planData.planId);
      const billingPeriod = planData.billingPeriod;
      const installments = paymentData.payment?.installments || 1;

      console.log("🔍 [PAYMENT-RULES] Validating payment rules:", {
        planId: planData.planId,
        planType,
        billingPeriod,
        installments,
        paymentMethod
      });

      // Rule 1: COMFORT and PLATINUM plans can only use annual billing
      if (planType === 'COMFORT_PLATINUM' && billingPeriod === 'monthly') {
        console.error("❌ [PAYMENT-RULES] Planos COMFORT/PLATINUM só permitem cobrança anual");
        return res.status(400).json({
          error: "Regra de pagamento violada",
          details: "Planos COMFORT e PLATINUM só aceitam pagamento anual"
        });
      }

      // Rule 2: BASIC and INFINITY plans can only use 1x installments with credit card
      if (planType === 'BASIC_INFINITY' && paymentMethod === 'credit_card' && installments > 1) {
        console.error("❌ [PAYMENT-RULES] Planos BASIC/INFINITY só permitem cartão 1x à vista");
        return res.status(400).json({
          error: "Regra de pagamento violada", 
          details: "Planos BASIC e INFINITY só aceitam cartão de crédito à vista (1x)"
        });
      }

      // Rule 3: COMFORT and PLATINUM plans can use up to 12x installments with credit card
      if (planType === 'COMFORT_PLATINUM' && paymentMethod === 'credit_card' && installments > 12) {
        console.error("❌ [PAYMENT-RULES] Planos COMFORT/PLATINUM permitem no máximo 12x no cartão");
        return res.status(400).json({
          error: "Regra de pagamento violada",
          details: "Planos COMFORT e PLATINUM permitem no máximo 12x no cartão de crédito"
        });
      }

      // Rule 4: PIX is always à vista (installments should be 1)
      if (paymentMethod === 'pix' && installments > 1) {
        console.error("❌ [PAYMENT-RULES] PIX só permite pagamento à vista");
        return res.status(400).json({
          error: "Regra de pagamento violada",
          details: "PIX só permite pagamento à vista"
        });
      }

      console.log("✅ [PAYMENT-RULES] Regras de pagamento validadas com sucesso");

      // ============================================
      // CALCULATE CORRECT PRICE FROM DATABASE
      // ============================================
      
      // Buscar plano no banco para obter preço correto
      const selectedPlan = await storage.getPlan(planData.planId);
      if (!selectedPlan) {
        console.error("❌ [PRICE-CALCULATION] Plano não encontrado:", planData.planId);
        return res.status(400).json({
          error: "Plano não encontrado",
          details: `Plano ${planData.planId} não existe no sistema`
        });
      }

      // Contar pets (assumindo 1 pet se não especificado)
      const petCount = paymentData.pets?.length || 1;
      
      // Calcular preço correto usando basePrice do banco de dados e aplicando descontos
      const basePriceDecimal = parseFloat(selectedPlan.basePrice || '0');
      const basePriceCents = Math.round(basePriceDecimal * 100);
      
      // Aplicar desconto apenas para planos Basic/Infinity e pets a partir do 2º
      let totalCents = 0;
      for (let i = 0; i < petCount; i++) {
        let petPriceCents = basePriceCents;
        
        if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && i > 0) {
          const discountPercentage = i === 1 ? 5 :  // 2º pet: 5%
                                   i === 2 ? 10 : // 3º pet: 10%
                                   15;             // 4º+ pets: 15%
          petPriceCents = Math.round(basePriceCents * (1 - discountPercentage / 100));
        }
        
        totalCents += petPriceCents;
      }
      
      const correctAmountInCents = totalCents;
      
      console.log("💰 [PRICE-CALCULATION] Preço calculado no servidor:", {
        planName: selectedPlan.name,
        basePrice: basePriceDecimal,
        petCount: petCount,
        totalWithDiscounts: (correctAmountInCents / 100).toFixed(2),
        correctAmountInCents: correctAmountInCents,
        receivedAmountFromClient: planData.amount,
        priceMatch: correctAmountInCents === planData.amount,
        isDiscountEligible: ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type))
      });

      // ============================================
      // SAVE CLIENT AND PET DATA BEFORE PAYMENT
      // ============================================
      
      console.log("💾 [PRE-PAYMENT] Salvando cliente e pet antes do pagamento...");

      // Atualizar dados completos do cliente (com endereço)
      // Note: usar fullName (camelCase) conforme schema
      // Filtrar campos undefined para evitar erro no Drizzle
      const updatedClientData = {
        fullName: paymentData.customer.name || validatedClient.fullName,
        email: paymentData.customer.email || validatedClient.email,
        cpf: paymentData.customer.cpf?.replace(/\D/g, '') || validatedClient.cpf,
        phone: paymentData.customer.phone || validatedClient.phone,
        cep: addressData.cep || null,
        address: addressData.address || null,
        number: addressData.number || null,
        complement: addressData.complement || null,
        district: addressData.district || null,
        city: addressData.city || null,
        state: addressData.state || null
      };
      
      // Remove undefined values to prevent Drizzle errors
      Object.keys(updatedClientData).forEach(key => {
        if (updatedClientData[key] === undefined) {
          delete updatedClientData[key];
        }
      });

      try {
        // Atualizar cliente com dados validados
        
        // Atualizar cliente com dados completos
        await storage.updateClient(validatedClient.id, updatedClientData);
        console.log("✅ [PRE-PAYMENT] Cliente atualizado com endereço completo");

        // Pets serão criados apenas após pagamento aprovado
        // Validar dados dos pets sem salvá-los
        if (paymentData.pets && paymentData.pets.length > 0) {
          for (const petData of paymentData.pets) {
            console.log("✅ [PRE-PAYMENT] Pet validado (será criado após pagamento):", { 
              name: petData.name, 
              species: petData.species || 'Cão' 
            });
          }
        }
      } catch (saveError) {
        console.error("❌ [PRE-PAYMENT] Erro ao salvar dados:", saveError);
        return res.status(500).json({
          error: "Erro ao salvar dados do cliente/pet",
          details: "Tente novamente em alguns instantes"
        });
      }
      
      // Import Cielo service
      const { CieloService } = await import("./services/cielo-service.js");
      const cieloService = new CieloService();
      
      let paymentResult;
      const merchantOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log("💳 [CHECKOUT-STEP3] Processando pagamento via Cielo:", {
        paymentMethod,
        clientId: validatedClient.id,
        clientEmail: validatedClient.email,
        paymentAmount: correctAmountInCents,
        originalAmount: planData.amount
      });
      
      try {
        switch (paymentMethod) {
          case 'credit_card':
            // Debug: verificar estrutura completa dos dados recebidos
            // ⚠️ SECURITY: Log de dados sensíveis removido para compliance PCI-DSS/LGPD
            // console.log("🔍 [CHECKOUT-DEBUG] Estrutura completa paymentData:", JSON.stringify(paymentData, null, 2));
            console.log("🔍 [CHECKOUT-DEBUG] payment existe?", !!paymentData.payment);
            console.log("🔍 [CHECKOUT-DEBUG] payment keys:", paymentData.payment ? Object.keys(paymentData.payment) : 'undefined');
            
            // Verificar se os dados do cartão existem
            if (!paymentData.payment || !paymentData.payment.cardNumber) {
              console.error("❌ [CHECKOUT-DEBUG] paymentData.payment não existe ou cardNumber missing");
              throw new Error('Dados do cartão de crédito não fornecidos ou incompletos');
            }
            
            const creditCardRequest = {
              merchantOrderId,
              customer: {
                name: paymentData.customer.name,
                email: paymentData.customer.email,
                identity: paymentData.customer.cpf?.replace(/\D/g, '') || paymentData.customer.identity,
                identityType: 'CPF' as 'CPF' | 'CNPJ',
                address: {
                  street: addressData.address || '',
                  number: addressData.number || 'S/N',
                  complement: addressData.complement || '',
                  zipCode: (addressData.cep || '').replace(/\D/g, ''),
                  city: addressData.city || '',
                  state: addressData.state || '',
                  country: 'BRA'
                }
              },
              payment: {
                type: 'CreditCard' as const,
                amount: correctAmountInCents,
                installments: paymentData.payment.installments || 1,
                capture: true,
                creditCard: {
                  cardNumber: paymentData.payment.cardNumber.replace(/\s/g, ''),
                  holder: paymentData.payment.holder || paymentData.payment.cardHolder, // Aceitar ambos os nomes
                  expirationDate: paymentData.payment.expirationDate,
                  securityCode: paymentData.payment.securityCode,
                  brand: 'Visa' // Detectar automaticamente ou usar padrão
                }
              }
            };
            paymentResult = await cieloService.createCreditCardPayment(creditCardRequest);
            break;
            
          case 'pix':
            const pixRequest = {
              MerchantOrderId: merchantOrderId,
              Customer: {
                Name: paymentData.customer.name,
                Identity: paymentData.customer.cpf?.replace(/\D/g, '') || paymentData.customer.identity,
                IdentityType: 'CPF' as 'CPF' | 'CNPJ',
                Email: paymentData.customer.email
              },
              Payment: {
                Type: 'Pix' as const,
                Amount: correctAmountInCents,
                Provider: 'Cielo' as const
              }
            };
            paymentResult = await cieloService.createPixPayment(pixRequest);
            break;
            
          default:
            return res.status(400).json({ 
              error: "Método de pagamento inválido" 
            });
        }
        
        console.log("✅ [CHECKOUT-STEP3] Pagamento processado:", {
          paymentId: paymentResult.payment?.paymentId,
          status: paymentResult.payment?.status,
          method: paymentMethod
        });
        
      } catch (paymentError: any) {
        console.error("❌ [CHECKOUT-STEP3] Erro no pagamento Cielo:", paymentError);
        return res.status(400).json({
          error: "Erro ao processar pagamento",
          details: paymentError.message,
          paymentMethod
        });
      }
      
      // If payment was successful, save address data and create contract
      const isPaymentSuccessful = paymentResult.payment?.status === 1 || // Authorized
                                  paymentResult.payment?.status === 2 || // Confirmed
                                  paymentResult.payment?.status === 12; // Pending (for pix)
      
      if (isPaymentSuccessful) {
        console.log("💾 [CHECKOUT-STEP3] Pagamento autorizado, salvando dados adicionais");
        
        try {
          let targetClient = validatedClient;
          
          // Create client automatically if credit card payment approved (status 2) and client doesn't exist
          if (needsClientCreation && paymentMethod === 'credit_card' && paymentResult.payment?.status === 2) {
            console.log("🔄 [CHECKOUT-AUTO-CLIENT] Criando cliente automaticamente após pagamento aprovado");
            
            // Validate required customer data
            if (!paymentData.customer?.name || !paymentData.customer?.email || !paymentData.customer?.cpf) {
              throw new Error('Dados do cliente insuficientes para criação automática');
            }
            
            // Hash CPF as password (using bcrypt)
            const cpfPassword = paymentData.customer.cpf.replace(/\D/g, ''); // Clean CPF
            const hashedPassword = await bcrypt.hash(cpfPassword, 12);
            
            // Prepare client data for creation
            const newClientData = {
              id: clientId, // Use the provided clientId
              fullName: paymentData.customer.name,
              email: paymentData.customer.email,
              phone: paymentData.customer.phone || '',
              cpf: cpfPassword,
              password: hashedPassword,
              // Include address data if available
              address: addressData.address || '',
              number: addressData.number || '',
              complement: addressData.complement || '',
              district: addressData.district || '',
              city: addressData.city || '',
              state: addressData.state || '',
              cep: addressData.cep || ''
            };
            
            // Create the new client
            targetClient = await storage.createClient(newClientData);
            
            console.log("✅ [CHECKOUT-AUTO-CLIENT] Cliente criado automaticamente com sucesso", {
              clientId: targetClient.id,
              email: targetClient.email,
              name: targetClient.fullName
            });
          } else if (!needsClientCreation) {
            // CRITICAL FIX: Get current client data to preserve CPF
            const currentClient = await storage.getClientById(clientId);
            console.log("🔄 [CHECKOUT-PROCESS] Preservando CPF do cliente:", { 
              clientId, 
              currentCpf: currentClient?.cpf ? 'PRESENTE' : 'AUSENTE',
              hasAddress: !!addressData.address 
            });
            
            // Update existing client with address data while preserving CPF
            targetClient = await storage.updateClient(clientId, {
              cpf: currentClient?.cpf, // CRITICAL FIX: Preserve CPF during address update
              address: addressData.address,
              number: addressData.number,
              complement: addressData.complement,
              district: addressData.district,
              city: addressData.city,
              state: addressData.state,
              cep: addressData.cep
            });
          } else {
            throw new Error('Cliente não existe e não foi possível criar automaticamente');
          }
          
          // Handle renewal mode vs new contract creation
          let contracts: any[] = [];
          
          if (isRenewal && renewalContractId) {
            console.log("🔄 [RENEWAL] Modo renovação detectado, atualizando contrato existente:", renewalContractId);
            
            // Get the existing contract to renew
            const existingContract = await storage.getContract(renewalContractId);
            if (!existingContract) {
              throw new Error(`Contrato para renovação não encontrado: ${renewalContractId}`);
            }
            
            // Verify the contract belongs to the client
            if (existingContract.clientId !== clientId) {
              throw new Error('Contrato não pertence ao cliente autenticado');
            }
            
            // Calculate new start date based on current contract expiration or today
            const currentDate = new Date();
            let newStartDate = currentDate;
            
            // If contract still has time, extend from the current end date
            if (existingContract.receivedDate) {
              const paymentDate = new Date(existingContract.receivedDate);
              const billingPeriod = existingContract.billingPeriod || 'monthly';
              const expirationDays = billingPeriod === 'annual' ? 365 : 30;
              const currentExpirationDate = new Date(paymentDate);
              currentExpirationDate.setDate(currentExpirationDate.getDate() + expirationDays);
              
              // If current contract hasn't expired yet, start from expiration date
              if (currentExpirationDate > currentDate) {
                newStartDate = currentExpirationDate;
              }
            }
            
            // Update the existing contract with renewal data
            const renewalData = {
              status: 'active' as const,
              startDate: newStartDate,
              monthlyAmount: (correctAmountInCents / 100).toString(), // Use server-calculated price
              paymentMethod: paymentMethod,
              cieloPaymentId: paymentResult.payment?.paymentId,
              // Payment proof data
              proofOfSale: paymentResult.payment?.proofOfSale,
              authorizationCode: paymentResult.payment?.authorizationCode,
              tid: paymentResult.payment?.tid,
              receivedDate: paymentResult.payment?.receivedDate ? new Date(paymentResult.payment.receivedDate) : new Date(),
              returnCode: paymentResult.payment?.returnCode,
              returnMessage: paymentResult.payment?.returnMessage,
              // PIX specific data
              pixQrCode: paymentMethod === 'pix' ? paymentResult.payment?.qrCodeBase64Image : null,
              pixCode: paymentMethod === 'pix' ? paymentResult.payment?.qrCodeString : null
            };
            
            console.log("📝 [RENEWAL] Atualizando contrato com dados de renovação:", {
              contractId: renewalContractId,
              contractNumber: existingContract.contractNumber,
              newStartDate: newStartDate.toISOString(),
              amount: renewalData.monthlyAmount
            });
            
            const updatedContract = await storage.updateContract(renewalContractId, renewalData);
            if (updatedContract) {
              contracts.push(updatedContract as any);
              console.log("✅ [RENEWAL] Contrato renovado com sucesso:", {
                contractId: updatedContract.id,
                contractNumber: updatedContract.contractNumber
              });
            }
          } else {
            // Standard flow: Get client's pets to create contracts
            console.log("📋 [NEW-CONTRACT] Criando pets após pagamento aprovado");
            // Create pets first (only after payment is approved)
            const createdPets = [];
            if (paymentData.pets && paymentData.pets.length > 0) {
              for (const petData of paymentData.pets) {
                const petId = `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newPet = {
                  id: petId,
                  clientId: targetClient.id,
                  name: petData.name,
                  species: petData.species || 'Cão',
                  breed: petData.breed || 'SRD',
                  age: petData.age ? petData.age.toString() : '1',
                  sex: petData.sex || 'Macho',
                  castrated: petData.castrated || false,
                  weight: petData.weight?.toString() || '1',
                  vaccineData: JSON.stringify([]),
                  isActive: true,
                  planId: planData.planId
                };
                
                try {
                  const pet = await storage.createPet(newPet);
                  createdPets.push(pet);
                  console.log("✅ [PAYMENT-APPROVED] Pet criado após pagamento aprovado:", { 
                    name: pet.name, 
                    species: pet.species,
                    petId: pet.id
                  });
                } catch (petError) {
                  console.error("⚠️ [PAYMENT-APPROVED] Erro ao criar pet (continuando):", petError);
                }
              }
            }
            
            const clientPets = createdPets.length > 0 ? createdPets : await storage.getPetsByClientId(clientId);
            
            // Create contract for each pet
            for (const pet of clientPets) {
            // Gerar número do contrato único
            const contractNumber = `UNIPET-${Date.now()}-${pet.id.substring(0, 4).toUpperCase()}`;
            
            const contractData = {
              clientId: clientId,
              petId: pet.id,
              planId: planData.planId,
              contractNumber: contractNumber, // Forçar no início
              status: 'active' as const,
              startDate: new Date(),
              monthlyAmount: (correctAmountInCents / 100).toString(), // Use server-calculated price
              paymentMethod: paymentMethod,
              cieloPaymentId: paymentResult.payment?.paymentId,
              // Payment proof data (for credit card and PIX)
              proofOfSale: paymentResult.payment?.proofOfSale,
              authorizationCode: paymentResult.payment?.authorizationCode,
              tid: paymentResult.payment?.tid,
              receivedDate: paymentResult.payment?.receivedDate ? new Date(paymentResult.payment.receivedDate) : null,
              returnCode: paymentResult.payment?.returnCode,
              returnMessage: paymentResult.payment?.returnMessage,
              // PIX specific data
              pixQrCode: paymentMethod === 'pix' ? paymentResult.payment?.qrCodeBase64Image : null,
              pixCode: paymentMethod === 'pix' ? paymentResult.payment?.qrCodeString : null
            };
            
            console.log("🔍 [ROUTES-DEBUG] contractData a ser passado:", JSON.stringify(contractData, null, 2));
            
            const contract = await storage.createContract(contractData);
            contracts.push(contract);
            }
          }
          
          // ✅ GERAR COMPROVANTES OFICIAIS DA CIELO para pagamentos aprovados
          if (paymentMethod === 'credit_card' && paymentResult.payment?.status === 2) {
            console.log("📄 [CHECKOUT-RECEIPT] Gerando comprovantes oficiais da Cielo...");
            
            try {
              // Import PaymentReceiptService
              const { PaymentReceiptService } = await import("./services/payment-receipt-service.js");
              const receiptService = new PaymentReceiptService();
              
              // Generate receipt for each created contract
              for (const contract of contracts) {
                try {
                  const pet = await storage.getPet(contract.petId);
                  const plan = await storage.getPlan(contract.planId);
                  
                  const receiptData = {
                    contractId: contract.id,
                    cieloPaymentId: paymentResult.payment?.paymentId,
                    clientName: paymentData.customer.name || targetClient.fullName,
                    clientEmail: targetClient.email,
                    petName: pet?.name || undefined,
                    planName: plan?.name || undefined
                  };
                  
                  console.log("📄 [CHECKOUT-RECEIPT] Gerando comprovante para contrato:", {
                    contractId: contract.id,
                    contractNumber: contract.contractNumber,
                    petName: pet?.name,
                    planName: plan?.name
                  });
                  
                  const result = await receiptService.generatePaymentReceipt(receiptData, `checkout_${paymentResult.payment?.paymentId}`);
                  
                  if (result.success) {
                    console.log("✅ [CHECKOUT-RECEIPT] Comprovante oficial gerado com sucesso:", {
                      receiptId: result.receiptId,
                      receiptNumber: result.receiptNumber,
                      contractNumber: contract.contractNumber
                    });
                  } else {
                    console.error("❌ [CHECKOUT-RECEIPT] Erro ao gerar comprovante:", {
                      contractId: contract.id,
                      error: result.error
                    });
                  }
                } catch (receiptError: any) {
                  console.error("❌ [CHECKOUT-RECEIPT] Erro crítico na geração do comprovante:", {
                    contractId: contract.id,
                    error: receiptError.message
                  });
                }
              }
            } catch (serviceError: any) {
              console.error("❌ [CHECKOUT-RECEIPT] Erro ao importar PaymentReceiptService:", serviceError.message);
            }
          }

          console.log("🎉 [CHECKOUT-STEP3] Checkout concluído com sucesso", {
            clientId,
            contractsCreated: contracts.length,
            paymentId: paymentResult.payment?.paymentId,
            clientCreatedAutomatically: needsClientCreation && paymentMethod === 'credit_card' && paymentResult.payment?.status === 2
          });
          
          // Return success response with client info (without password)
          const { password: _, ...clientResponse } = targetClient || {};
          
          res.status(200).json({
            success: true,
            message: "Checkout concluído com sucesso",
            payment: {
              status: paymentResult.payment?.status,
              paymentId: paymentResult.payment?.paymentId,
              orderId: merchantOrderId,
              method: paymentMethod,
              proofOfSale: paymentResult.payment?.proofOfSale,
              authorizationCode: paymentResult.payment?.authorizationCode,
              tid: paymentResult.payment?.tid,
              receivedDate: paymentResult.payment?.receivedDate,
              returnCode: paymentResult.payment?.returnCode,
              returnMessage: paymentResult.payment?.returnMessage,
              ...(paymentMethod === 'pix' && paymentResult.payment?.qrCodeBase64Image && {
                pixQrCode: paymentResult.payment.qrCodeBase64Image,
                pixCode: paymentResult.payment.qrCodeString
              })
            },
            contracts: contracts,
            client: clientResponse
          });
          
        } catch (saveError: any) {
          console.error("❌ [CHECKOUT-STEP3] Erro ao salvar dados pós-pagamento:", saveError);
          
          // Payment was successful but we couldn't save the data
          // This is a critical error that needs manual intervention
          res.status(500).json({
            error: "Pagamento processado mas erro ao salvar dados",
            paymentId: paymentResult.payment?.paymentId,
            orderId: merchantOrderId,
            details: "Entre em contato com o suporte informando o ID do pagamento"
          });
        }
        
      } else {
        console.log("❌ [CHECKOUT-STEP3] Pagamento não autorizado:", {
          status: paymentResult.payment?.status,
          returnCode: paymentResult.payment?.returnCode,
          returnMessage: paymentResult.payment?.returnMessage
        });
        
        // Payment failed - return error but don't save anything
        res.status(400).json({
          error: "Pagamento não autorizado",
          payment: {
            status: paymentResult.payment?.status,
            returnCode: paymentResult.payment?.returnCode,
            returnMessage: paymentResult.payment?.returnMessage,
            paymentId: paymentResult.payment?.paymentId,
            orderId: merchantOrderId
          }
        });
      }
      
    } catch (error: any) {
      console.error("❌ [CHECKOUT-STEP3] Erro geral no checkout:", error);
      
      res.status(500).json({
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // CLIENT AUTHENTICATION ROUTES
  
  // Client Registration
  app.post("/api/clients/register", async (req, res) => {
    try {
      const parsed = insertClientSchema.parse(req.body);
      
      // Check if client already exists
      const existingClient = await storage.getClientByEmail(parsed.email);
      if (existingClient) {
        return res.status(409).json({ error: "Cliente já cadastrado com este email" });
      }
      
      // Hash password
      // Validate password is provided
      if (!parsed.password) {
        return res.status(400).json({ error: "Senha é obrigatória" });
      }
      
      const hashedPassword = await bcrypt.hash(parsed.password, 12);
      
      // Create client with UUID
      const clientData = {
        ...parsed,
        fullName: parsed.full_name,
        password: hashedPassword,
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const newClient = await storage.createClient(clientData as any);
      
      // Don't return password in response
      const { password: _, ...clientResponse } = newClient;
      
      res.status(201).json({ 
        message: "Cliente cadastrado com sucesso", 
        client: clientResponse 
      });
      
    } catch (error: any) {
      console.error("❌ Error registering client:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Client Login
  app.post("/api/clients/login", async (req, res) => {
    try {
      const parsed = clientLoginSchema.parse(req.body);
      
      // Find client by email
      const client = await storage.getClientByEmail(parsed.email);
      if (!client) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      
      // Verify password - check both normal password and CPF
      let isValidAuth = false;
      
      // First, try normal password authentication
      try {
        if (client.password) {
          isValidAuth = await bcrypt.compare(parsed.password, client.password);
        }
      } catch (error) {
        console.log("Erro na comparação bcrypt, tentando CPF...");
      }
      
      // If normal password fails, try CPF authentication
      if (!isValidAuth && client.cpf) {
        // Remove any formatting from both CPFs for comparison
        const normalizedInputCpf = parsed.password.replace(/\D/g, '');
        const normalizedStoredCpf = client.cpf.replace(/\D/g, '');
        isValidAuth = normalizedInputCpf === normalizedStoredCpf;
      }
      
      if (!isValidAuth) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      
      // Store client in session
      req.session.client = {
        id: client.id,
        fullName: client.fullName,
        email: client.email
      };
      
      // Don't return password in response
      const { password: _, ...clientResponse } = client;
      
      res.json({ 
        message: "Login realizado com sucesso", 
        client: clientResponse 
      });
      
    } catch (error: any) {
      console.error("❌ Error during client login:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Client Logout
  app.post("/api/clients/logout", requireClient, (req, res) => {
    req.session.client = undefined;
    res.json({ message: "Logout realizado com sucesso" });
  });

  // Get Current Client
  app.get("/api/clients/me", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Fetch complete client data from database
      const client = await storage.getClientById(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Remove password field from response
      const { password: _, ...clientWithoutPassword } = client;

      res.json({ 
        client: clientWithoutPassword,
        message: "Cliente autenticado"
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Client profile image upload to Supabase Storage
  app.post("/api/clients/profile/image", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { image } = req.body;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      if (!image) {
        return res.status(400).json({ error: "Imagem não fornecida" });
      }

      // Converter base64 para buffer
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Detectar tipo MIME (assumir JPEG se não detectado)
      let mimeType = 'image/jpeg';
      if (image.startsWith('data:image/png')) {
        mimeType = 'image/png';
      }

      // Upload para Supabase Storage usando o SupabaseStorageService
      const uploadResult = await supabaseStorage.uploadClientImage(
        clientId, 
        imageBuffer, 
        mimeType,
        { maxWidth: 800, maxHeight: 600, quality: 85 }
      );

      if (!uploadResult.success) {
        return res.status(500).json({ 
          error: uploadResult.error || "Erro ao fazer upload da imagem" 
        });
      }

      // Atualizar o cliente com a nova URL da imagem
      const updatedClient = await storage.updateClient(clientId, { 
        imageUrl: uploadResult.publicUrl 
      });

      if (!updatedClient) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      // Remove password field from response
      const { password: _, ...clientWithoutPassword } = updatedClient;
      
      res.json({ 
        client: clientWithoutPassword,
        message: "Imagem do perfil atualizada com sucesso",
        imageUrl: uploadResult.publicUrl
      });
      
    } catch (error) {
      console.error("❌ Error uploading client profile image:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get Client's Pets
  app.get("/api/clients/pets", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get pets with their active plan information
      const petsWithPlans = [];
      const pets = await storage.getPetsByClientId(clientId);
      
      // For each pet, check for active contracts and plans
      for (const pet of pets) {
        let petWithPlan = { ...pet };
        
        try {
          // Get active contracts for this pet
          const activeContracts = await storage.getContractsByPetId(pet.id);
          const activeContract = activeContracts.find(contract => contract.status === 'active');
          
          if (activeContract) {
            // Get plan information for the active contract
            const plan = await storage.getPlan(activeContract.planId);
            if (plan) {
              (petWithPlan as any).plan = {
                id: plan.id,
                name: plan.name,
                basePrice: plan.basePrice,
                billingFrequency: plan.billingFrequency,
                description: plan.description,
                features: plan.features
              };
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching plan for pet ${pet.id}:`, error);
          // Continue processing other pets even if one fails
        }
        
        petsWithPlans.push(petWithPlan);
      }
      
      res.json({ 
        pets: petsWithPlans || [],
        message: petsWithPlans?.length ? `${petsWithPlans.length} pets encontrados` : "Nenhum pet cadastrado"
      });
      
    } catch (error) {
      console.error("❌ Error fetching client pets:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Update Pet Data
  app.put("/api/clients/pets/:petId", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const petId = req.params.petId;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Verificar se o pet pertence ao cliente
      const existingPet = await storage.getPet(petId);
      if (!existingPet) {
        return res.status(404).json({ error: "Pet não encontrado" });
      }
      
      if (existingPet.clientId !== clientId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Validar dados de entrada
      const validationResult = updatePetSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;
      
      // Remover campos que não devem ser alterados
      delete updateData.name;
      delete updateData.species;
      
      // Atualizar pet
      const updatedPet = await storage.updatePet(petId, updateData);
      
      res.json({ 
        pet: updatedPet,
        message: "Pet atualizado com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error updating pet:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Pet image upload to Supabase Storage
  app.post("/api/clients/pets/:petId/image", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const petId = req.params.petId;
      const { image } = req.body;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      if (!image) {
        return res.status(400).json({ error: "Imagem não fornecida" });
      }

      // Verificar se o pet pertence ao cliente
      const existingPet = await storage.getPet(petId);
      if (!existingPet) {
        return res.status(404).json({ error: "Pet não encontrado" });
      }
      
      if (existingPet.clientId !== clientId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Converter base64 para buffer
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Detectar tipo MIME (assumir JPEG se não detectado)
      let mimeType = 'image/jpeg';
      if (image.startsWith('data:image/png')) {
        mimeType = 'image/png';
      }

      // Upload para Supabase Storage usando o SupabaseStorageService
      const uploadResult = await supabaseStorage.uploadPetImage(
        petId, 
        imageBuffer, 
        mimeType,
        { maxWidth: 800, maxHeight: 600, quality: 85 }
      );

      if (!uploadResult.success) {
        return res.status(500).json({ 
          error: uploadResult.error || "Erro ao fazer upload da imagem" 
        });
      }

      // Atualizar o pet com a nova URL da imagem
      const updatedPet = await storage.updatePet(petId, { 
        imageUrl: uploadResult.publicUrl 
      });
      
      res.json({ 
        pet: updatedPet,
        message: "Imagem do pet atualizada com sucesso",
        imageUrl: uploadResult.publicUrl
      });
      
    } catch (error) {
      console.error("❌ Error uploading pet image:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get Pet's Guides
  // Delete Pet
  app.delete("/api/clients/pets/:petId", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const petId = req.params.petId;
      if (!clientId) return res.status(401).json({ error: "Cliente não autenticado" });
      const pet = await storage.getPet(petId);
      if (!pet) return res.status(404).json({ error: "Pet não encontrado" });
      if (pet.clientId !== clientId) return res.status(403).json({ error: "Acesso negado" });
      await storage.deletePet(petId);
      return res.json({ success: true, message: "Pet excluído com sucesso" });
    } catch (error) {
      console.error("❌ Error deleting pet:", error);
      return res.status(500).json({ error: "Erro ao excluir pet" });
    }
  });

  // Get Pet's Guides
  app.get("/api/clients/pets/:petId/guides", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const petId = req.params.petId;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Verificar se o pet pertence ao cliente
      const existingPet = await storage.getPet(petId);
      if (!existingPet) {
        return res.status(404).json({ error: "Pet não encontrado" });
      }
      
      if (existingPet.clientId !== clientId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Por enquanto, retornar array vazio pois não há guias específicas por pet
      // Em futuras implementações, isso pode ser expandido para guias personalizadas
      const guides = [];
      
      res.json({ 
        guides: guides,
        message: guides.length === 0 ? "Nenhuma guia encontrada para este pet" : "Guias carregadas com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching pet guides:", error);
      res.status(500).json({ error: "Erro ao carregar guias" });
    }
  });

  // Protected Client Route (example)
  app.get("/api/clients/dashboard", requireClient, async (req, res) => {
    try {
      const clientData = req.session.client;
      res.json({ 
        message: `Bem-vindo à área do cliente, ${clientData.fullName}!`,
        client: clientData
      });
    } catch (error) {
      console.error("❌ Error accessing client dashboard:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get contracts for authenticated client
  app.get("/api/clients/contracts", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get all contracts for the client
      const contracts = await storage.getContractsByClientId(clientId);
      
      if (!contracts || contracts.length === 0) {
        return res.json({ 
          contracts: [],
          message: "Nenhum contrato encontrado"
        });
      }

      // Build contracts list with pet and plan information using payment status evaluation
      const contractsWithDetails = [];
      for (const contract of contracts) {
        // Get pet and plan information
        const pet = await storage.getPet(contract.petId);
        const plan = await storage.getPlan(contract.planId);
        
        // Calculate actual payment status
        const paymentStatus = PaymentStatusService.evaluateContractPaymentStatus(contract);
        
        contractsWithDetails.push({
          id: contract.id,
          contractNumber: contract.contractNumber,
          status: paymentStatus.calculatedStatus, // Use calculated status instead of static status
          originalStatus: contract.status, // Keep original for reference
          startDate: contract.startDate,
          endDate: contract.endDate,
          monthlyAmount: contract.monthlyAmount,
          planName: plan?.name || 'Plano não encontrado',
          petName: pet?.name || 'Pet não encontrado',
          // Enhanced payment status information
          isOverdue: paymentStatus.isOverdue,
          daysPastDue: paymentStatus.daysPastDue,
          nextDueDate: paymentStatus.nextDueDate ? paymentStatus.nextDueDate.toISOString() : null,
          gracePeriodEnds: paymentStatus.gracePeriodEnds ? paymentStatus.gracePeriodEnds.toISOString() : null,
          statusReason: paymentStatus.statusReason,
          statusDescription: PaymentStatusService.getStatusDescription(paymentStatus),
          actionRequired: PaymentStatusService.getActionRequired(paymentStatus),
          // New time-based expiration fields
          expirationDate: paymentStatus.expirationDate ? paymentStatus.expirationDate.toISOString() : null,
          daysRemaining: paymentStatus.daysRemaining,
          isExpired: paymentStatus.isExpired
        });
      }

      // Sort by date (newest first)
      contractsWithDetails.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      });

      res.json({
        contracts: contractsWithDetails,
        message: `${contractsWithDetails.length} contrato(s) encontrado(s)`
      });
      
    } catch (error) {
      console.error("❌ Error fetching contracts:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get contract renewal data for authenticated client
  app.get("/api/contracts/:contractId/renewal", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const contractId = req.params.contractId;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      if (!contractId) {
        return res.status(400).json({ error: "ID do contrato é obrigatório" });
      }

      // Get the specific contract
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }

      // Verify contract belongs to the authenticated client
      if (contract.clientId !== clientId) {
        return res.status(403).json({ error: "Acesso negado ao contrato" });
      }

      // Get pet and plan information
      const pet = await storage.getPet(contract.petId);
      const plan = await storage.getPlan(contract.planId);
      const client = await storage.getClientById(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Calculate payment status
      const paymentStatus = PaymentStatusService.evaluateContractPaymentStatus(contract);
      
      res.json({
        success: true,
        renewalData: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          amount: parseFloat(contract.monthlyAmount) || 0,
          billingPeriod: contract.billingPeriod || 'monthly',
          client: {
            id: client.id,
            name: client.fullName,
            email: client.email,
            cpf: client.cpf,
            phone: client.phone,
            address: client.address,
            number: client.number,
            complement: client.complement,
            district: client.district,
            city: client.city,
            state: client.state,
            zipCode: (client as any).zipCode || client.cep
          },
          pet: {
            id: pet?.id,
            name: pet?.name || 'Pet não encontrado',
            species: pet?.species,
            breed: pet?.breed,
            age: pet?.age,
            weight: pet?.weight
          },
          plan: {
            id: plan?.id,
            name: plan?.name || 'Plano não encontrado',
            price: parseFloat(contract.monthlyAmount) || 0
          },
          paymentStatus: {
            status: paymentStatus.calculatedStatus,
            isExpired: paymentStatus.isExpired,
            daysRemaining: paymentStatus.daysRemaining,
            expirationDate: paymentStatus.expirationDate ? paymentStatus.expirationDate.toISOString() : null
          }
        }
      });
      
    } catch (error) {
      console.error("❌ Error fetching contract renewal data:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get payment history for authenticated client
  app.get("/api/clients/payment-history", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get all contracts for the client with payment data
      const contracts = await storage.getContractsByClientId(clientId);
      
      if (!contracts || contracts.length === 0) {
        return res.json({ 
          paymentHistory: [],
          message: "Nenhum histórico de pagamento encontrado"
        });
      }

      // Build payment history with detailed information
      const paymentHistoryWithDetails = [];
      for (const contract of contracts) {
        // Get pet and plan information
        const pet = await storage.getPet(contract.petId);
        const plan = await storage.getPlan(contract.planId);
        
        // Calculate actual payment status using PaymentStatusService
        const paymentStatusResult = PaymentStatusService.evaluateContractPaymentStatus(contract);
        const paymentStatus = paymentStatusResult.calculatedStatus;
        
        // Only include payments that were actually paid (successful payments)
        // Skip contracts that were generated but never paid
        const hasValidPayment = contract.receivedDate && contract.returnCode && ['00', '0'].includes(contract.returnCode);
        
        if (!hasValidPayment) {
          continue; // Skip unpaid/unsuccessful payments
        }
        
        const paymentHistoryItem = {
          id: contract.id,
          contractNumber: contract.contractNumber,
          petName: pet?.name || 'Pet não encontrado',
          planName: plan?.name || 'Plano não encontrado',
          amount: parseFloat(contract.monthlyAmount) || 0,
          paymentMethod: contract.paymentMethod || 'Não informado',
          status: paymentStatus,
          paymentId: contract.cieloPaymentId || '',
          // Cielo payment data
          proofOfSale: contract.proofOfSale || '', // NSU
          authorizationCode: contract.authorizationCode || '',
          tid: contract.tid || '',
          receivedDate: contract.receivedDate ? contract.receivedDate.toISOString() : '',
          returnCode: contract.returnCode || '',
          returnMessage: contract.returnMessage || '',
          // PIX specific data
          pixQrCode: contract.pixQrCode || '',
          pixCode: contract.pixCode || ''
        };

        paymentHistoryWithDetails.push(paymentHistoryItem);
      }

      // Sort by received date (newest first), fallback to start date
      paymentHistoryWithDetails.sort((a, b) => {
        const dateA = new Date(a.receivedDate || contracts.find(c => c.id === a.id)?.startDate || 0);
        const dateB = new Date(b.receivedDate || contracts.find(c => c.id === b.id)?.startDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      res.json({
        paymentHistory: paymentHistoryWithDetails,
        message: `${paymentHistoryWithDetails.length} histórico(s) de pagamento encontrado(s)`
      });
      
    } catch (error) {
      console.error("❌ Error fetching payment history:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get surveys for authenticated client
  app.get("/api/clients/surveys", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get all surveys for the client
      const surveys = await storage.getSatisfactionSurveysByClientId(clientId);
      
      if (!surveys || surveys.length === 0) {
        return res.json({ 
          surveys: [],
          message: "Nenhuma pesquisa encontrada"
        });
      }

      // Build surveys list with additional information
      const surveysWithDetails = [];
      for (const survey of surveys) {
        let additionalInfo = {};
        
        // Get contract info if survey is related to a contract
        if (survey.contractId) {
          const contract = await storage.getContract(survey.contractId);
          if (contract) {
            additionalInfo = { contractNumber: contract.contractNumber };
          }
        }
        
        // Get service info if survey is related to service history
        if (survey.serviceHistoryId) {
          // Get service history details
          additionalInfo = { ...additionalInfo, serviceName: "Atendimento Veterinário" };
        }
        
        // Get protocol info if survey is related to a protocol
        if (survey.protocolId) {
          const protocol = await storage.getProtocol(survey.protocolId);
          if (protocol) {
            additionalInfo = { ...additionalInfo, protocolSubject: protocol.subject };
          }
        }
        
        surveysWithDetails.push({
          id: survey.id,
          contractId: survey.contractId,
          serviceHistoryId: survey.serviceHistoryId,
          protocolId: survey.protocolId,
          rating: survey.rating,
          feedback: survey.feedback,
          suggestions: survey.suggestions,
          wouldRecommend: survey.wouldRecommend,
          respondedAt: survey.respondedAt,
          createdAt: survey.createdAt,
          ...additionalInfo
        });
      }

      // Sort by date (newest first)
      surveysWithDetails.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      res.json({
        surveys: surveysWithDetails,
        message: `${surveysWithDetails.length} pesquisa(s) encontrada(s)`
      });
      
    } catch (error) {
      console.error("❌ Error fetching surveys:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Submit survey response for authenticated client
  app.post("/api/clients/surveys/:surveyId/response", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const surveyId = req.params.surveyId;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Verify survey belongs to client
      const existingSurvey = await storage.getSatisfactionSurvey(surveyId);
      if (!existingSurvey) {
        return res.status(404).json({ error: "Pesquisa não encontrada" });
      }
      
      if (existingSurvey.clientId !== clientId) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Validate input
      const { rating, feedback, suggestions, wouldRecommend } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Avaliação deve ser entre 1 e 5 estrelas" });
      }

      // Update survey with response
      const updateData = {
        rating: parseInt(rating),
        feedback: feedback || null,
        suggestions: suggestions || null,
        wouldRecommend: wouldRecommend !== undefined ? Boolean(wouldRecommend) : null,
        respondedAt: new Date()
      };
      
      // Note: updateSatisfactionSurvey method doesn't exist in storage interface
      // We'll create and return the updated survey data
      const updatedSurvey = { ...existingSurvey, ...updateData };
      
      res.json({ 
        survey: updatedSurvey,
        message: "Resposta enviada com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error submitting survey response:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create a new satisfaction survey for authenticated client
  app.post("/api/clients/surveys", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      const { rating, feedback, suggestions, wouldRecommend } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Avaliação de 1 a 5 estrelas é obrigatória" });
      }

      // Create new satisfaction survey
      const newSurvey = await storage.createSatisfactionSurvey({
        clientId,
        rating: parseInt(rating),
        feedback: feedback || null,
        suggestions: suggestions || null,
        wouldRecommend: wouldRecommend !== undefined ? Boolean(wouldRecommend) : null
      });

      res.json({ 
        survey: newSurvey,
        message: "Pesquisa de satisfação enviada com sucesso! Obrigado pelo seu feedback."
      });
      
    } catch (error) {
      console.error("❌ Error creating satisfaction survey:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get procedures with coparticipation values for authenticated client
  app.get("/api/clients/procedures", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get planId from query params for filtering
      const planId = req.query.planId as string;

      // Get procedures with real coparticipation data from database
      const procedures = await storage.getProceduresWithCoparticipation(planId);
      
      if (!procedures || procedures.length === 0) {
        return res.json({ 
          procedures: [],
          message: planId ? "Nenhum procedimento encontrado para este plano" : "Nenhum procedimento encontrado"
        });
      }

      // Format procedures with real database information
      const proceduresWithDetails = procedures.map(procedure => {
        // Use real coparticipation value from database, format to currency string
        const formatCoparticipationValue = (value: any): string => {
          if (!value || value === 0 || value === "0" || value === "0.00") {
            return "0.00";
          }
          // Convert from centavos to reais (value comes as integers: 2000 = R$ 20.00)
          const valueInReais = Number(value) / 100;
          return valueInReais.toFixed(2);
        };

        // Use real coverage percentage from database
        const formatCoveragePercentage = (value: any): number => {
          if (!value || value === 0) {
            return 0;
          }
          return Number(value);
        };

        return {
          id: procedure.id,
          name: procedure.name,
          description: procedure.description || 'Procedimento veterinário especializado',
          procedureType: procedure.category || 'geral',
          coparticipationValue: formatCoparticipationValue(procedure.coparticipacao),
          coveragePercentage: formatCoveragePercentage(100), // Default coverage percentage
          isActive: procedure.is_active,
          createdAt: procedure.created_at,
          isIncluded: procedure.is_included,
          waitingPeriodDays: 0, // Default waiting period
          planId: procedure.plan_id
        };
      });

      // Sort by procedure type and name
      proceduresWithDetails.sort((a, b) => {
        if (a.procedureType !== b.procedureType) {
          return a.procedureType.localeCompare(b.procedureType);
        }
        return a.name.localeCompare(b.name);
      });

      res.json({
        procedures: proceduresWithDetails,
        message: `${proceduresWithDetails.length} procedimento(s) encontrado(s)`,
        filteredByPlan: !!planId
      });
      
    } catch (error) {
      console.error("❌ Error fetching procedures:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get active plans for filter dropdown
  app.get("/api/clients/plans", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get all active plans
      const plans = await storage.getAllActivePlans();
      
      if (!plans || plans.length === 0) {
        return res.json({ 
          plans: [],
          message: "Nenhum plano encontrado"
        });
      }

      // Format plans for dropdown
      const plansForFilter = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        isActive: plan.isActive
      }));

      res.json({
        plans: plansForFilter,
        message: `${plansForFilter.length} plano(s) encontrado(s)`
      });
      
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });


  // Update Client Profile
  app.put("/api/clients/profile", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      
      if (!clientId) {
        return res.status(401).json({ error: "Cliente não autenticado" });
      }

      // Get current client data
      const currentClient = await storage.getClientById(clientId);
      if (!currentClient) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Extract fields that can be updated
      const { full_name, email, phone, address, number, complement, district, state, city, cep } = req.body;
      
      // Prepare update data (only allow certain fields to be updated)
      const updateData: any = {};
      if (full_name !== undefined) updateData.fullName = full_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (number !== undefined) updateData.number = number;
      if (complement !== undefined) updateData.complement = complement;
      if (district !== undefined) updateData.district = district;
      if (state !== undefined) updateData.state = state;
      if (city !== undefined) updateData.city = city;
      if (cep !== undefined) updateData.cep = cep;

      // Update client
      const updatedClient = await storage.updateClient(clientId, updateData);
      
      if (!updatedClient) {
        return res.status(500).json({ error: "Erro ao atualizar dados do cliente" });
      }

      // Update session data
      req.session.client = {
        id: updatedClient.id,
        fullName: updatedClient.fullName,
        email: updatedClient.email
      };

      // Don't return password in response
      const { password: _, ...clientResponse } = updatedClient;
      
      res.json({ 
        client: clientResponse,
        message: "Dados do cliente atualizados com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error updating client profile:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Client profile image upload removed - images now served from Supabase Storage only

  // CUSTOMER AREA - 9 COMPREHENSIVE FUNCTIONALITIES

  // 1. View Contract
  app.get("/api/customer/contract", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const contracts = await storage.getContractsByClientId(clientId);
      
      if (!contracts || contracts.length === 0) {
        return res.status(404).json({ error: "Nenhum contrato encontrado" });
      }

      // Get the most recent active contract
      const activeContract = contracts.find(c => c.status === 'active') || contracts[0];
      
      res.json({
        contract: activeContract,
        message: "Contrato recuperado com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching contract:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 2. View Subscribed Plan (with/without co-participation)
  app.get("/api/customer/plan", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const contracts = await storage.getContractsByClientId(clientId);
      
      if (!contracts || contracts.length === 0) {
        return res.status(404).json({ error: "Nenhum plano contratado encontrado" });
      }

      const activeContract = contracts.find(c => c.status === 'active') || contracts[0];
      const plan = await storage.getPlan(activeContract.planId);
      
      res.json({
        plan: {
          ...plan,
          has_coparticipation: activeContract.hasCoparticipation,
          coparticipation_percentage: activeContract.hasCoparticipation ? 100 : 0,
          monthly_value: activeContract.monthlyAmount,
          contract_date: activeContract.createdAt
        },
        message: "Plano recuperado com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching plan:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 3. Check Included Services in Plan
  app.get("/api/customer/services", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const contracts = await storage.getContractsByClientId(clientId);
      
      if (!contracts || contracts.length === 0) {
        return res.status(404).json({ error: "Nenhum contrato encontrado" });
      }

      const activeContract = contracts.find(c => c.status === 'active') || contracts[0];
      const planProcedures = await storage.getPlanProcedures(activeContract.planId);
      
      // Get procedure details for each included service
      const services = await Promise.all(
        planProcedures.map(async (pp) => {
          const procedure = await storage.getProcedure(pp.procedureId);
          return {
            ...procedure,
            coverage_percentage: pp.coverageOverride || 100,
            limit_per_year: null,
            requires_authorization: false
          };
        })
      );
      
      res.json({
        services,
        total_services: services.length,
        message: "Serviços inclusos recuperados com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 4. Service History and Consumption
  app.get("/api/customer/history", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { year, procedure_id } = req.query;
      
      const pets = await storage.getPetsByClientId(clientId);
      const petIds = pets.map(p => p.id);
      
      // Get service history for each pet and flatten the results
      const historyPromises = petIds.map(petId => storage.getServiceHistoryByPetId(petId));
      const historyArrays = await Promise.all(historyPromises);
      let history = historyArrays.flat();
      
      // Filter by year if provided
      if (year) {
        const targetYear = parseInt(year as string);
        history = history.filter(h => new Date(h.serviceDate).getFullYear() === targetYear);
      }
      
      // Filter by procedure if provided
      if (procedure_id) {
        history = history.filter(h => h.procedureId === procedure_id);
      }
      
      // Calculate consumption statistics
      const consumption = history.reduce((acc, service) => {
        const procedureId = service.procedureId;
        if (!acc[procedureId]) {
          acc[procedureId] = {
            procedure_id: procedureId,
            procedure_name: 'N/A',
            total_uses: 0,
            total_cost: 0,
            total_coverage: 0,
            total_coparticipation: 0
          };
        }
        acc[procedureId].total_uses++;
        acc[procedureId].total_cost += parseFloat(service.totalAmount);
        acc[procedureId].total_coverage += parseFloat(service.coverageAmount);
        acc[procedureId].total_coparticipation += parseFloat(service.coparticipationAmount);
        return acc;
      }, {} as any);
      
      res.json({
        history,
        consumption: Object.values(consumption),
        summary: {
          total_services: history.length,
          total_cost: history.reduce((sum, h) => sum + parseFloat(h.totalAmount), 0),
          total_coverage: history.reduce((sum, h) => sum + parseFloat(h.coverageAmount), 0),
          total_coparticipation: history.reduce((sum, h) => sum + parseFloat(h.coparticipationAmount), 0)
        },
        message: "Histórico recuperado com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching service history:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });




  // 6. Check Out-of-Coverage Costs
  app.get("/api/customer/out-of-coverage", requireClient, async (req, res) => {
    try {
      const { procedureType } = req.query;
      
      // Get all procedures not covered by any plan (or procedures with 0% coverage)
      const allProcedures = await storage.getAllProcedures();
      
      let outOfCoverageProcedures = allProcedures;
      
      // Filter by procedure type if provided
      if (procedureType) {
        outOfCoverageProcedures = allProcedures.filter(p => p.category === procedureType);
      }
      
      const categorizedProcedures = outOfCoverageProcedures.reduce((acc, procedure) => {
        const cat = procedure.category;
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push({
          id: procedure.id,
          name: procedure.name,
          description: procedure.description,
          base_cost: 0, // Default value since coparticipationValue doesn't exist
          estimated_cost: 0, // Default value
          requires_authorization: true // Usually out-of-coverage requires authorization
        });
        return acc;
      }, {} as any);
      
      res.json({
        out_of_coverage_procedures: categorizedProcedures,
        categories: Object.keys(categorizedProcedures),
        total_procedures: outOfCoverageProcedures.length,
        message: "Procedimentos fora da cobertura recuperados com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching out-of-coverage procedures:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 7. Request Plan Change
  app.post("/api/customer/plan-change", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { new_plan_id, reason, requested_change_date } = req.body;
      
      if (!new_plan_id || !reason) {
        return res.status(400).json({ error: "Plano desejado e motivo são obrigatórios" });
      }
      
      // Verify the new plan exists
      const newPlan = await storage.getPlan(new_plan_id);
      if (!newPlan) {
        return res.status(404).json({ error: "Plano solicitado não encontrado" });
      }
      
      // Create a protocol for plan change request
      const protocolData = {
        clientId: clientId,
        type: 'plan_change' as const,
        subject: `Solicitação de mudança de plano - ${newPlan.name}`,
        description: `Cliente solicitou mudança para o plano: ${newPlan.name}\nMotivo: ${reason}\nData solicitada: ${requested_change_date || 'O mais breve possível'}`,
        status: 'open' as const,
        priority: 'medium' as const
      };
      
      const protocol = await storage.createProtocol(protocolData as any);
      
      res.status(201).json({
        protocol,
        new_plan: newPlan,
        message: "Solicitação de mudança de plano enviada com sucesso. Você receberá um retorno em até 2 dias úteis."
      });
      
    } catch (error) {
      console.error("❌ Error creating plan change request:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 8. Open Support Protocols
  app.post("/api/customer/protocols", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { type, subject, description, priority } = req.body;
      
      if (!type || !subject || !description) {
        return res.status(400).json({ error: "Tipo, assunto e descrição são obrigatórios" });
      }
      
      const validTypes = ['complaint', 'suggestion', 'question', 'technical_issue', 'billing', 'plan_change'];
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Tipo de protocolo inválido" });
      }
      
      const protocolData = {
        clientId: clientId,
        type: type as 'complaint' | 'information' | 'plan_change' | 'cancellation' | 'emergency' | 'other',
        subject,
        description,
        status: 'open' as const,
        priority: validPriorities.includes(priority) ? (priority as 'low' | 'medium' | 'high' | 'urgent') : 'medium' as const
      };
      
      const protocol = await storage.createProtocol(protocolData as any);
      
      res.status(201).json({
        protocol,
        message: "Protocolo aberto com sucesso. Você receberá um retorno em até 2 dias úteis."
      });
      
    } catch (error) {
      console.error("❌ Error creating protocol:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get Customer Protocols
  app.get("/api/customer/protocols", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { status, type } = req.query;
      
      let protocols = await storage.getProtocolsByClientId(clientId);
      
      // Filter by status if provided
      if (status) {
        protocols = protocols.filter(p => p.status === status);
      }
      
      // Filter by type if provided
      if (type) {
        protocols = protocols.filter(p => p.type === type);
      }
      
      // Sort by creation date (newest first)
      protocols.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json({
        protocols,
        total: protocols.length,
        message: "Protocolos recuperados com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching protocols:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 9. Satisfaction Surveys
  app.get("/api/customer/surveys", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const surveys = await storage.getSatisfactionSurveysByClientId(clientId);
      
      // Since SatisfactionSurvey doesn't have status, return all surveys
      // They are considered completed when they have a rating
      const completedSurveys = surveys.filter(s => s.rating > 0);
      const pendingSurveys = surveys.filter(s => s.rating === 0);
      
      res.json({
        pending_surveys: pendingSurveys,
        completed_surveys: completedSurveys,
        total_pending: pendingSurveys.length,
        total_completed: completedSurveys.length,
        message: "Pesquisas recuperadas com sucesso"
      });
      
    } catch (error) {
      console.error("❌ Error fetching surveys:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Submit Survey Response
  app.post("/api/customer/surveys/:surveyId/response", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const { surveyId } = req.params;
      const { responses, overall_rating, comments } = req.body;
      
      if (!responses || !overall_rating) {
        return res.status(400).json({ error: "Respostas e avaliação geral são obrigatórias" });
      }
      
      // Get the survey to verify it belongs to the client and is pending
      const survey = await storage.getSatisfactionSurvey(surveyId);
      if (!survey || survey.clientId !== clientId) {
        return res.status(404).json({ error: "Pesquisa não encontrada" });
      }
      
      // For now, just return a success response since there's no update method
      // This functionality would need to be implemented in storage layer
      res.json({
        message: "Pesquisa respondida com sucesso. Obrigado pelo seu feedback!"
      });
      
    } catch (error) {
      console.error("❌ Error submitting survey response:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ========================================
  // PAYMENT MANAGEMENT ENDPOINTS
  // ========================================

  // Capture authorized payment
  app.post("/api/payments/capture/:paymentId", requireAuth, async (req, res) => {
    const correlationId = req.headers['x-correlation-id'] as string || 
                         Math.random().toString(36).substring(7);
    
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ 
          error: "paymentId é obrigatório",
          correlationId 
        });
      }

      // Validate request body if amount is provided
      let validatedData: { amount?: number } = {};
      if (req.body && Object.keys(req.body).length > 0) {
        try {
          validatedData = paymentCaptureSchema.parse(req.body);
        } catch (validationError) {
          return res.status(400).json({
            error: "Dados de captura inválidos",
            details: validationError instanceof Error ? validationError.message : 'Erro de validação',
            correlationId
          });
        }
      }
      
      console.log('🔒 [PAYMENT-CAPTURE] Iniciando captura de pagamento', {
        correlationId,
        paymentId,
        amount: validatedData.amount,
        userId: req.session.userId
      });

      // Import Cielo service
      const { CieloService } = await import("./services/cielo-service.js");
      const cieloService = new CieloService();

      // Capture the payment
      const captureResult = await cieloService.capturePayment(paymentId, validatedData.amount);
      
      // Update contract status if capture is successful
      if (captureResult && captureResult.payment) {
        const { storage } = await import('./storage.js');
        
        // Find contract by payment ID and update status
        const contract = await storage.getContractByCieloPaymentId(paymentId);
        
        if (contract) {
          const updateData = {
            status: 'active' as const,
            returnCode: captureResult.payment.returnCode || '',
            returnMessage: captureResult.payment.returnMessage || '',
            capturedAmount: captureResult.payment.capturedAmount || 0,
            capturedDate: new Date()
          };
          
          await storage.updateContract(contract.id, updateData);
          console.log('✅ [PAYMENT-CAPTURE] Contrato atualizado', {
            correlationId,
            contractId: contract.id,
            newStatus: 'active'
          });
        }
      }

      res.json({
        success: true,
        message: "Pagamento capturado com sucesso",
        data: {
          paymentId,
          status: captureResult.payment?.status || 'captured',
          capturedAmount: captureResult.payment?.capturedAmount || validatedData.amount || 0,
          capturedDate: new Date().toISOString(),
          correlationId
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT-CAPTURE] Erro ao capturar pagamento', {
        correlationId,
        paymentId: req.params.paymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      const statusCode = error instanceof Error && error.message.includes('404') ? 404 : 500;
      res.status(statusCode).json({
        error: "Erro ao capturar pagamento",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        correlationId
      });
    }
  });

  // Cancel payment
  app.post("/api/payments/cancel/:paymentId", requireAuth, async (req, res) => {
    const correlationId = req.headers['x-correlation-id'] as string || 
                         Math.random().toString(36).substring(7);
    
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ 
          error: "paymentId é obrigatório",
          correlationId 
        });
      }

      // Validate request body if amount is provided
      let validatedData: { amount?: number } = {};
      if (req.body && Object.keys(req.body).length > 0) {
        try {
          validatedData = paymentCancelSchema.parse(req.body);
        } catch (validationError) {
          return res.status(400).json({
            error: "Dados de cancelamento inválidos",
            details: validationError instanceof Error ? validationError.message : 'Erro de validação',
            correlationId
          });
        }
      }
      
      console.log('🚫 [PAYMENT-CANCEL] Iniciando cancelamento de pagamento', {
        correlationId,
        paymentId,
        amount: validatedData.amount,
        userId: req.session.userId
      });

      // Import Cielo service
      const { CieloService } = await import("./services/cielo-service.js");
      const cieloService = new CieloService();

      // Cancel the payment
      const cancelResult = await cieloService.cancelPayment(paymentId, validatedData.amount);
      
      // Update contract status if cancellation is successful
      if (cancelResult && cancelResult.payment) {
        const { storage } = await import('./storage.js');
        
        // Find contract by payment ID and update status
        const contract = await storage.getContractByCieloPaymentId(paymentId);
        
        if (contract) {
          const updateData = {
            status: 'cancelled' as const,
            returnCode: cancelResult.payment.returnCode || '',
            returnMessage: cancelResult.payment.returnMessage || '',
            cancelledDate: new Date()
          };
          
          await storage.updateContract(contract.id, updateData);
          console.log('✅ [PAYMENT-CANCEL] Contrato cancelado', {
            correlationId,
            contractId: contract.id,
            newStatus: 'cancelled'
          });
        }
      }

      res.json({
        success: true,
        message: "Pagamento cancelado com sucesso",
        data: {
          paymentId,
          status: 'cancelled',
          cancelledAmount: cancelResult.payment?.amount || validatedData.amount || 0,
          cancelledDate: new Date().toISOString(),
          correlationId
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT-CANCEL] Erro ao cancelar pagamento', {
        correlationId,
        paymentId: req.params.paymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      const statusCode = error instanceof Error && error.message.includes('404') ? 404 : 500;
      res.status(statusCode).json({
        error: "Erro ao cancelar pagamento",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        correlationId
      });
    }
  });

  // Query payment status
  // Permitir polling do PIX sem autenticação quando vem do checkout
  app.get("/api/payments/query/:paymentId", async (req, res) => {
    // Verificar autenticação - permitir polling do checkout sem auth
    const isCheckoutPolling = req.headers['x-checkout-polling'] === 'true';
    if (!isCheckoutPolling && !req.session?.userId) {
      return res.status(401).json({ error: "Autenticação necessária" });
    }
    const correlationId = req.headers['x-correlation-id'] as string || 
                         Math.random().toString(36).substring(7);
    
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ 
          error: "paymentId é obrigatório",
          correlationId 
        });
      }
      
      console.log('🔍 [PAYMENT-QUERY] Consultando status de pagamento', {
        correlationId,
        paymentId,
        userId: req.session.userId
      });

      // Import Cielo service
      const { CieloService } = await import("./services/cielo-service.js");
      const cieloService = new CieloService();

      // Query the payment status
      const queryResult = await cieloService.queryPayment(paymentId);
      
      // Also get local contract information
      const { storage } = await import('./storage.js');
      let contract = await storage.getContractByCieloPaymentId(paymentId);
      
      // ✅ NOVA LÓGICA: Criar contrato automaticamente se PIX foi aprovado mas não há contrato
      if (!contract && queryResult.payment?.status === 2) {
        console.log('🔧 [PIX-AUTO-CONTRACT] PIX aprovado sem contrato - tentando criar automaticamente', {
          correlationId,
          paymentId,
          pixStatus: queryResult.payment.status
        });
        
        try {
          // Buscar dados de checkout da sessão atual se disponível
          const sessionUserId = req.session.userId || req.session.client?.id;
          if (sessionUserId) {
            // Tentar recuperar dados de checkout baseado na sessão atual
            const clients = await storage.getClientById(sessionUserId);
            
            if (clients) {
              // Criar contrato com dados mínimos necessários
              // Usar plano padrão se não encontrar específico
              const allPlans = await storage.getAllPlans();
              const defaultPlan = allPlans.find(p => p.name.includes('BASIC')) || allPlans[0];
              
              if (defaultPlan) {
                const contractData = {
                  clientId: clients.id,
                  planId: defaultPlan.id,
                  petId: 'pix-auto-pet', // Placeholder - cliente pode corrigir depois
                  contractNumber: `PIX-AUTO-${Date.now()}-${clients.id.substring(0, 4).toUpperCase()}`,
                  status: 'active' as const,
                  startDate: new Date(),
                  monthlyAmount: defaultPlan.basePrice || '0',
                  paymentMethod: 'pix',
                  cieloPaymentId: paymentId,
                  proofOfSale: queryResult.payment.proofOfSale || '',
                  authorizationCode: queryResult.payment.authorizationCode || '',
                  tid: queryResult.payment.tid || '',
                  receivedDate: queryResult.payment.receivedDate ? new Date(queryResult.payment.receivedDate) : new Date(),
                  returnCode: queryResult.payment.returnCode || '0',
                  returnMessage: queryResult.payment.returnMessage || 'PIX Aprovado',
                  pixQrCode: queryResult.payment.qrCodeBase64Image || null,
                  pixCode: queryResult.payment.qrCodeString || null
                };
                
                console.log('🔧 [PIX-AUTO-CONTRACT] Criando contrato automaticamente:', {
                  correlationId,
                  contractNumber: contractData.contractNumber,
                  clientId: contractData.clientId,
                  planId: contractData.planId
                });
                
                contract = await storage.createContract(contractData);
                
                console.log('✅ [PIX-AUTO-CONTRACT] Contrato criado automaticamente:', {
                  correlationId,
                  contractId: contract.id,
                  contractNumber: contract.contractNumber
                });
              }
            }
          }
        } catch (error) {
          console.error('❌ [PIX-AUTO-CONTRACT] Erro ao criar contrato automaticamente:', {
            correlationId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
          // Continuar mesmo se não conseguir criar o contrato
        }
      }
      
      // Calculate payment status using PaymentStatusService if contract exists
      let contractStatus = null;
      if (contract) {
        const paymentStatus = PaymentStatusService.evaluateContractPaymentStatus(contract);
        contractStatus = {
          calculatedStatus: paymentStatus.calculatedStatus,
          isOverdue: paymentStatus.isOverdue,
          daysPastDue: paymentStatus.daysPastDue,
          nextDueDate: paymentStatus.nextDueDate,
          statusReason: paymentStatus.statusReason,
          actionRequired: PaymentStatusService.getActionRequired(paymentStatus)
        };
      }

      res.json({
        success: true,
        data: {
          paymentId,
          merchantOrderId: queryResult.merchantOrderId || '',
          // Cielo payment data
          cieloStatus: (queryResult as any).Payment?.Status || 0, // Status numérico original da Cielo
          mappedStatus: queryResult.payment?.status, // Status já mapeado pelo CieloService ('approved', 'pending', etc)
          amount: queryResult.payment?.amount || 0,
          capturedAmount: queryResult.payment?.capturedAmount || 0,
          tid: queryResult.payment?.tid || '',
          proofOfSale: queryResult.payment?.proofOfSale || '',
          authorizationCode: queryResult.payment?.authorizationCode || '',
          returnCode: queryResult.payment?.returnCode || '',
          returnMessage: queryResult.payment?.returnMessage || '',
          receivedDate: queryResult.payment?.receivedDate || '',
          // PIX specific data
          qrCodeBase64Image: queryResult.payment?.qrCodeBase64Image || '',
          qrCodeString: queryResult.payment?.qrCodeString || '',
          // Local contract information
          contractStatus,
          correlationId
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT-QUERY] Erro ao consultar pagamento', {
        correlationId,
        paymentId: req.params.paymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      const statusCode = error instanceof Error && error.message.includes('404') ? 404 : 500;
      res.status(statusCode).json({
        error: "Erro ao consultar pagamento",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        correlationId
      });
    }
  });

  // Payment Receipts - Official Cielo receipts for customers
  app.get("/api/customer/payment-receipts", requireClient, async (req, res) => {
    try {
      const clientId = req.session.client?.id;
      const clientEmail = req.session.client?.email;

      console.log(`📄 [CUSTOMER-RECEIPTS] Cliente solicitando comprovantes: ${clientEmail}`);

      // Get receipts by client email (primary method) or contract ID
      let receipts = [];
      
      if (clientEmail) {
        receipts = await storage.getPaymentReceiptsByClientEmail(clientEmail);
      }

      // If no receipts found by email, try by contract ID
      if (receipts.length === 0 && clientId) {
        const contracts = await storage.getContractsByClientId(clientId);
        for (const contract of contracts) {
          const contractReceipts = await storage.getPaymentReceiptsByContractId(contract.id);
          receipts.push(...contractReceipts);
        }
      }

      // Format receipt data for frontend
      const formattedReceipts = receipts.map(receipt => ({
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        paymentAmount: parseFloat(receipt.paymentAmount),
        paymentDate: receipt.paymentDate,
        paymentMethod: receipt.paymentMethod,
        status: receipt.status,
        petName: receipt.petName,
        planName: receipt.planName,
        proofOfSale: receipt.proofOfSale,
        authorizationCode: receipt.authorizationCode,
        tid: receipt.tid,
        createdAt: receipt.createdAt
      }));

      console.log(`✅ [CUSTOMER-RECEIPTS] ${receipts.length} comprovantes encontrados para ${clientEmail}`);

      res.json({
        receipts: formattedReceipts,
        total: receipts.length,
        message: "Comprovantes recuperados com sucesso"
      });

    } catch (error) {
      console.error("❌ [CUSTOMER-RECEIPTS] Erro ao buscar comprovantes:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor ao buscar comprovantes",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Download specific payment receipt
  app.get("/api/customer/payment-receipts/:receiptId/download", requireClient, async (req, res) => {
    try {
      const { receiptId } = req.params;
      const clientId = req.session.client?.id;
      const clientEmail = req.session.client?.email;

      console.log(`📥 [RECEIPT-DOWNLOAD] Cliente ${clientEmail} solicitando download do comprovante: ${receiptId}`);

      // Get the receipt
      const receipt = await storage.getPaymentReceiptById(receiptId);

      if (!receipt) {
        console.warn(`⚠️ [RECEIPT-DOWNLOAD] Comprovante não encontrado: ${receiptId}`);
        return res.status(404).json({ error: "Comprovante não encontrado" });
      }

      // Verify if the receipt belongs to the current client
      const hasAccess = receipt.clientEmail === clientEmail || 
                       (clientId && receipt.contractId && 
                        (await storage.getContractsByClientId(clientId)).some(c => c.id === receipt.contractId));

      if (!hasAccess) {
        console.warn(`🚫 [RECEIPT-DOWNLOAD] Acesso negado para comprovante ${receiptId} pelo cliente ${clientEmail}`);
        return res.status(403).json({ error: "Acesso negado ao comprovante" });
      }

      // Update receipt status to 'downloaded'
      await storage.updatePaymentReceiptStatus(receiptId, 'downloaded');

      // ✅ SEGURANÇA: Gerar signed URL temporária para o PDF privado
      if (receipt.pdfObjectKey) {
        console.log(`🔐 [RECEIPT-DOWNLOAD] Gerando signed URL para PDF privado: ${receipt.pdfFileName}`);
        
        // Gerar signed URL temporária (5 minutos)
        const signedUrlResult = await supabaseStorage.generateSignedUrl(receipt.pdfObjectKey, 300);
        
        if (!signedUrlResult.success) {
          console.warn(`⚠️ [RECEIPT-DOWNLOAD] PDF não encontrado no storage, tentando regenerar: ${signedUrlResult.error}`);
          
          // ✅ FALLBACK: Tentar regenerar o PDF se não existir no storage
          try {
            const PaymentReceiptService = (await import('./services/payment-receipt-service.js')).PaymentReceiptService;
            const paymentReceiptService = new PaymentReceiptService();
            
            console.log(`🔄 [RECEIPT-DOWNLOAD] Regenerando PDF para comprovante: ${receiptId}`);
            
            const regenerateResult = await paymentReceiptService.regeneratePDFFromReceipt(receipt);
            
            if (regenerateResult.success && regenerateResult.pdfBuffer) {
              console.log(`✅ [RECEIPT-DOWNLOAD] PDF regenerado com sucesso, enviando diretamente...`);
              
              // Set headers for PDF download
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${receipt.pdfFileName}"`);
              res.setHeader('Content-Length', regenerateResult.pdfBuffer.length.toString());
              
              // Send PDF buffer directly
              return res.end(regenerateResult.pdfBuffer);
            } else {
              console.error(`❌ [RECEIPT-DOWNLOAD] Falha ao regenerar PDF: ${regenerateResult.error}`);
              return res.status(500).json({ error: "PDF não encontrado e não foi possível regenrá-lo. Entre em contato com o suporte." });
            }
            
          } catch (regenerateError) {
            console.error(`❌ [RECEIPT-DOWNLOAD] Erro durante regeneração do PDF:`, regenerateError);
            return res.status(500).json({ error: "Erro ao tentar regenerar PDF. Entre em contato com o suporte." });
          }
        }

        console.log(`✅ [RECEIPT-DOWNLOAD] Signed URL gerada com sucesso (válida por 5 min)`);
        
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${receipt.pdfFileName}"`);
        
        // Redirect to the secure signed URL
        // res.redirect(signedUrlResult.signedUrl!); // CORREÇÃO: Comentado para evitar problemas de CORS
        
        // ✅ CORREÇÃO: Regenerar PDF para download direto e evitar problemas de CORS
        try {
          const PaymentReceiptService = (await import('./services/payment-receipt-service.js')).PaymentReceiptService;
          const paymentReceiptService = new PaymentReceiptService();
          
          console.log(`🔄 [RECEIPT-DOWNLOAD] Regenerando PDF para download direto (evitar CORS): ${receiptId}`);
          
          const regenerateResult = await paymentReceiptService.regeneratePDFFromReceipt(receipt);
          
          if (regenerateResult.success && regenerateResult.pdfBuffer) {
            console.log(`✅ [RECEIPT-DOWNLOAD] PDF regenerado, enviando diretamente...`);
            
            // Update headers for direct PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${receipt.pdfFileName}"`);
            res.setHeader('Content-Length', regenerateResult.pdfBuffer.length.toString());
            
            // Send PDF buffer directly
            return res.end(regenerateResult.pdfBuffer);
          } else {
            console.error(`❌ [RECEIPT-DOWNLOAD] Falha ao regenerar PDF: ${regenerateResult.error}`);
            return res.status(500).json({ error: "Falha ao regenerar PDF para download." });
          }
          
        } catch (regenerateError) {
          console.error(`❌ [RECEIPT-DOWNLOAD] Erro na regeneração:`, regenerateError);
          return res.status(500).json({ error: "Erro ao regenerar PDF. Tente novamente." });
        }
      } else {
        console.error(`❌ [RECEIPT-DOWNLOAD] Object key do PDF não disponível para comprovante: ${receiptId}`);
        // Try to regenerate PDF when object key is not available
        try {
          const PaymentReceiptService = (await import('./services/payment-receipt-service.js')).PaymentReceiptService;
          const paymentReceiptService = new PaymentReceiptService();
          console.log(`🔄 [RECEIPT-DOWNLOAD] Regenerando PDF para comprovante sem object key: ${receiptId}`);
          const regenerateResult = await paymentReceiptService.regeneratePDFFromReceipt(receipt);
          if (regenerateResult.success && regenerateResult.pdfBuffer) {
            console.log(`✅ [RECEIPT-DOWNLOAD] PDF regenerado com sucesso`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${receipt.pdfFileName}"`);
            res.setHeader('Content-Length', regenerateResult.pdfBuffer.length.toString());
            return res.end(regenerateResult.pdfBuffer);
          } else {
            console.error(`❌ [RECEIPT-DOWNLOAD] Falha ao regenerar PDF: ${regenerateResult.error}`);
            return res.status(500).json({ error: "Falha ao regenerar PDF. Entre em contato com o suporte." });
          }
        } catch (regenerateError) {
          console.error(`❌ [RECEIPT-DOWNLOAD] Erro na regeneração:`, regenerateError);
          return res.status(500).json({ error: "Erro ao regenerar PDF" });
        }
      }

    } catch (error) {
      console.error("❌ [RECEIPT-DOWNLOAD] Erro no download do comprovante:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor no download",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // TEST ENDPOINT - Generate payment receipt manually
  app.post("/api/test/generate-receipt", async (req, res) => {
    try {
      const { contractId } = req.body;
      
      if (!contractId) {
        return res.status(400).json({ error: "contractId is required" });
      }
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Get client and pet details
      const client = await storage.getClientById(contract.clientId);
      const pet = contract.petId ? await storage.getPet(contract.petId) : null;
      const plan = await storage.getPlan(contract.planId);
      
      console.log("📄 [TEST-RECEIPT] Starting manual receipt generation", {
        contractId,
        cieloPaymentId: contract.cieloPaymentId,
        clientName: client?.fullName,
        petName: pet?.name
      });
      
      // Import and test PaymentReceiptService
      const { PaymentReceiptService } = await import("./services/payment-receipt-service.js");
      const receiptService = new PaymentReceiptService();
      
      const receiptData = {
        contractId: contract.id,
        cieloPaymentId: contract.cieloPaymentId || "test-payment-id",
        clientName: client?.fullName || "Test Client",
        clientEmail: client?.email || "test@example.com",
        petName: pet?.name || "Test Pet",
        planName: plan?.name || "Test Plan"
      };
      
      const result = await receiptService.generatePaymentReceipt(receiptData, `test_${Date.now()}`);
      
      console.log("📄 [TEST-RECEIPT] Result:", result);
      
      return res.json({
        success: result.success,
        result,
        contractDetails: {
          contractId: contract.id,
          cieloPaymentId: contract.cieloPaymentId,
          status: contract.status
        }
      });
      
    } catch (error: any) {
      console.error("❌ [TEST-RECEIPT] Error:", error);
      return res.status(500).json({ 
        error: "Failed to generate receipt", 
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  });

  // Contract Renewal Payment Endpoint
  app.post("/api/checkout/renewal", requireClient, async (req, res) => {
    try {
      console.log("🔄 [RENEWAL] Iniciando renovação de contrato");
      
      const { contractId, paymentMethod, payment } = req.body;
      const clientId = req.session.client?.id;
      
      // Validate required fields
      if (!contractId || !paymentMethod) {
        return res.status(400).json({ 
          error: "Dados incompletos - contractId e paymentMethod são obrigatórios" 
        });
      }

      // Get and validate contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }
      
      // Verify ownership
      if (contract.clientId !== clientId) {
        return res.status(403).json({ error: "Não autorizado para renovar este contrato" });
      }

      // Get client and plan data
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      const plan = await storage.getPlan(contract.planId);
      if (!plan) {
        return res.status(404).json({ error: "Plano não encontrado" });
      }

      // Calculate amount server-side based on billing period
      let amount: number;
      if (contract.billingPeriod === 'annual') {
        amount = parseFloat(contract.annualAmount || '0') * 100; // Convert to cents
      } else {
        amount = parseFloat(contract.monthlyAmount || '0') * 100; // Convert to cents  
      }
      
      console.log(`💳 [RENEWAL] Processando: Contract ${contractId}, Amount: ${amount}, Method: ${paymentMethod}`);

      let paymentResult;
      let orderId = `RENEWAL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      if (paymentMethod === 'credit_card' && payment) {
        // Process credit card payment
        const cieloService = new CieloService();
        const creditCardRequest = {
          merchantOrderId: orderId,
          customer: {
            name: client.fullName || client.full_name || 'Cliente',
            email: client.email,
            identity: client.cpf,
            identityType: 'CPF' as const,
            address: {
              street: client.address || '',
              number: client.number || 'S/N',
              complement: client.complement || '',
              zipCode: client.cep || client.zipCode || '',
              city: client.city || '',
              state: client.state || '',
              country: 'BRA'
            }
          },
          payment: {
            type: 'CreditCard' as const,
            amount: amount,
            installments: payment.installments || 1,
            creditCard: {
              cardNumber: payment.cardNumber,
              holder: payment.holder,
              expirationDate: payment.expirationDate,
              securityCode: payment.securityCode
            }
          }
        };
        
        paymentResult = await cieloService.createCreditCardPayment(creditCardRequest);
        
        console.log(`💳 [RENEWAL] Resultado do pagamento:`, {
          paymentId: paymentResult.payment?.paymentId,
          status: paymentResult.payment?.status,
          approved: paymentResult.payment?.status === 2
        });
        
        if (paymentResult.payment?.status === 2) {
          // Payment approved - update contract
          await storage.updateContract(contractId, {
            status: 'active',
            receivedDate: new Date(),
            cieloPaymentId: paymentResult.payment.paymentId,
            proofOfSale: paymentResult.payment.proofOfSale,
            authorizationCode: paymentResult.payment.authorizationCode,
            tid: paymentResult.payment.tid,
            returnCode: paymentResult.payment.returnCode,
            returnMessage: paymentResult.payment.returnMessage,
            updatedAt: new Date()
          });

          console.log(`✅ [RENEWAL] Contrato renovado: ${contractId}`);
          
          // Generate payment receipt
          const receiptService = new PaymentReceiptService();
          const receiptResult = await receiptService.generateReceipt({
            contractId: contractId,
            cieloPaymentId: paymentResult.payment.paymentId,
            clientName: client.fullName || client.full_name || 'Cliente',
            clientEmail: client.email,
            clientCPF: client.cpf,
            petName: contract.petName || '',
            planName: contract.planName || plan.name || '',
            paymentMethod: 'credit_card'
          });

          return res.json({
            success: true,
            orderId: orderId,
            paymentId: paymentResult.payment.paymentId,
            message: "Renovação realizada com sucesso"
          });
        } else {
          // Payment declined
          const errorMessage = paymentResult.payment?.returnMessage || 'Pagamento recusado';
          return res.status(400).json({ 
            error: errorMessage,
            code: paymentResult.payment?.returnCode 
          });
        }
        
      } else if (paymentMethod === 'pix') {
        // Generate PIX payment
        const cieloService = new CieloService();
        const pixRequest = {
          merchantOrderId: orderId,
          customer: {
            name: client.fullName || client.full_name || 'Cliente',
            identity: client.cpf || ''
          },
          payment: {
            type: 'Pix' as const,
            amount: amount
          }
        };
        
        paymentResult = await cieloService.createPixPayment(pixRequest);
        
        if (paymentResult.payment?.qrCodeBase64) {
          console.log(`📱 [RENEWAL] PIX QR Code gerado: ${contractId}`);
          
          // Store PIX data for future verification (don't mark as active yet)
          await storage.updateContract(contractId, {
            pixQrCode: paymentResult.payment.qrCodeBase64,
            pixCode: paymentResult.payment.qrCodeString,
            cieloPaymentId: paymentResult.payment.paymentId,
            updatedAt: new Date()
            // Don't update status to active until payment confirmed
          });
          
          return res.json({
            success: true,
            orderId: orderId,
            paymentId: paymentResult.payment.paymentId,
            pixQrCode: paymentResult.payment.qrCodeBase64,
            pixCopyPaste: paymentResult.payment.qrCodeString,
            message: "QR Code PIX gerado com sucesso"
          });
        } else {
          return res.status(500).json({ error: "Erro ao gerar QR Code PIX" });
        }
      } else {
        return res.status(400).json({ error: "Método de pagamento inválido" });
      }
      
    } catch (error) {
      console.error("❌ [RENEWAL] Erro:", error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : "Erro ao processar renovação" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}