import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { eq, like, or, desc, count, sum, sql as sqlTemplate, gte, lt, and, inArray } from "drizzle-orm";
import type {
  User, InsertUser,
  Client, InsertClient,
  Pet, InsertPet,
  Plan, InsertPlan,
  NetworkUnit, InsertNetworkUnit,
  FaqItem, InsertFaqItem,
  ContactSubmission, InsertContactSubmission,
  SiteSettings, InsertSiteSettings,
  ThemeSettings, InsertThemeSettings,
  Guide, InsertGuide
} from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/unipet";
console.log("Database URL configured:", databaseUrl ? "Yes" : "No");

// Enhanced connection configuration with better error handling
const sql = postgres(databaseUrl, { 
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: (notice) => console.log('PostgreSQL notice:', notice),
  onparameter: (key, value) => console.log(`PostgreSQL parameter: ${key} = ${value}`),
  debug: process.env.NODE_ENV === 'development' ? true : false
});
const db = drizzle(sql, { schema });

// Test database connection and create tables if needed
async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("Attempting to connect to:", databaseUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    await sql`SELECT 1`;
    console.log("Database connection successful!");
    
    // Check if site_settings table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `;
    
    console.log("Site settings table exists:", tableExists[0].exists);
    
    if (!tableExists[0].exists) {
      console.log("Creating site_settings table...");
      await sql`
        CREATE TABLE site_settings (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          whatsapp TEXT,
          email TEXT,
          phone TEXT,
          instagram_url TEXT,
          facebook_url TEXT,
          linkedin_url TEXT,
          youtube_url TEXT,
          cnpj TEXT,
          business_hours TEXT,
          our_story TEXT,
          privacy_policy TEXT,
          terms_of_use TEXT,
          address TEXT,
          main_image TEXT,
          network_image TEXT,
          about_image TEXT,
          cores JSONB DEFAULT '{}'::jsonb
        );
      `;
      console.log("Site settings table created successfully!");
    } else {
      // Check all required columns
      const requiredColumns = [
        'whatsapp', 'email', 'phone', 'instagram_url', 'facebook_url', 
        'linkedin_url', 'youtube_url', 'cnpj', 'business_hours', 
        'our_story', 'privacy_policy', 'terms_of_use', 'address', 
        'main_image', 'network_image', 'about_image', 'cores'
      ];
      
      for (const column of requiredColumns) {
        const columnExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'site_settings'
            AND column_name = ${column}
          );
        `;
        
        console.log(`${column} column exists:`, columnExists[0].exists);
        
        if (!columnExists[0].exists) {
          console.log(`Adding ${column} column to site_settings table...`);
          
          if (column === 'cores') {
            await sql`ALTER TABLE site_settings ADD COLUMN cores JSONB DEFAULT '{}'::jsonb;`;
          } else {
            await sql`ALTER TABLE site_settings ADD COLUMN ${sql(column)} TEXT;`;
          }
          
          console.log(`${column} column added successfully!`);
        }
      }
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    console.error("\n=== DATABASE SETUP INSTRUCTIONS ===");
    console.error("To fix this error, you need to set up a PostgreSQL database:");
    console.error("1. Install PostgreSQL: https://www.postgresql.org/download/");
    console.error("2. Create a database named 'unipet'");
    console.error("3. Create a user 'postgres' with password 'password' (or update DATABASE_URL)");
    console.error("4. Start PostgreSQL service");
    console.error("5. Create a .env file with: DATABASE_URL=postgresql://postgres:password@localhost:5432/unipet");
    console.error("\nAlternative: Use a cloud database service like Supabase, Neon, or Railway");
    console.error("=====================================\n");
  }
}

testConnection();

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsers(): Promise<User[]>;

  // Client methods
  getClient(id: string): Promise<Client | undefined>;
  getClientByCpf(cpf: string): Promise<Client | undefined>;
  searchClients(query: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  getClients(startDate?: string, endDate?: string): Promise<Client[]>;

  // Pet methods
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByClient(clientId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, updates: Partial<InsertPet>): Promise<Pet | undefined>;
  deletePet(id: string): Promise<boolean>;
  getPets(): Promise<Pet[]>;

  // Plan methods
  getPlan(id: string): Promise<Plan | undefined>;
  getActivePlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, updates: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;
  getPlans(startDate?: string, endDate?: string): Promise<Plan[]>;

  // Network unit methods
  getNetworkUnit(id: string): Promise<NetworkUnit | undefined>;
  getActiveNetworkUnits(startDate?: string, endDate?: string): Promise<NetworkUnit[]>;
  createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit>;
  updateNetworkUnit(id: string, updates: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined>;
  deleteNetworkUnit(id: string): Promise<boolean>;
  getNetworkUnits(): Promise<NetworkUnit[]>;

  // FAQ methods
  getFaqItem(id: string): Promise<FaqItem | undefined>;
  getActiveFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: string, updates: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<boolean>;
  getFaqItems(): Promise<FaqItem[]>;

  // Contact submission methods
  getContactSubmission(id: string): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(startDate?: string, endDate?: string): Promise<ContactSubmission[]>;
  deleteContactSubmission(id: string): Promise<boolean>;

  // Site settings methods
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;


  // Theme settings methods
  getThemeSettings(): Promise<ThemeSettings | undefined>;
  updateThemeSettings(settings: InsertThemeSettings): Promise<ThemeSettings>;

  // Guide methods
  getGuide(id: string): Promise<Guide | undefined>;
  getGuidesByClient(clientId: string): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined>;
  deleteGuide(id: string): Promise<boolean>;
  getGuides(startDate?: string, endDate?: string): Promise<Guide[]>;
  getRecentGuides(limit?: number): Promise<Guide[]>;

  // Dashboard analytics
  getDashboardStats(startDate?: string, endDate?: string): Promise<{
    activeClients: number;
    registeredPets: number;
    openGuides: number;
    monthlyRevenue: number;
    totalRevenue: number;
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
  }>;

  // Plan revenue analytics
  getPlanRevenue(startDate?: string, endDate?: string): Promise<{
    planId: string;
    planName: string;
    petCount: number;
    monthlyPrice: number;
    totalRevenue: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id)).returning({ id: schema.users.id });
    return result.length > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Client methods
  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(schema.clients).where(eq(schema.clients.id, id));
    return result[0];
  }

  async getClientByCpf(cpf: string): Promise<Client | undefined> {
    const result = await db.select().from(schema.clients).where(eq(schema.clients.cpf, cpf));
    return result[0];
  }

  async searchClients(query: string): Promise<Client[]> {
    return await db.select().from(schema.clients).where(
      or(
        like(schema.clients.fullName, `%${query}%`),
        like(schema.clients.cpf, `%${query}%`),
        like(schema.clients.email, `%${query}%`),
        like(schema.clients.phone, `%${query}%`)
      )
    );
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(schema.clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(schema.clients).set(updates).where(eq(schema.clients.id, id)).returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    // Primeiro, excluir todos os pets associados ao cliente
    await db.delete(schema.pets).where(eq(schema.pets.clientId, id));
    
    // Depois, excluir o cliente
    const result = await db.delete(schema.clients).where(eq(schema.clients.id, id)).returning({ id: schema.clients.id });
    return result.length > 0;
  }

  async getClients(startDate?: string, endDate?: string): Promise<Client[]> {
    let query = db.select().from(schema.clients);
    
    // Build date filter conditions
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(schema.clients.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(schema.clients.createdAt, endDateTime));
    }
    
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    
    return await query.orderBy(desc(schema.clients.createdAt));
  }

  // Pet methods
  async getPet(id: string): Promise<Pet | undefined> {
    const result = await db.select().from(schema.pets).where(eq(schema.pets.id, id));
    return result[0];
  }

  async getPetsByClient(clientId: string): Promise<Pet[]> {
    return await db.select().from(schema.pets).where(eq(schema.pets.clientId, clientId));
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const result = await db.insert(schema.pets).values(pet).returning();
    return result[0];
  }

  async updatePet(id: string, updates: Partial<InsertPet>): Promise<Pet | undefined> {
    const result = await db.update(schema.pets).set(updates).where(eq(schema.pets.id, id)).returning();
    return result[0];
  }

  async deletePet(id: string): Promise<boolean> {
    // Primeiro, excluir todos os guides associados ao pet
    await db.delete(schema.guides).where(eq(schema.guides.petId, id));
    
    // Depois, excluir o pet
    const result = await db.delete(schema.pets).where(eq(schema.pets.id, id)).returning({ id: schema.pets.id });
    return result.length > 0;
  }

  async getPets(): Promise<Pet[]> {
    return await db.select().from(schema.pets).orderBy(desc(schema.pets.createdAt));
  }

  // Plan methods
  async getPlan(id: string): Promise<Plan | undefined> {
    const result = await db.select().from(schema.plans).where(eq(schema.plans.id, id));
    return result[0];
  }

  async getActivePlans(): Promise<Plan[]> {
    return await db.select().from(schema.plans).where(eq(schema.plans.isActive, true));
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const result = await db.insert(schema.plans).values(plan).returning();
    return result[0];
  }

  async updatePlan(id: string, updates: Partial<InsertPlan>): Promise<Plan | undefined> {
    const result = await db.update(schema.plans).set(updates).where(eq(schema.plans.id, id)).returning();
    return result[0];
  }

  async deletePlan(id: string): Promise<boolean> {
    // Primeiro, excluir todos os pets associados ao plano
    await db.delete(schema.pets).where(eq(schema.pets.planId, id));
    
    // Excluir procedures do plano
    await db.delete(schema.planProcedures).where(eq(schema.planProcedures.planId, id));
    
    // Depois, excluir o plano
    const result = await db.delete(schema.plans).where(eq(schema.plans.id, id)).returning({ id: schema.plans.id });
    return result.length > 0;
  }

  async getPlans(startDate?: string, endDate?: string): Promise<Plan[]> {
    try {
      let query = db.select().from(schema.plans);
      
      // Build date filter conditions
      const dateConditions = [];
      if (startDate) {
        dateConditions.push(gte(schema.plans.createdAt, new Date(startDate)));
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        dateConditions.push(lt(schema.plans.createdAt, endDateTime));
      }
      
      if (dateConditions.length > 0) {
        query = query.where(and(...dateConditions));
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getPlans():", error);
      throw error;
    }
  }

  // Plan Procedures methods
  async createPlanProcedure(procedure: any): Promise<any> {
    const result = await db.insert(schema.planProcedures).values(procedure).returning();
    return result[0];
  }

  async getPlanProcedures(planId: string): Promise<any[]> {
    return await db.select().from(schema.planProcedures).where(eq(schema.planProcedures.planId, planId));
  }

  async deletePlanProcedures(planId: string): Promise<boolean> {
    const result = await db.delete(schema.planProcedures).where(eq(schema.planProcedures.planId, planId)).returning({ id: schema.planProcedures.id });
    return result.length > 0;
  }

  // Network unit methods
  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    const result = await db.select().from(schema.networkUnits).where(eq(schema.networkUnits.id, id));
    return result[0];
  }

  async getActiveNetworkUnits(startDate?: string, endDate?: string): Promise<NetworkUnit[]> {
    let query = db.select().from(schema.networkUnits).where(eq(schema.networkUnits.isActive, true));
    
    // Build date filter conditions
    const dateConditions = [eq(schema.networkUnits.isActive, true)];
    if (startDate) {
      dateConditions.push(gte(schema.networkUnits.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(schema.networkUnits.createdAt, endDateTime));
    }
    
    return await db.select().from(schema.networkUnits).where(and(...dateConditions));
  }

  async createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit> {
    const result = await db.insert(schema.networkUnits).values(unit).returning();
    return result[0];
  }

  async updateNetworkUnit(id: string, updates: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    const result = await db.update(schema.networkUnits).set(updates).where(eq(schema.networkUnits.id, id)).returning();
    return result[0];
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const result = await db.delete(schema.networkUnits).where(eq(schema.networkUnits.id, id)).returning({ id: schema.networkUnits.id });
    return result.length > 0;
  }

  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(schema.networkUnits).orderBy(desc(schema.networkUnits.createdAt));
  }

  // FAQ methods
  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    const result = await db.select().from(schema.faqItems).where(eq(schema.faqItems.id, id));
    return result[0];
  }

  async getActiveFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(schema.faqItems).where(eq(schema.faqItems.isActive, true));
  }

  async createFaqItem(item: InsertFaqItem): Promise<FaqItem> {
    const result = await db.insert(schema.faqItems).values(item).returning();
    return result[0];
  }

  async updateFaqItem(id: string, updates: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const result = await db.update(schema.faqItems).set(updates).where(eq(schema.faqItems.id, id)).returning();
    return result[0];
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.faqItems).where(eq(schema.faqItems.id, id)).returning({ id: schema.faqItems.id });
    return result.length > 0;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(schema.faqItems).orderBy(desc(schema.faqItems.createdAt));
  }

  // Contact submission methods
  async getContactSubmission(id: string): Promise<ContactSubmission | undefined> {
    const result = await db.select().from(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, id));
    return result[0];
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const result = await db.insert(schema.contactSubmissions).values(submission).returning();
    return result[0];
  }

  async getContactSubmissions(startDate?: string, endDate?: string): Promise<ContactSubmission[]> {
    let query = db.select().from(schema.contactSubmissions);
    
    // Build date filter conditions
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(schema.contactSubmissions.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(schema.contactSubmissions.createdAt, endDateTime));
    }
    
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    
    return await query.orderBy(desc(schema.contactSubmissions.createdAt));
  }

  async deleteContactSubmission(id: string): Promise<boolean> {
    const result = await db.delete(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, id)).returning({ id: schema.contactSubmissions.id });
    return result.length > 0;
  }

  // Site settings methods
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    try {
      console.log("Fetching site settings from database...");
      const result = await db.select().from(schema.siteSettings).limit(1);
      console.log("Site settings query result:", result);
      
      if (result[0]) {
        console.log("First result keys:", Object.keys(result[0]));
        console.log("First result values:", result[0]);
      }
      
      return result[0];
    } catch (error) {
      console.error("Error in getSiteSettings:", error);
      throw error;
    }
  }

  async updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    try {
      console.log("Updating site settings with data:", settings);
      const existing = await this.getSiteSettings();
      console.log("Existing settings found:", !!existing);
      
      if (existing) {
        console.log("Updating existing settings with ID:", existing.id);
        const result = await db.update(schema.siteSettings).set(settings).where(eq(schema.siteSettings.id, existing.id)).returning();
        console.log("Update result:", result[0]);
        return result[0];
      } else {
        console.log("No existing settings found, creating new record");
        const result = await db.insert(schema.siteSettings).values(settings).returning();
        console.log("Insert result:", result[0]);
        return result[0];
      }
    } catch (error) {
      console.error("Error in updateSiteSettings:", error);
      throw error;
    }
  }


  // Theme settings methods
  async getThemeSettings(): Promise<ThemeSettings | undefined> {
    const result = await db.select().from(schema.themeSettings).limit(1);
    return result[0];
  }

  async updateThemeSettings(settings: InsertThemeSettings): Promise<ThemeSettings> {
    const existing = await this.getThemeSettings();
    if (existing) {
      const result = await db.update(schema.themeSettings).set(settings).where(eq(schema.themeSettings.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(schema.themeSettings).values(settings).returning();
      return result[0];
    }
  }

  // Guide methods
  async getGuide(id: string): Promise<Guide | undefined> {
    const result = await db.select().from(schema.guides).where(eq(schema.guides.id, id));
    return result[0];
  }

  async getGuidesByClient(clientId: string): Promise<Guide[]> {
    return await db.select().from(schema.guides).where(eq(schema.guides.clientId, clientId));
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const result = await db.insert(schema.guides).values(guide).returning();
    return result[0];
  }

  async updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined> {
    const result = await db.update(schema.guides).set(updates).where(eq(schema.guides.id, id)).returning();
    return result[0];
  }

  async deleteGuide(id: string): Promise<boolean> {
    const result = await db.delete(schema.guides).where(eq(schema.guides.id, id)).returning({ id: schema.guides.id });
    return result.length > 0;
  }

  async getGuides(startDate?: string, endDate?: string): Promise<Guide[]> {
    let query = db.select().from(schema.guides);
    
    // Build date filter conditions
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(schema.guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(schema.guides.createdAt, endDateTime));
    }
    
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    
    return await query.orderBy(desc(schema.guides.createdAt));
  }

  async getRecentGuides(limit: number = 10): Promise<Guide[]> {
    return await db.select().from(schema.guides).orderBy(desc(schema.guides.createdAt)).limit(limit);
  }

  // Dashboard analytics
  async getDashboardStats(startDate?: string, endDate?: string): Promise<{
    activeClients: number;
    registeredPets: number;
    openGuides: number;
    monthlyRevenue: number;
    totalRevenue: number;
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
  }> {
    // Build date filter conditions
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(schema.guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(schema.guides.createdAt, endDateTime));
    }

    // Count active clients (clients that have at least one guide in the date range)
    let activeClientsQuery = db
      .selectDistinct({ clientId: schema.guides.clientId })
      .from(schema.guides);
    
    if (dateConditions.length > 0) {
      activeClientsQuery = activeClientsQuery.where(and(...dateConditions));
    }
    
    const activeClientsCount = await activeClientsQuery;
    
    // Count pets (filter by creation date if date range is specified)
    let petsQuery = db.select({ count: count() }).from(schema.pets);
    if (startDate || endDate) {
      const petDateConditions = [];
      if (startDate) {
        petDateConditions.push(gte(schema.pets.createdAt, new Date(startDate)));
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        petDateConditions.push(lt(schema.pets.createdAt, endDateTime));
      }
      if (petDateConditions.length > 0) {
        petsQuery = petsQuery.where(and(...petDateConditions));
      }
    }
    const petsCount = await petsQuery;
    
    // Count open guides (filter by date range if specified)
    let openGuidesQuery = db.select({ count: count() }).from(schema.guides).where(eq(schema.guides.status, 'open'));
    if (dateConditions.length > 0) {
      openGuidesQuery = openGuidesQuery.where(and(eq(schema.guides.status, 'open'), ...dateConditions));
    }
    const openGuidesCount = await openGuidesQuery;
    
    // Calculate revenue from guides in the specified date range
    let revenueQuery = db
      .select({ value: schema.guides.value })
      .from(schema.guides);
    
    if (dateConditions.length > 0) {
      revenueQuery = revenueQuery.where(and(...dateConditions));
    } else {
      // If no date filter, use current month as default
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
      
      revenueQuery = revenueQuery.where(and(
        gte(schema.guides.createdAt, startOfMonth),
        lt(schema.guides.createdAt, endOfMonth)
      ));
    }
    
    const revenueGuides = await revenueQuery;
    
    const monthlyRevenue = revenueGuides.reduce((sum, guide) => {
      const value = parseFloat(guide.value?.toString() || '0') || 0;
      return sum + value;
    }, 0);
    
    // Calculate total revenue from all guides (no date filter)
    const totalRevenueGuides = await db
      .select({ value: schema.guides.value })
      .from(schema.guides);
    
    const totalRevenue = totalRevenueGuides.reduce((sum, guide) => {
      const value = parseFloat(guide.value?.toString() || '0') || 0;
      return sum + value;
    }, 0);
    
    // Count plans
    const totalPlansCount = await db.select({ count: count() }).from(schema.plans);
    const activePlansCount = await db.select({ count: count() }).from(schema.plans).where(eq(schema.plans.isActive, true));
    const inactivePlansCount = await db.select({ count: count() }).from(schema.plans).where(eq(schema.plans.isActive, false));
    
    return {
      activeClients: activeClientsCount.length || 0,
      registeredPets: Number(petsCount[0]?.count) || 0,
      openGuides: Number(openGuidesCount[0]?.count) || 0,
      monthlyRevenue: monthlyRevenue,
      totalRevenue: totalRevenue,
      totalPlans: Number(totalPlansCount[0]?.count) || 0,
      activePlans: Number(activePlansCount[0]?.count) || 0,
      inactivePlans: Number(inactivePlansCount[0]?.count) || 0,
    };
  }

  async getPlanDistribution(startDate?: string, endDate?: string): Promise<{
    planId: string;
    planName: string;
    petCount: number;
    percentage: number;
  }[]> {
    // TODO: Consider adding cache for this query if performance becomes an issue
    // Cache could be invalidated when pets or plans are modified
    // Get all plans (both active and inactive) that exist in the system
    const allPlans = await db.select({ 
      id: schema.plans.id, 
      name: schema.plans.name 
    }).from(schema.plans);
    
    // Build date filter conditions for pets
    const petDateConditions = [
      sqlTemplate`${schema.pets.planId} IS NOT NULL`
    ];
    
    if (startDate) {
      petDateConditions.push(gte(schema.pets.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      petDateConditions.push(lt(schema.pets.createdAt, endDateTime));
    }

    // Get all pets with plans (excluding pets without plans)
    const petsWithPlans = await db
      .select({
        planId: schema.pets.planId
      })
      .from(schema.pets)
      .where(and(...petDateConditions));
    
    // Count total pets with plans (all have plans due to WHERE filter)
    const totalPetsWithPlans = petsWithPlans.length;
    
    // If no pets with plans, return empty distribution for all plans
    if (totalPetsWithPlans === 0) {
      console.log("No pets with plans found for distribution");
      return allPlans.map(plan => ({
        planId: plan.id,
        planName: plan.name,
        petCount: 0,
        percentage: 0
      }));
    }
    
    // Filter plans to only include those that actually have pets
    const plansWithPets = allPlans.filter(plan => 
      petsWithPlans.some(pet => pet.planId === plan.id)
    );
    
    // Calculate distribution with accurate percentages that sum to 100%
    const distribution = plansWithPets.map(plan => {
      const petCount = petsWithPlans.filter(pet => pet.planId === plan.id).length;
      const exactPercentage = totalPetsWithPlans > 0 ? (petCount / totalPetsWithPlans) * 100 : 0;
      
      return {
        planId: plan.id,
        planName: plan.name,
        petCount,
        exactPercentage // Usar porcentagem exata primeiro
      };
    });

    // Arredondar as porcentagens garantindo que a soma seja 100%
    if (totalPetsWithPlans > 0) {
      // Calcular porcentagens arredondadas
      const roundedDistribution = distribution.map(item => ({
        ...item,
        percentage: Math.floor(item.exactPercentage),
        remainder: item.exactPercentage - Math.floor(item.exactPercentage)
      }));

      // Calcular quantos pontos percentuais faltam para 100%
      const totalRounded = roundedDistribution.reduce((sum, item) => sum + item.percentage, 0);
      const remainingPercentage = 100 - totalRounded;

      // Distribuir os pontos percentuais restantes para os itens com maior resto
      if (remainingPercentage > 0) {
        roundedDistribution
          .sort((a, b) => b.remainder - a.remainder)
          .slice(0, remainingPercentage)
          .forEach(item => item.percentage += 1);
      }

      return roundedDistribution.map(item => ({
        planId: item.planId,
        planName: item.planName,
        petCount: item.petCount,
        percentage: item.percentage
      }));
    }

    // Se não há pets, retornar 0% para todos
    return distribution.map(item => ({
      planId: item.planId,
      planName: item.planName,
      petCount: item.petCount,
      percentage: 0
    }));
  }

  async getPlanRevenue(startDate?: string, endDate?: string): Promise<{
    planId: string;
    planName: string;
    petCount: number;
    monthlyPrice: number;
    totalRevenue: number;
  }[]> {
    // Get all plans (both active and inactive) that exist in the system
    const allPlans = await db.select({ 
      id: schema.plans.id, 
      name: schema.plans.name,
      price: schema.plans.price
    }).from(schema.plans);
    
    // Build date filter conditions for pets
    const petDateConditions = [
      sqlTemplate`${schema.pets.planId} IS NOT NULL`
    ];
    
    if (startDate) {
      petDateConditions.push(gte(schema.pets.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Add one day to endDate to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      petDateConditions.push(lt(schema.pets.createdAt, endDateTime));
    }

    // Get pets with plans in the date range
    const petsWithPlans = await db
      .select({
        planId: schema.pets.planId
      })
      .from(schema.pets)
      .where(and(...petDateConditions));
    
    // Filter plans to only include those that actually have pets
    const plansWithPets = allPlans.filter(plan => 
      petsWithPlans.some(pet => pet.planId === plan.id)
    );
    
    // Calculate revenue for each plan that has pets
    const planRevenue = plansWithPets.map(plan => {
      const petCount = petsWithPlans.filter(pet => pet.planId === plan.id).length;
      const monthlyPrice = Number(plan.price) / 100; // Convert from cents to decimal
      const totalRevenue = petCount * monthlyPrice;
      
      return {
        planId: plan.id,
        planName: plan.name,
        petCount,
        monthlyPrice,
        totalRevenue
      };
    });

    // Sort by total revenue descending
    return planRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

export const storage = new DatabaseStorage();
