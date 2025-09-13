import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { eq, like, or, desc, count } from "drizzle-orm";
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

const sql = postgres(databaseUrl, { 
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
const db = drizzle(sql, { schema });

// Test database connection and create tables if needed
async function testConnection() {
  try {
    console.log("Testing database connection...");
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
  getClients(): Promise<Client[]>;

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
  getPlans(): Promise<Plan[]>;

  // Network unit methods
  getNetworkUnit(id: string): Promise<NetworkUnit | undefined>;
  getActiveNetworkUnits(): Promise<NetworkUnit[]>;
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
  getContactSubmissions(): Promise<ContactSubmission[]>;
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
  getGuides(): Promise<Guide[]>;
  getRecentGuides(limit?: number): Promise<Guide[]>;

  // Dashboard analytics
  getDashboardStats(): Promise<{
    activeClients: number;
    registeredPets: number;
    openGuides: number;
    monthlyRevenue: number;
  }>;
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
    const result = await db.delete(schema.clients).where(eq(schema.clients.id, id)).returning({ id: schema.clients.id });
    return result.length > 0;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(schema.clients).orderBy(desc(schema.clients.createdAt));
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
    const result = await db.delete(schema.plans).where(eq(schema.plans.id, id)).returning({ id: schema.plans.id });
    return result.length > 0;
  }

  async getPlans(): Promise<Plan[]> {
    try {
      return await db.select().from(schema.plans);
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

  async getActiveNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(schema.networkUnits).where(eq(schema.networkUnits.isActive, true));
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

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(schema.contactSubmissions).orderBy(desc(schema.contactSubmissions.createdAt));
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

  async getGuides(): Promise<Guide[]> {
    return await db.select().from(schema.guides).orderBy(desc(schema.guides.createdAt));
  }

  async getRecentGuides(limit: number = 10): Promise<Guide[]> {
    return await db.select().from(schema.guides).orderBy(desc(schema.guides.createdAt)).limit(limit);
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    activeClients: number;
    registeredPets: number;
    openGuides: number;
    monthlyRevenue: number;
  }> {
    const clientsCount = await db.select({ count: count() }).from(schema.clients);
    const petsCount = await db.select({ count: count() }).from(schema.pets);
    const openGuidesCount = await db.select({ count: count() }).from(schema.guides).where(eq(schema.guides.status, 'open'));
    
    return {
      activeClients: clientsCount[0]?.count || 0,
      registeredPets: petsCount[0]?.count || 0,
      openGuides: openGuidesCount[0]?.count || 0,
      monthlyRevenue: 0, // TODO: Calculate based on guide values and plan payments
    };
  }
}

export const storage = new DatabaseStorage();
