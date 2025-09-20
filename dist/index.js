var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
import { createServer } from "http";
import path from "path";

// server/storage.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  clients: () => clients,
  contactSubmissions: () => contactSubmissions,
  faqItems: () => faqItems,
  guides: () => guides,
  insertClientSchema: () => insertClientSchema,
  insertContactSubmissionSchema: () => insertContactSubmissionSchema,
  insertFaqItemSchema: () => insertFaqItemSchema,
  insertGuideSchema: () => insertGuideSchema,
  insertNetworkUnitSchema: () => insertNetworkUnitSchema,
  insertPetSchema: () => insertPetSchema,
  insertPlanSchema: () => insertPlanSchema,
  insertProcedurePlanSchema: () => insertProcedurePlanSchema,
  insertProcedureSchema: () => insertProcedureSchema,
  insertRulesSettingsSchema: () => insertRulesSettingsSchema,
  insertSiteSettingsSchema: () => insertSiteSettingsSchema,
  insertThemeSettingsSchema: () => insertThemeSettingsSchema,
  insertUserSchema: () => insertUserSchema,
  networkUnits: () => networkUnits,
  pets: () => pets,
  planTypeEnum: () => planTypeEnum,
  plans: () => plans,
  procedurePlans: () => procedurePlans,
  procedureTypeEnum: () => procedureTypeEnum,
  procedures: () => procedures,
  rulesSettings: () => rulesSettings,
  siteSettings: () => siteSettings,
  themeSettings: () => themeSettings,
  updateNetworkUnitCredentialsSchema: () => updateNetworkUnitCredentialsSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, json, pgEnum, uniqueIndex, index, customType } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var bytea = customType({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return value;
  }
});
var planTypeEnum = pgEnum("plan_type_enum", ["with_waiting_period", "without_waiting_period"]);
var procedureTypeEnum = pgEnum("procedure_type_enum", [
  "consultas",
  "exames_laboratoriais",
  "especialistas",
  "vacinas",
  "cirurgias",
  "exames_de_imagem",
  "exames_laboratoriais_complexos",
  "procedimentos_ambulatoriais",
  "beneficios_especiais"
]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"),
  permissions: json("permissions").$type().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").default(true)
});
var clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  cpf: text("cpf").notNull().unique(),
  cep: text("cep"),
  address: text("address"),
  number: text("number"),
  complement: text("complement"),
  district: text("district"),
  state: text("state"),
  city: text("city"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  birthDate: timestamp("birth_date"),
  age: text("age"),
  sex: text("sex").notNull(),
  castrated: boolean("castrated").default(false),
  color: text("color"),
  weight: decimal("weight"),
  microchip: text("microchip"),
  previousDiseases: text("previous_diseases"),
  surgeries: text("surgeries"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  hereditaryConditions: text("hereditary_conditions"),
  vaccineData: json("vaccine_data").$type().default([]),
  lastCheckup: timestamp("last_checkup"),
  parasite_treatments: text("parasite_treatments"),
  planId: varchar("plan_id").references(() => plans.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  buttonText: text("button_text").notNull().default("Contratar Plano"),
  displayOrder: integer("display_order").notNull().default(0),
  price: integer("price").notNull().default(0),
  planType: planTypeEnum("plan_type").notNull().default("with_waiting_period")
  // coparticipacaoPercentual: integer("coparticipacao_percentual"),
});
var networkUnits = pgTable("network_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  services: text("services").array().default([]),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true),
  whatsapp: text("whatsapp"),
  googleMapsUrl: text("google_maps_url"),
  imageData: text("image_data"),
  urlSlug: text("url_slug").unique(),
  login: text("login").unique(),
  senhaHash: text("senha_hash"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var procedures = pgTable("procedures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  procedureType: procedureTypeEnum("procedure_type").notNull().default("consultas"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => {
  return {
    displayOrderIdx: index("procedures_display_order_idx").on(table.displayOrder),
    isActiveIdx: index("procedures_is_active_idx").on(table.isActive),
    procedureTypeIdx: index("procedures_procedure_type_idx").on(table.procedureType)
  };
});
var procedurePlans = pgTable("plan_procedures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  procedureId: varchar("procedure_id").notNull().references(() => procedures.id, { onDelete: "cascade" }),
  price: integer("price").default(0),
  // preço a receber em centavos
  payValue: integer("pay_value").default(0),
  // valor a pagar em centavos (editável pelo usuário)
  coparticipacao: integer("coparticipacao").default(0),
  // coparticipação em centavos
  carencia: text("carencia"),
  // período de carência (ex: "30 dias")
  limitesAnuais: text("limites_anuais"),
  // limites anuais (ex: "2 vezes no ano" ou "ilimitado")
  isIncluded: boolean("is_included").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => {
  return {
    // Unique constraint to prevent duplicate plan-procedure relationships
    uniquePlanProcedure: uniqueIndex("plan_procedures_unique_plan_procedure").on(table.planId, table.procedureId),
    procedureIdx: index("plan_procedures_procedure_idx").on(table.procedureId),
    planIdx: index("plan_procedures_plan_idx").on(table.planId)
  };
});
var contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  petName: text("pet_name").notNull(),
  animalType: text("animal_type").notNull(),
  petAge: text("pet_age").notNull(),
  planInterest: text("plan_interest").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whatsapp: text("whatsapp"),
  email: text("email"),
  phone: text("phone"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  cnpj: text("cnpj"),
  businessHours: text("business_hours"),
  ourStory: text("our_story"),
  privacyPolicy: text("privacy_policy"),
  termsOfUse: text("terms_of_use"),
  address: text("address"),
  // Converted from text (base64) to bytea (binary) for better performance
  mainImage: bytea("main_image"),
  networkImage: bytea("network_image"),
  aboutImage: bytea("about_image"),
  cores: json("cores").$type().default({}),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var rulesSettings = pgTable("rules_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fixedPercentage: integer("fixed_percentage").default(0),
  // Percentage for automatic calculation (0-100)
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var themeSettings = pgTable("theme_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Foundation
  backgroundColor: text("background_color").default("#faf9f7"),
  textColor: text("text_color").default("#1a1a1a"),
  mutedBackgroundColor: text("muted_background_color").default("#e0e0e0"),
  mutedTextColor: text("muted_text_color").default("#1a1a1a"),
  // Typography
  sansSerifFont: text("sans_serif_font").default("DM Sans"),
  serifFont: text("serif_font").default("DM Sans"),
  monospaceFont: text("monospace_font").default("DM Sans"),
  // Shape & Spacing
  borderRadius: text("border_radius").default("0.5"),
  // Actions
  primaryBackground: text("primary_background").default("#277677"),
  primaryText: text("primary_text").default("#ffffff"),
  secondaryBackground: text("secondary_background").default("#0f1419"),
  secondaryText: text("secondary_text").default("#ffffff"),
  accentBackground: text("accent_background").default("#e3ecf6"),
  accentText: text("accent_text").default("#277677"),
  destructiveBackground: text("destructive_background").default("#277677"),
  destructiveText: text("destructive_text").default("#ffffff"),
  // Forms
  inputBackground: text("input_background").default("#f7f9fa"),
  inputText: text("input_text").default("#1a1a1a"),
  placeholderText: text("placeholder_text").default("#6b7280"),
  inputBorder: text("input_border").default("#e1eaef"),
  focusBorder: text("focus_border").default("#277677"),
  // Containers
  cardBackground: text("card_background").default("#ffffff"),
  cardText: text("card_text").default("#1a1a1a"),
  popoverBackground: text("popover_background").default("#ffffff"),
  popoverText: text("popover_text").default("#1a1a1a"),
  // Charts
  chart1Color: text("chart1_color").default("#277677"),
  chart2Color: text("chart2_color").default("#277677"),
  chart3Color: text("chart3_color").default("#277677"),
  chart4Color: text("chart4_color").default("#277677"),
  chart5Color: text("chart5_color").default("#277677"),
  // Status Colors
  warningColor: text("warning_color").default("#f59e0b")
});
var guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  networkUnitId: varchar("network_unit_id").references(() => networkUnits.id),
  type: text("type").notNull(),
  // 'consulta', 'exames', 'internacao', 'reembolso'
  procedure: text("procedure").notNull(),
  procedureNotes: text("procedure_notes"),
  generalNotes: text("general_notes"),
  value: decimal("value"),
  status: text("status").default("open"),
  // 'open', 'closed', 'cancelled'
  unitStatus: text("unit_status").default("open"),
  // 'open', 'closed', 'cancelled' - status specific for network units
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
var insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
var insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  vaccineData: z.array(z.object({
    vaccine: z.string(),
    date: z.string()
  })).optional()
});
var insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true });
var insertNetworkUnitSchema = createInsertSchema(networkUnits).omit({ id: true, createdAt: true }).extend({
  imageUrl: z.string().min(1, "Imagem da unidade \xE9 obrigat\xF3ria"),
  urlSlug: z.string().optional()
  // URL slug is optional - will be auto-generated if not provided
});
var insertFaqItemSchema = createInsertSchema(faqItems).omit({ id: true, createdAt: true });
var insertProcedureSchema = createInsertSchema(procedures).omit({ id: true, createdAt: true, updatedAt: true });
var insertProcedurePlanSchema = createInsertSchema(procedurePlans).omit({ id: true, createdAt: true, isIncluded: true, displayOrder: true });
var insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });
var insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  // Accept base64 strings from frontend (will be converted to Buffer on server)
  mainImage: z.string().optional().or(z.instanceof(typeof Buffer !== "undefined" ? Buffer : Uint8Array).optional()),
  networkImage: z.string().optional().or(z.instanceof(typeof Buffer !== "undefined" ? Buffer : Uint8Array).optional()),
  aboutImage: z.string().optional().or(z.instanceof(typeof Buffer !== "undefined" ? Buffer : Uint8Array).optional())
});
var insertRulesSettingsSchema = createInsertSchema(rulesSettings).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  fixedPercentage: z.number().min(0, "Porcentagem deve ser pelo menos 0").max(100, "Porcentagem deve ser no m\xE1ximo 100").optional()
});
var insertThemeSettingsSchema = createInsertSchema(themeSettings).omit({ id: true });
var insertGuideSchema = createInsertSchema(guides).omit({ id: true, createdAt: true, updatedAt: true });
var updateNetworkUnitCredentialsSchema = z.object({
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

// server/storage.ts
import { eq, like, ilike, or, desc, count, sum, sql as sqlTemplate, gte, lt, and, lte } from "drizzle-orm";
var databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/unipet";
console.log("Database URL configured:", databaseUrl ? "Yes" : "No");
var sql2 = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: (notice) => console.log("PostgreSQL notice:", notice),
  onparameter: (key, value) => console.log(`PostgreSQL parameter: ${key} = ${value}`),
  debug: process.env.NODE_ENV === "development" ? true : false
});
var db = drizzle(sql2, { schema: schema_exports });
async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("Attempting to connect to:", databaseUrl.replace(/\/\/.*@/, "//***:***@"));
    await sql2`SELECT 1`;
    console.log("Database connection successful!");
    const tableExists = await sql2`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `;
    console.log("Site settings table exists:", tableExists[0].exists);
    if (!tableExists[0].exists) {
      console.log("Creating site_settings table...");
      await sql2`
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
      const requiredColumns = [
        "whatsapp",
        "email",
        "phone",
        "instagram_url",
        "facebook_url",
        "linkedin_url",
        "youtube_url",
        "cnpj",
        "business_hours",
        "our_story",
        "privacy_policy",
        "terms_of_use",
        "address",
        "main_image",
        "network_image",
        "about_image",
        "cores"
      ];
      for (const column of requiredColumns) {
        const columnExists = await sql2`
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
          if (column === "cores") {
            await sql2`ALTER TABLE site_settings ADD COLUMN cores JSONB DEFAULT '{}'::jsonb;`;
          } else {
            await sql2`ALTER TABLE site_settings ADD COLUMN ${sql2(column)} TEXT;`;
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
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async createUser(user) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
  async getUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  // Client methods
  async getClient(id) {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }
  async getClientByCpf(cpf) {
    const result = await db.select().from(clients).where(eq(clients.cpf, cpf));
    return result[0];
  }
  async searchClients(query) {
    return await db.select().from(clients).where(
      or(
        like(clients.fullName, `%${query}%`),
        like(clients.cpf, `%${query}%`),
        like(clients.email, `%${query}%`),
        like(clients.phone, `%${query}%`)
      )
    );
  }
  async createClient(client) {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }
  async updateClient(id, updates) {
    const result = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return result[0];
  }
  async deleteClient(id) {
    await db.delete(pets).where(eq(pets.clientId, id));
    const result = await db.delete(clients).where(eq(clients.id, id)).returning({ id: clients.id });
    return result.length > 0;
  }
  async getClients(startDate, endDate) {
    let query = db.select().from(clients);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(clients.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(clients.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    return await query.orderBy(desc(clients.createdAt));
  }
  // Helper method to get limited clients with total count
  async getLimitedClients(startDate, endDate, limit = 3) {
    let query = db.select().from(clients);
    let countQuery = db.select({ count: count() }).from(clients);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(clients.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(clients.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
      countQuery = countQuery.where(and(...dateConditions));
    }
    const [clients2, totalResult] = await Promise.all([
      query.orderBy(desc(clients.createdAt)).limit(limit),
      countQuery
    ]);
    return {
      clients: clients2,
      total: totalResult[0]?.count || 0
    };
  }
  // Pet methods
  async getPet(id) {
    const result = await db.select().from(pets).where(eq(pets.id, id));
    return result[0];
  }
  async getPetsByClient(clientId) {
    return await db.select().from(pets).where(eq(pets.clientId, clientId));
  }
  async createPet(pet) {
    const result = await db.insert(pets).values(pet).returning();
    return result[0];
  }
  async updatePet(id, updates) {
    const result = await db.update(pets).set(updates).where(eq(pets.id, id)).returning();
    return result[0];
  }
  async deletePet(id) {
    await db.delete(guides).where(eq(guides.petId, id));
    const result = await db.delete(pets).where(eq(pets.id, id)).returning({ id: pets.id });
    return result.length > 0;
  }
  async getPets() {
    return await db.select().from(pets).orderBy(desc(pets.createdAt));
  }
  // Plan methods
  async getPlan(id) {
    const result = await db.select().from(plans).where(eq(plans.id, id));
    return result[0];
  }
  async getActivePlans() {
    return await db.select().from(plans).where(eq(plans.isActive, true));
  }
  async createPlan(plan) {
    const result = await db.insert(plans).values(plan).returning();
    return result[0];
  }
  async updatePlan(id, updates) {
    const result = await db.update(plans).set(updates).where(eq(plans.id, id)).returning();
    return result[0];
  }
  async deletePlan(id) {
    await db.delete(pets).where(eq(pets.planId, id));
    const result = await db.delete(plans).where(eq(plans.id, id)).returning({ id: plans.id });
    return result.length > 0;
  }
  async getPlans(startDate, endDate) {
    try {
      let query = db.select().from(plans);
      const dateConditions = [];
      if (startDate) {
        dateConditions.push(gte(plans.createdAt, new Date(startDate)));
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        dateConditions.push(lt(plans.createdAt, endDateTime));
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
  // Network unit methods
  async getNetworkUnit(id) {
    const result = await db.select().from(networkUnits).where(eq(networkUnits.id, id));
    return result[0];
  }
  async getActiveNetworkUnits(startDate, endDate) {
    let query = db.select().from(networkUnits).where(eq(networkUnits.isActive, true));
    const dateConditions = [eq(networkUnits.isActive, true)];
    if (startDate) {
      dateConditions.push(gte(networkUnits.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(networkUnits.createdAt, endDateTime));
    }
    return await db.select().from(networkUnits).where(and(...dateConditions));
  }
  // Helper method to get limited network units with total count
  async getLimitedNetworkUnits(startDate, endDate, limit) {
    const dateConditions = [eq(networkUnits.isActive, true)];
    if (startDate) {
      dateConditions.push(gte(networkUnits.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(networkUnits.createdAt, endDateTime));
    }
    const query = db.select().from(networkUnits).where(and(...dateConditions));
    const countQuery = db.select({ count: count() }).from(networkUnits).where(and(...dateConditions));
    const unitsPromise = limit ? query.orderBy(desc(networkUnits.createdAt)).limit(limit) : query.orderBy(desc(networkUnits.createdAt));
    const [units, totalResult] = await Promise.all([
      unitsPromise,
      countQuery
    ]);
    return {
      units,
      total: totalResult[0]?.count || 0
    };
  }
  async createNetworkUnit(unit) {
    const result = await db.insert(networkUnits).values(unit).returning();
    return result[0];
  }
  async updateNetworkUnit(id, updates) {
    const result = await db.update(networkUnits).set(updates).where(eq(networkUnits.id, id)).returning();
    return result[0];
  }
  async deleteNetworkUnit(id) {
    const result = await db.delete(networkUnits).where(eq(networkUnits.id, id)).returning({ id: networkUnits.id });
    return result.length > 0;
  }
  async getNetworkUnits() {
    return await db.select().from(networkUnits).orderBy(desc(networkUnits.createdAt));
  }
  async getNetworkUnitsWithCredentials() {
    const units = await db.select().from(networkUnits).orderBy(desc(networkUnits.createdAt));
    return units.map((unit) => {
      const { senhaHash, ...safeUnit } = unit;
      return {
        ...safeUnit,
        hasCredentials: !!(unit.login && unit.senhaHash)
      };
    });
  }
  async updateNetworkUnitCredentials(id, credentials) {
    const result = await db.update(networkUnits).set({
      login: credentials.login,
      senhaHash: credentials.senhaHash
    }).where(eq(networkUnits.id, id)).returning();
    return result.length > 0;
  }
  async getNetworkUnitByLogin(login) {
    const result = await db.select().from(networkUnits).where(eq(networkUnits.login, login));
    return result[0];
  }
  async getNetworkUnitBySlug(slug) {
    const result = await db.select().from(networkUnits).where(eq(networkUnits.urlSlug, slug));
    return result[0];
  }
  // FAQ methods
  async getFaqItem(id) {
    const result = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return result[0];
  }
  async getActiveFaqItems() {
    return await db.select().from(faqItems).where(eq(faqItems.isActive, true));
  }
  async createFaqItem(item) {
    const result = await db.insert(faqItems).values(item).returning();
    return result[0];
  }
  async updateFaqItem(id, updates) {
    const result = await db.update(faqItems).set(updates).where(eq(faqItems.id, id)).returning();
    return result[0];
  }
  async deleteFaqItem(id) {
    const result = await db.delete(faqItems).where(eq(faqItems.id, id)).returning({ id: faqItems.id });
    return result.length > 0;
  }
  async getFaqItems() {
    return await db.select().from(faqItems).orderBy(desc(faqItems.createdAt));
  }
  // Procedure methods
  async getProcedure(id) {
    const result = await db.select().from(procedures).where(eq(procedures.id, id));
    return result[0];
  }
  async getActiveProcedures() {
    return await db.select().from(procedures).where(eq(procedures.isActive, true)).orderBy(procedures.displayOrder);
  }
  async createProcedure(procedure) {
    const result = await db.insert(procedures).values({
      ...procedure,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async updateProcedure(id, updates) {
    const result = await db.update(procedures).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(procedures.id, id)).returning();
    return result[0];
  }
  async deleteProcedure(id) {
    const result = await db.delete(procedures).where(eq(procedures.id, id)).returning({ id: procedures.id });
    return result.length > 0;
  }
  async getProcedures() {
    return await db.select().from(procedures).orderBy(procedures.displayOrder, desc(procedures.createdAt));
  }
  // Plan Procedure methods - relacionamento entre procedimentos e planos
  async getProcedurePlans(procedureId) {
    return await db.select().from(procedurePlans).where(eq(procedurePlans.procedureId, procedureId));
  }
  async getPlanProcedures(planId) {
    return await db.select({
      id: procedurePlans.id,
      procedureId: procedurePlans.procedureId,
      planId: procedurePlans.planId,
      price: procedurePlans.price,
      isIncluded: procedurePlans.isIncluded,
      displayOrder: procedurePlans.displayOrder,
      createdAt: procedurePlans.createdAt,
      procedure: procedures
    }).from(procedurePlans).innerJoin(procedures, eq(procedurePlans.procedureId, procedures.id)).where(eq(procedurePlans.planId, planId)).orderBy(procedurePlans.displayOrder);
  }
  async createProcedurePlan(procedurePlan) {
    const result = await db.insert(procedurePlans).values(procedurePlan).returning();
    return result[0];
  }
  async updateProcedurePlan(id, updates) {
    const result = await db.update(procedurePlans).set(updates).where(eq(procedurePlans.id, id)).returning();
    return result[0];
  }
  async deleteProcedurePlan(id) {
    const result = await db.delete(procedurePlans).where(eq(procedurePlans.id, id)).returning({ id: procedurePlans.id });
    return result.length > 0;
  }
  async deleteProcedurePlansByProcedure(procedureId) {
    const result = await db.delete(procedurePlans).where(eq(procedurePlans.procedureId, procedureId)).returning({ id: procedurePlans.id });
    return result.length > 0;
  }
  async bulkCreateProcedurePlans(procedurePlans2) {
    return await db.transaction(async (tx) => {
      const result = await tx.insert(procedurePlans).values(procedurePlans2).returning();
      return result;
    });
  }
  // Transactional bulk update for procedure plans (delete all existing + create new ones)
  async bulkUpdateProcedurePlansForPlan(planId, procedurePlans2) {
    return await db.transaction(async (tx) => {
      await tx.delete(procedurePlans).where(eq(procedurePlans.planId, planId));
      if (procedurePlans2.length > 0) {
        const result = await tx.insert(procedurePlans).values(procedurePlans2).returning();
        return result;
      }
      return [];
    });
  }
  // Transactional bulk update for procedure plans by procedure (delete all existing + create new ones)
  async bulkUpdateProcedurePlansForProcedure(procedureId, procedurePlans2) {
    return await db.transaction(async (tx) => {
      await tx.delete(procedurePlans).where(eq(procedurePlans.procedureId, procedureId));
      if (procedurePlans2.length > 0) {
        const result = await tx.insert(procedurePlans).values(procedurePlans2).returning();
        return result;
      }
      return [];
    });
  }
  // Contact submission methods
  async getContactSubmission(id) {
    const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return result[0];
  }
  async createContactSubmission(submission) {
    const result = await db.insert(contactSubmissions).values(submission).returning();
    return result[0];
  }
  async getContactSubmissions(startDate, endDate) {
    let query = db.select().from(contactSubmissions);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(contactSubmissions.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(contactSubmissions.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    return await query.orderBy(desc(contactSubmissions.createdAt));
  }
  // Helper method to get limited contact submissions with total count
  async getLimitedContactSubmissions(startDate, endDate, limit = 3) {
    let query = db.select().from(contactSubmissions);
    let countQuery = db.select({ count: count() }).from(contactSubmissions);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(contactSubmissions.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(contactSubmissions.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
      countQuery = countQuery.where(and(...dateConditions));
    }
    const [submissions, totalResult] = await Promise.all([
      query.orderBy(desc(contactSubmissions.createdAt)).limit(limit),
      countQuery
    ]);
    return {
      submissions,
      total: totalResult[0]?.count || 0
    };
  }
  async deleteContactSubmission(id) {
    const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id)).returning({ id: contactSubmissions.id });
    return result.length > 0;
  }
  // Site settings methods
  async getSiteSettings() {
    try {
      console.log("Fetching site settings from database (optimized - no image data)...");
      const result = await db.select({
        id: siteSettings.id,
        whatsapp: siteSettings.whatsapp,
        email: siteSettings.email,
        phone: siteSettings.phone,
        instagramUrl: siteSettings.instagramUrl,
        facebookUrl: siteSettings.facebookUrl,
        linkedinUrl: siteSettings.linkedinUrl,
        youtubeUrl: siteSettings.youtubeUrl,
        cnpj: siteSettings.cnpj,
        businessHours: siteSettings.businessHours,
        ourStory: siteSettings.ourStory,
        privacyPolicy: siteSettings.privacyPolicy,
        termsOfUse: siteSettings.termsOfUse,
        address: siteSettings.address,
        cores: siteSettings.cores,
        createdAt: siteSettings.createdAt,
        updatedAt: siteSettings.updatedAt,
        // Exclude image columns for performance - they are served via /api/images/site/:type
        mainImage: sqlTemplate`NULL`.as("mainImage"),
        networkImage: sqlTemplate`NULL`.as("networkImage"),
        aboutImage: sqlTemplate`NULL`.as("aboutImage")
      }).from(siteSettings).limit(1);
      console.log(`Site settings fetched without large binary images for performance`);
      return result[0];
    } catch (error) {
      console.error("Error in getSiteSettings:", error);
      throw error;
    }
  }
  async getSiteImage(imageType) {
    try {
      console.log(`Fetching ${imageType} image from database...`);
      const columnMap = {
        main: "mainImage",
        network: "networkImage",
        about: "aboutImage"
      };
      const columnName = columnMap[imageType];
      const result = await db.select({
        image: siteSettings[columnName]
      }).from(siteSettings).limit(1);
      if (!result[0] || !result[0].image) {
        console.log(`No ${imageType} image found`);
        return void 0;
      }
      console.log(`${imageType} image found, size: ${result[0].image.length} bytes`);
      return result[0].image;
    } catch (error) {
      console.error(`Error fetching ${imageType} image:`, error);
      throw error;
    }
  }
  async updateSiteSettings(settings) {
    try {
      console.log("Updating site settings with data:", settings);
      const existing = await this.getSiteSettings();
      console.log("Existing settings found:", !!existing);
      if (existing) {
        console.log("Updating existing settings with ID:", existing.id);
        const result = await db.update(siteSettings).set(settings).where(eq(siteSettings.id, existing.id)).returning();
        console.log("Update result:", result[0]);
        return result[0];
      } else {
        console.log("No existing settings found, creating new record");
        const result = await db.insert(siteSettings).values(settings).returning();
        console.log("Insert result:", result[0]);
        return result[0];
      }
    } catch (error) {
      console.error("Error in updateSiteSettings:", error);
      throw error;
    }
  }
  // Rules settings methods
  async getRulesSettings() {
    try {
      console.log("Fetching rules settings from database...");
      const result = await db.select().from(rulesSettings).limit(1);
      console.log("Rules settings query result:", result);
      if (result.length > 0) {
        console.log("First result values:", result[0]);
      }
      return result[0];
    } catch (error) {
      console.error("Error in getRulesSettings:", error);
      throw error;
    }
  }
  async updateRulesSettings(settings) {
    try {
      console.log("Updating rules settings with data:", settings);
      const existing = await this.getRulesSettings();
      console.log("Existing rules settings found:", !!existing);
      if (existing) {
        console.log("Updating existing rules settings with ID:", existing.id);
        const result = await db.update(rulesSettings).set({
          ...settings,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(rulesSettings.id, existing.id)).returning();
        console.log("Update result:", result[0]);
        return result[0];
      } else {
        console.log("No existing rules settings found, creating new record");
        const result = await db.insert(rulesSettings).values({
          ...settings,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        console.log("Insert result:", result[0]);
        return result[0];
      }
    } catch (error) {
      console.error("Error in updateRulesSettings:", error);
      throw error;
    }
  }
  // Theme settings methods
  async getThemeSettings() {
    try {
      const result = await sql2`SELECT * FROM theme_settings ORDER BY id LIMIT 1`;
      if (result.length > 0) {
        const row = result[0];
        return {
          id: row.id,
          backgroundColor: row.background_color,
          textColor: row.text_color,
          mutedBackgroundColor: row.muted_background_color,
          mutedTextColor: row.muted_text_color,
          sansSerifFont: row.sans_serif_font,
          serifFont: row.serif_font,
          monospaceFont: row.monospace_font,
          borderRadius: row.border_radius,
          primaryBackground: row.primary_background,
          primaryText: row.primary_text,
          secondaryBackground: row.secondary_background,
          secondaryText: row.secondary_text,
          accentBackground: row.accent_background,
          accentText: row.accent_text,
          destructiveBackground: row.destructive_background,
          destructiveText: row.destructive_text,
          inputBackground: row.input_background,
          inputBorder: row.input_border,
          focusBorder: row.focus_border,
          cardBackground: row.card_background,
          cardText: row.card_text,
          popoverBackground: row.popover_background,
          popoverText: row.popover_text,
          chart1Color: row.chart1_color,
          chart2Color: row.chart2_color,
          chart3Color: row.chart3_color,
          chart4Color: row.chart4_color,
          chart5Color: row.chart5_color,
          warningColor: row.warning_color || "#f59e0b"
        };
      }
      return void 0;
    } catch (error) {
      console.error("Error in getThemeSettings:", error);
      return void 0;
    }
  }
  async updateThemeSettings(settings) {
    const existing = await this.getThemeSettings();
    if (existing) {
      const result = await db.update(themeSettings).set(settings).where(eq(themeSettings.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(themeSettings).values(settings).returning();
      return result[0];
    }
  }
  // Guide methods
  async getGuide(id) {
    const result = await db.select().from(guides).where(eq(guides.id, id));
    return result[0];
  }
  async getGuidesByClient(clientId) {
    return await db.select().from(guides).where(eq(guides.clientId, clientId));
  }
  async createGuide(guide) {
    const result = await db.insert(guides).values(guide).returning();
    return result[0];
  }
  async updateGuide(id, updates) {
    const result = await db.update(guides).set(updates).where(eq(guides.id, id)).returning();
    return result[0];
  }
  async deleteGuide(id) {
    const result = await db.delete(guides).where(eq(guides.id, id)).returning({ id: guides.id });
    return result.length > 0;
  }
  async getGuides(startDate, endDate) {
    let query = db.select().from(guides);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(guides.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
    }
    return await query.orderBy(desc(guides.createdAt));
  }
  // Helper method to get limited guides with total count
  async getLimitedGuides(startDate, endDate, limit = 20) {
    let query = db.select().from(guides);
    let countQuery = db.select({ count: count() }).from(guides);
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(guides.createdAt, endDateTime));
    }
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions));
      countQuery = countQuery.where(and(...dateConditions));
    }
    const [guides2, totalResult] = await Promise.all([
      query.orderBy(desc(guides.createdAt)).limit(limit),
      countQuery
    ]);
    return {
      guides: guides2,
      total: totalResult[0]?.count || 0
    };
  }
  async getAllGuidesWithNetworkUnits(startDate, endDate, page, limit = 10, search, status, type) {
    const conditions = [];
    if (startDate) {
      conditions.push(gte(guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      conditions.push(lt(guides.createdAt, endDateTime));
    }
    if (search && search.trim()) {
      conditions.push(
        or(
          ilike(guides.procedure, `%${search.trim()}%`),
          ilike(clients.fullName, `%${search.trim()}%`),
          ilike(pets.name, `%${search.trim()}%`)
        )
      );
    }
    if (status && status !== "all") {
      conditions.push(eq(guides.status, status));
    }
    if (type && type !== "all") {
      conditions.push(eq(guides.type, type));
    }
    let baseQuery = db.select({
      id: guides.id,
      clientId: guides.clientId,
      petId: guides.petId,
      networkUnitId: guides.networkUnitId,
      type: guides.type,
      procedure: guides.procedure,
      procedureNotes: guides.procedureNotes,
      generalNotes: guides.generalNotes,
      value: guides.value,
      status: guides.status,
      unitStatus: guides.unitStatus,
      createdAt: guides.createdAt,
      updatedAt: guides.updatedAt,
      networkUnit: {
        id: networkUnits.id,
        name: networkUnits.name,
        address: networkUnits.address,
        phone: networkUnits.phone,
        isActive: networkUnits.isActive
      },
      client: {
        name: clients.fullName,
        email: clients.email,
        phone: clients.phone
      },
      pet: {
        name: pets.name,
        species: pets.species,
        breed: pets.breed
      }
    }).from(guides).leftJoin(networkUnits, eq(guides.networkUnitId, networkUnits.id)).leftJoin(clients, eq(guides.clientId, clients.id)).leftJoin(pets, eq(guides.petId, pets.id));
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    if (page === void 0) {
      return await baseQuery.orderBy(desc(guides.createdAt));
    }
    let countQuery = db.select({ count: count() }).from(guides).leftJoin(networkUnits, eq(guides.networkUnitId, networkUnits.id)).leftJoin(clients, eq(guides.clientId, clients.id)).leftJoin(pets, eq(guides.petId, pets.id));
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = Number(totalResult[0].count) || 0;
    const offset = (page - 1) * limit;
    const data = await baseQuery.orderBy(desc(guides.createdAt)).limit(limit).offset(offset);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }
  async getRecentGuides(limit = 10) {
    return await db.select().from(guides).orderBy(desc(guides.createdAt)).limit(limit);
  }
  async getGuidesByNetworkUnit(networkUnitId) {
    return await db.select({
      id: guides.id,
      clientId: guides.clientId,
      petId: guides.petId,
      networkUnitId: guides.networkUnitId,
      type: guides.type,
      procedure: guides.procedure,
      procedureNotes: guides.procedureNotes,
      generalNotes: guides.generalNotes,
      value: guides.value,
      status: guides.status,
      unitStatus: guides.unitStatus,
      createdAt: guides.createdAt,
      updatedAt: guides.updatedAt,
      client: {
        name: clients.fullName,
        email: clients.email,
        phone: clients.phone
      },
      pet: {
        name: pets.name,
        species: pets.species,
        breed: pets.breed
      }
    }).from(guides).leftJoin(clients, eq(guides.clientId, clients.id)).leftJoin(pets, eq(guides.petId, pets.id)).where(eq(guides.networkUnitId, networkUnitId)).orderBy(desc(guides.createdAt));
  }
  async updateGuideUnitStatus(id, unitStatus) {
    const result = await db.update(guides).set({
      unitStatus,
      updatedAt: sql2`CURRENT_TIMESTAMP`
    }).where(eq(guides.id, id)).returning();
    return result[0];
  }
  // Unit-specific methods
  async getClientsByNetworkUnit(networkUnitId) {
    const clientsWithGuides = await db.selectDistinct({
      id: clients.id,
      fullName: clients.fullName,
      email: clients.email,
      phone: clients.phone,
      cpf: clients.cpf,
      cep: clients.cep,
      address: clients.address,
      number: clients.number,
      complement: clients.complement,
      district: clients.district,
      state: clients.state,
      city: clients.city,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt
    }).from(clients).innerJoin(guides, eq(clients.id, guides.clientId)).where(eq(guides.networkUnitId, networkUnitId)).orderBy(clients.fullName);
    return clientsWithGuides;
  }
  async getCoverageByNetworkUnit(networkUnitId) {
    const procedures2 = await db.select().from(procedures).where(eq(procedures.isActive, true)).orderBy(procedures.displayOrder, procedures.name);
    const plans2 = await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.displayOrder, plans.name);
    const procedurePlans2 = await db.select({
      procedureId: procedurePlans.procedureId,
      planId: procedurePlans.planId,
      price: procedurePlans.price,
      payValue: procedurePlans.payValue,
      coparticipacao: procedurePlans.coparticipacao,
      isIncluded: procedurePlans.isIncluded,
      planName: plans.name
    }).from(procedurePlans).innerJoin(plans, eq(procedurePlans.planId, plans.id)).where(eq(plans.isActive, true));
    const coverage = procedures2.map((procedure) => {
      const planCoverage = plans2.map((plan) => {
        const planProcedure = procedurePlans2.find(
          (pp) => pp.procedureId === procedure.id && pp.planId === plan.id
        );
        return {
          planId: plan.id,
          planName: plan.name,
          isIncluded: planProcedure?.isIncluded ?? false,
          price: planProcedure?.price ?? 0,
          payValue: planProcedure?.payValue ?? 0,
          coparticipacao: planProcedure?.coparticipacao ?? 0
        };
      });
      return {
        procedure,
        planCoverage
      };
    });
    return coverage;
  }
  // Dashboard analytics
  async getDashboardStats(startDate, endDate) {
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(guides.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      dateConditions.push(lt(guides.createdAt, endDateTime));
    }
    let activeClientsQuery = db.selectDistinct({ clientId: guides.clientId }).from(guides);
    if (dateConditions.length > 0) {
      activeClientsQuery = activeClientsQuery.where(and(...dateConditions));
    }
    const activeClientsCount = await activeClientsQuery;
    let petsQuery = db.select({ count: count() }).from(pets);
    if (startDate || endDate) {
      const petDateConditions = [];
      if (startDate) {
        petDateConditions.push(gte(pets.createdAt, new Date(startDate)));
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        petDateConditions.push(lt(pets.createdAt, endDateTime));
      }
      if (petDateConditions.length > 0) {
        petsQuery = petsQuery.where(and(...petDateConditions));
      }
    }
    const petsCount = await petsQuery;
    let openGuidesQuery = db.select({ count: count() }).from(guides).where(eq(guides.status, "open"));
    if (dateConditions.length > 0) {
      openGuidesQuery = openGuidesQuery.where(and(eq(guides.status, "open"), ...dateConditions));
    }
    const openGuidesCount = await openGuidesQuery;
    let revenueQuery = db.select({ value: guides.value }).from(guides);
    if (dateConditions.length > 0) {
      revenueQuery = revenueQuery.where(and(...dateConditions));
    } else {
      const currentDate = /* @__PURE__ */ new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
      revenueQuery = revenueQuery.where(and(
        gte(guides.createdAt, startOfMonth),
        lt(guides.createdAt, endOfMonth)
      ));
    }
    const revenueGuides = await revenueQuery;
    const monthlyRevenue = revenueGuides.reduce((sum2, guide) => {
      const value = parseFloat(guide.value?.toString() || "0") || 0;
      return sum2 + value;
    }, 0);
    const totalRevenueGuides = await db.select({ value: guides.value }).from(guides);
    const totalRevenue = totalRevenueGuides.reduce((sum2, guide) => {
      const value = parseFloat(guide.value?.toString() || "0") || 0;
      return sum2 + value;
    }, 0);
    const totalPlansCount = await db.select({ count: count() }).from(plans);
    const activePlansCount = await db.select({ count: count() }).from(plans).where(eq(plans.isActive, true));
    const inactivePlansCount = await db.select({ count: count() }).from(plans).where(eq(plans.isActive, false));
    return {
      activeClients: activeClientsCount.length || 0,
      registeredPets: Number(petsCount[0]?.count) || 0,
      openGuides: Number(openGuidesCount[0]?.count) || 0,
      monthlyRevenue,
      totalRevenue,
      totalPlans: Number(totalPlansCount[0]?.count) || 0,
      activePlans: Number(activePlansCount[0]?.count) || 0,
      inactivePlans: Number(inactivePlansCount[0]?.count) || 0
    };
  }
  async getPlanDistribution(startDate, endDate) {
    const allPlans = await db.select({
      id: plans.id,
      name: plans.name
    }).from(plans);
    const petDateConditions = [
      sqlTemplate`${pets.planId} IS NOT NULL`
    ];
    if (startDate) {
      petDateConditions.push(gte(pets.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      petDateConditions.push(lt(pets.createdAt, endDateTime));
    }
    const petsWithPlans = await db.select({
      planId: pets.planId
    }).from(pets).where(and(...petDateConditions));
    const totalPetsWithPlans = petsWithPlans.length;
    if (totalPetsWithPlans === 0) {
      console.log("No pets with plans found for distribution");
      return allPlans.map((plan) => ({
        planId: plan.id,
        planName: plan.name,
        petCount: 0,
        percentage: 0
      }));
    }
    const plansWithPets = allPlans.filter(
      (plan) => petsWithPlans.some((pet) => pet.planId === plan.id)
    );
    const distribution = plansWithPets.map((plan) => {
      const petCount = petsWithPlans.filter((pet) => pet.planId === plan.id).length;
      const exactPercentage = totalPetsWithPlans > 0 ? petCount / totalPetsWithPlans * 100 : 0;
      return {
        planId: plan.id,
        planName: plan.name,
        petCount,
        exactPercentage
        // Usar porcentagem exata primeiro
      };
    });
    if (totalPetsWithPlans > 0) {
      const roundedDistribution = distribution.map((item) => ({
        ...item,
        percentage: Math.floor(item.exactPercentage),
        remainder: item.exactPercentage - Math.floor(item.exactPercentage)
      }));
      const totalRounded = roundedDistribution.reduce((sum2, item) => sum2 + item.percentage, 0);
      const remainingPercentage = 100 - totalRounded;
      if (remainingPercentage > 0) {
        roundedDistribution.sort((a, b) => b.remainder - a.remainder).slice(0, remainingPercentage).forEach((item) => item.percentage += 1);
      }
      return roundedDistribution.map((item) => ({
        planId: item.planId,
        planName: item.planName,
        petCount: item.petCount,
        percentage: item.percentage
      }));
    }
    return distribution.map((item) => ({
      planId: item.planId,
      planName: item.planName,
      petCount: item.petCount,
      percentage: 0
    }));
  }
  async getPlanRevenue(startDate, endDate) {
    const allPlans = await db.select({
      id: plans.id,
      name: plans.name,
      price: plans.price
    }).from(plans);
    const petDateConditions = [
      sqlTemplate`${pets.planId} IS NOT NULL`
    ];
    if (startDate) {
      petDateConditions.push(gte(pets.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      petDateConditions.push(lt(pets.createdAt, endDateTime));
    }
    const petsWithPlans = await db.select({
      planId: pets.planId
    }).from(pets).where(and(...petDateConditions));
    const plansWithPets = allPlans.filter(
      (plan) => petsWithPlans.some((pet) => pet.planId === plan.id)
    );
    const planRevenue = plansWithPets.map((plan) => {
      const petCount = petsWithPlans.filter((pet) => pet.planId === plan.id).length;
      const monthlyPrice = Number(plan.price) / 100;
      const totalRevenue = petCount * monthlyPrice;
      return {
        planId: plan.id,
        planName: plan.name,
        petCount,
        monthlyPrice,
        totalRevenue
      };
    });
    return planRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
  // Aggregated dashboard data - optimized to reduce parallel query load
  async getDashboardData(startDate, endDate) {
    const dbStartTime = Date.now();
    try {
      const [
        guides2,
        networkUnits2,
        clients2,
        contactSubmissions2,
        plans2
      ] = await Promise.all([
        // Optimized individual queries with date filtering
        startDate || endDate ? db.select().from(guides).where(
          startDate && endDate ? and(
            gte(guides.createdAt, new Date(startDate)),
            lte(guides.createdAt, new Date(endDate))
          ) : startDate ? gte(guides.createdAt, new Date(startDate)) : lte(guides.createdAt, new Date(endDate))
        ) : db.select().from(guides).limit(100),
        // Limit for performance
        // Active network units
        startDate || endDate ? db.select().from(networkUnits).where(
          startDate && endDate ? and(
            gte(networkUnits.createdAt, new Date(startDate)),
            lte(networkUnits.createdAt, new Date(endDate))
          ) : startDate ? gte(networkUnits.createdAt, new Date(startDate)) : lte(networkUnits.createdAt, new Date(endDate))
        ) : db.select().from(networkUnits).limit(50),
        // Clients with date filtering
        startDate || endDate ? db.select().from(clients).where(
          startDate && endDate ? and(
            gte(clients.createdAt, new Date(startDate)),
            lte(clients.createdAt, new Date(endDate))
          ) : startDate ? gte(clients.createdAt, new Date(startDate)) : lte(clients.createdAt, new Date(endDate))
        ) : db.select().from(clients).limit(100),
        // Contact submissions
        startDate || endDate ? db.select().from(contactSubmissions).where(
          startDate && endDate ? and(
            gte(contactSubmissions.createdAt, new Date(startDate)),
            lte(contactSubmissions.createdAt, new Date(endDate))
          ) : startDate ? gte(contactSubmissions.createdAt, new Date(startDate)) : lte(contactSubmissions.createdAt, new Date(endDate))
        ) : db.select().from(contactSubmissions).limit(50),
        // Plans
        db.select().from(plans)
      ]);
      const [clientCountResult, petCountResult, procedureCountResult, planCountResult] = await Promise.all([
        db.select({ count: count() }).from(clients),
        db.select({ count: count() }).from(pets),
        db.select({ count: count() }).from(procedures),
        db.select({ count: count() }).from(plans)
      ]);
      const statsAndCounts = {
        clientCount: clientCountResult[0]?.count || 0,
        petCount: petCountResult[0]?.count || 0,
        procedureCount: procedureCountResult[0]?.count || 0,
        planCount: planCountResult[0]?.count || 0
      };
      const dbQueryTime = Date.now() - dbStartTime;
      console.log(`[PERFORMANCE] Dashboard consolidated queries completed in ${dbQueryTime}ms`);
      const distributionStart = Date.now();
      const [planDistribution, planRevenue] = await Promise.all([
        this.getPlanDistribution(startDate, endDate),
        this.getPlanRevenue(startDate, endDate)
      ]);
      const distributionTime = Date.now() - distributionStart;
      console.log(`[PERFORMANCE] Dashboard distributions calculated in ${distributionTime}ms`);
      const statsData = statsAndCounts || { clientCount: 0, petCount: 0, procedureCount: 0, planCount: 0 };
      let monthlyRevenue = 0;
      let totalRevenue = 0;
      if (startDate || endDate) {
        const monthlyDateConditions = [];
        if (startDate) {
          monthlyDateConditions.push(gte(guides.createdAt, new Date(startDate)));
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setDate(endDateTime.getDate() + 1);
          monthlyDateConditions.push(lt(guides.createdAt, endDateTime));
        }
        if (monthlyDateConditions.length > 0) {
          const monthlyRevenueResult = await db.select({ total: sum(guides.value) }).from(guides).where(and(...monthlyDateConditions));
          monthlyRevenue = Number(monthlyRevenueResult[0]?.total) || 0;
        }
      } else {
        const currentDate = /* @__PURE__ */ new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
        const monthlyRevenueResult = await db.select({ total: sum(guides.value) }).from(guides).where(and(
          gte(guides.createdAt, startOfMonth),
          lt(guides.createdAt, endOfMonth)
        ));
        monthlyRevenue = Number(monthlyRevenueResult[0]?.total) || 0;
      }
      const totalRevenueResult = await db.select({ total: sum(guides.value) }).from(guides);
      totalRevenue = Number(totalRevenueResult[0]?.total) || 0;
      const enrichedStats = {
        activeClients: statsData.clientCount || clients2.length,
        registeredPets: statsData.petCount || 0,
        totalGuides: guides2.length,
        petsWithPlan: statsData.petCount || 0,
        activeNetwork: networkUnits2.length,
        totalProcedures: statsData.procedureCount || 0,
        monthlyRevenue,
        totalRevenue
      };
      const totalTime = Date.now() - dbStartTime;
      console.log(`[PERFORMANCE] Dashboard data consolidated in ${totalTime}ms total (queries: ${dbQueryTime}ms, distributions: ${distributionTime}ms)`);
      return {
        stats: enrichedStats,
        guides: guides2,
        networkUnits: networkUnits2,
        clients: clients2,
        contactSubmissions: contactSubmissions2,
        plans: plans2,
        planDistribution,
        planRevenue
      };
    } catch (error) {
      const errorTime = Date.now() - dbStartTime;
      console.error(`[PERFORMANCE] Dashboard data ERROR after ${errorTime}ms:`, error);
      return this.getDashboardDataFallback(startDate, endDate);
    }
  }
  // Fallback method (original implementation)
  async getDashboardDataFallback(startDate, endDate) {
    console.log("[PERFORMANCE] Using fallback dashboard method");
    const [stats, guides2, networkUnits2] = await Promise.all([
      this.getDashboardStats(startDate, endDate),
      this.getGuides(startDate, endDate),
      this.getActiveNetworkUnits(startDate, endDate)
    ]);
    const [clients2, contactSubmissions2, plans2] = await Promise.all([
      this.getClients(startDate, endDate),
      this.getContactSubmissions(startDate, endDate),
      this.getPlans(startDate, endDate)
    ]);
    const [planDistribution, planRevenue] = await Promise.all([
      this.getPlanDistribution(startDate, endDate),
      this.getPlanRevenue(startDate, endDate)
    ]);
    const enrichedStats = {
      activeClients: stats.activeClients,
      registeredPets: stats.registeredPets,
      totalGuides: guides2.length,
      petsWithPlan: stats.registeredPets,
      activeNetwork: networkUnits2.length,
      totalProcedures: 0,
      monthlyRevenue: stats.monthlyRevenue,
      totalRevenue: stats.totalRevenue
    };
    try {
      const proceduresResult = await db.select({
        count: count()
      }).from(procedures);
      enrichedStats.totalProcedures = proceduresResult[0]?.count || 0;
    } catch (error) {
      console.error("Error fetching procedures count:", error);
      enrichedStats.totalProcedures = 0;
    }
    return {
      stats: enrichedStats,
      guides: guides2,
      networkUnits: networkUnits2,
      clients: clients2,
      contactSubmissions: contactSubmissions2,
      plans: plans2,
      planDistribution,
      planRevenue
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// server/utils.ts
import { drizzle as drizzle2 } from "drizzle-orm/postgres-js";
import postgres2 from "postgres";
import { eq as eq2 } from "drizzle-orm";
var databaseUrl2 = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/unipet";
var sql3 = postgres2(databaseUrl2, {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
var db2 = drizzle2(sql3, { schema: schema_exports });
function generateSlug(text2) {
  return text2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^(\w+)['']s\s+(\w+)$/g, "$1s$2").replace(/[''`]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function isValidSlug(slug) {
  if (!slug || slug.length === 0) return false;
  const validPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return validPattern.test(slug);
}
async function generateUniqueSlug(text2, excludeId) {
  const baseSlug = generateSlug(text2);
  if (!isValidSlug(baseSlug)) {
    throw new Error(`Invalid slug generated from text: "${text2}"`);
  }
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (true) {
    let query = db2.select({ id: networkUnits.id }).from(networkUnits).where(eq2(networkUnits.urlSlug, uniqueSlug));
    const existingUnits = await query;
    if (existingUnits.length === 0 || existingUnits.length === 1 && excludeId && existingUnits[0].id === excludeId) {
      return uniqueSlug;
    }
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/clients", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const clients2 = await storage.getClients(
        startDate,
        endDate
      );
      res.json(clients2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/:id", async (req, res) => {
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
  app2.get("/api/clients/search/:query", async (req, res) => {
    try {
      const clients2 = await storage.searchClients(req.params.query);
      res.json(clients2);
    } catch (error) {
      res.status(500).json({ message: "Failed to search clients" });
    }
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });
  app2.put("/api/clients/:id", async (req, res) => {
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
  app2.delete("/api/clients/:id", async (req, res) => {
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
  app2.get("/api/pets", async (req, res) => {
    try {
      const pets2 = await storage.getPets();
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });
  app2.get("/api/pets/:id", async (req, res) => {
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
  app2.get("/api/clients/:clientId/pets", async (req, res) => {
    try {
      const pets2 = await storage.getPetsByClient(req.params.clientId);
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });
  app2.post("/api/pets", async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.planId === "" || requestData.planId === void 0) {
        delete requestData.planId;
      }
      const petData = insertPetSchema.parse(requestData);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });
  app2.put("/api/pets/:id", async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.planId === "" || requestData.planId === void 0) {
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
  app2.delete("/api/pets/:id", async (req, res) => {
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
  app2.get("/api/plans", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const plans2 = await storage.getPlans(
        startDate,
        endDate
      );
      res.json(plans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  app2.get("/api/plans/active", async (req, res) => {
    try {
      const plans2 = await storage.getActivePlans();
      res.json(plans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active plans" });
    }
  });
  app2.get("/api/plans/:id", async (req, res) => {
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
  app2.post("/api/plans", async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });
  app2.put("/api/plans/:id", async (req, res) => {
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
  app2.delete("/api/plans/:id", async (req, res) => {
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
  app2.get("/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network units" });
    }
  });
  app2.get("/api/network-units/active", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const units = await storage.getActiveNetworkUnits(
        startDate,
        endDate
      );
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active network units" });
    }
  });
  app2.get("/api/network-units/credentials", async (req, res) => {
    try {
      const units = await storage.getNetworkUnitsWithCredentials();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network units with credentials" });
    }
  });
  app2.put("/api/network-units/:id/credentials", async (req, res) => {
    try {
      const credentialData = updateNetworkUnitCredentialsSchema.parse(req.body);
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(credentialData.password, saltRounds);
      const updated = await storage.updateNetworkUnitCredentials(req.params.id, {
        login: credentialData.login,
        senhaHash
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
  app2.put("/api/network-units/:id/regenerate-slug", async (req, res) => {
    try {
      const unit = await storage.getNetworkUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Network unit not found" });
      }
      const newSlug = await generateUniqueSlug(unit.name, req.params.id);
      const updatedUnit = await storage.updateNetworkUnit(req.params.id, {
        urlSlug: newSlug
      });
      if (!updatedUnit) {
        return res.status(500).json({ message: "Failed to update network unit slug" });
      }
      res.json({
        message: "URL slug regenerated successfully",
        newSlug,
        fullUrl: `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}/${newSlug}`
      });
    } catch (error) {
      console.error("Error regenerating slug:", error);
      res.status(500).json({ message: "Failed to regenerate URL slug" });
    }
  });
  app2.get("/api/network-units/:id", async (req, res) => {
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
  app2.post("/api/network-units", async (req, res) => {
    try {
      const unitData = insertNetworkUnitSchema.parse(req.body);
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
  app2.put("/api/network-units/:id", async (req, res) => {
    try {
      const unitData = insertNetworkUnitSchema.partial().parse(req.body);
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
  app2.delete("/api/network-units/:id", async (req, res) => {
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
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
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
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword,
        permissions: Array.isArray(userData.permissions) ? userData.permissions : []
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
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }
      if (userData.permissions && !Array.isArray(userData.permissions)) {
        userData.permissions = [];
      }
      const updateData = {
        ...userData,
        permissions: userData.permissions ? userData.permissions : void 0
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
  app2.delete("/api/users/:id", async (req, res) => {
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
  app2.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });
  app2.get("/api/faq/active", async (req, res) => {
    try {
      const items = await storage.getActiveFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active FAQ items" });
    }
  });
  app2.post("/api/faq", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const item = await storage.createFaqItem(faqData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid FAQ data" });
    }
  });
  app2.put("/api/faq/:id", async (req, res) => {
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
  app2.delete("/api/faq/:id", async (req, res) => {
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
  app2.get("/api/procedures", async (req, res) => {
    try {
      const procedures2 = await storage.getProcedures();
      res.json(procedures2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedures" });
    }
  });
  app2.get("/api/procedures/active", async (req, res) => {
    try {
      const procedures2 = await storage.getActiveProcedures();
      res.json(procedures2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active procedures" });
    }
  });
  app2.get("/api/procedures/:id", async (req, res) => {
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
  app2.post("/api/procedures", async (req, res) => {
    try {
      const procedureData = insertProcedureSchema.parse(req.body);
      const procedure = await storage.createProcedure(procedureData);
      res.status(201).json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });
  app2.put("/api/procedures/:id", async (req, res) => {
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
  app2.delete("/api/procedures/:id", async (req, res) => {
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
  app2.get("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const procedurePlans2 = await storage.getProcedurePlans(req.params.procedureId);
      res.json(procedurePlans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedure plans" });
    }
  });
  app2.get("/api/plans/:planId/procedures", async (req, res) => {
    try {
      const planProcedures = await storage.getPlanProcedures(req.params.planId);
      res.json(planProcedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan procedures" });
    }
  });
  app2.post("/api/procedure-plans", async (req, res) => {
    try {
      const procedurePlanData = insertProcedurePlanSchema.parse(req.body);
      const procedurePlan = await storage.createProcedurePlan(procedurePlanData);
      res.status(201).json(procedurePlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure plan data" });
    }
  });
  app2.post("/api/procedure-plans/bulk", async (req, res) => {
    try {
      const { procedurePlans: procedurePlans2 } = req.body;
      if (!Array.isArray(procedurePlans2)) {
        return res.status(400).json({ message: "procedurePlans must be an array" });
      }
      const validatedPlans = procedurePlans2.map((plan) => insertProcedurePlanSchema.parse(plan));
      const result = await storage.bulkCreateProcedurePlans(validatedPlans);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure plans data" });
    }
  });
  app2.put("/api/procedure-plans/:id", async (req, res) => {
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
  app2.delete("/api/procedure-plans/:id", async (req, res) => {
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
  app2.delete("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const deleted = await storage.deleteProcedurePlansByProcedure(req.params.procedureId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete procedure plans" });
    }
  });
  app2.put("/api/procedures/:procedureId/plans", async (req, res) => {
    try {
      const { procedurePlans: procedurePlans2 } = req.body;
      if (!Array.isArray(procedurePlans2)) {
        return res.status(400).json({ message: "procedurePlans must be an array" });
      }
      const validatedPlans = procedurePlans2.map(
        (plan) => insertProcedurePlanSchema.parse({
          ...plan,
          procedureId: req.params.procedureId
        })
      );
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
  app2.get("/api/contact-submissions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const submissions = await storage.getContactSubmissions(
        startDate,
        endDate
      );
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });
  app2.post("/api/contact-submissions", async (req, res) => {
    try {
      const submissionData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact submission data" });
    }
  });
  app2.delete("/api/contact-submissions/:id", async (req, res) => {
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
  app2.get("/api/guides", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const guides2 = await storage.getGuides(
        startDate,
        endDate
      );
      res.json(guides2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });
  app2.get("/api/guides/with-network-units", async (req, res) => {
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
      const page = pageParam ? parseInt(pageParam) : 1;
      const limit = limitParam ? parseInt(limitParam) : 10;
      if (page < 1) {
        return res.status(400).json({ message: "Page must be >= 1" });
      }
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Limit must be between 1 and 100" });
      }
      const guides2 = await storage.getAllGuidesWithNetworkUnits(
        startDate,
        endDate,
        page,
        limit,
        search,
        status,
        type
      );
      res.json(guides2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides with network units" });
    }
  });
  app2.get("/api/guides/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const guides2 = await storage.getRecentGuides(limit);
      res.json(guides2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent guides" });
    }
  });
  app2.get("/api/guides/:id", async (req, res) => {
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
  app2.get("/api/clients/:clientId/guides", async (req, res) => {
    try {
      const guides2 = await storage.getGuidesByClient(req.params.clientId);
      res.json(guides2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });
  app2.post("/api/guides", async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      res.status(400).json({ message: "Invalid guide data" });
    }
  });
  app2.put("/api/guides/:id", async (req, res) => {
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
  app2.delete("/api/guides/:id", async (req, res) => {
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
  app2.get("/api/images/site/:imageType", async (req, res) => {
    const startTime = Date.now();
    try {
      const { imageType } = req.params;
      console.log(`=== API /api/images/site/${imageType} called ===`);
      if (!["main", "network", "about"].includes(imageType)) {
        return res.status(400).json({ message: "Invalid image type" });
      }
      const imageData = await storage.getSiteImage(imageType);
      if (!imageData) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.set({
        "Content-Type": "image/jpeg",
        // Assuming JPEG for now, could be dynamic
        "Content-Length": imageData.length.toString(),
        "Cache-Control": "public, max-age=3600",
        // Cache for 1 hour
        "ETag": `"site-${imageType}-${imageData.length}"`
        // Simple ETag based on size
      });
      console.log(`=== Image served in ${Date.now() - startTime}ms ===`);
      res.send(imageData);
    } catch (error) {
      console.error(`Error serving image ${req.params.imageType}:`, error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });
  app2.get("/api/settings/site", async (req, res) => {
    try {
      console.log("=== API /api/settings/site called ===");
      console.log("Storage object:", storage);
      console.log("getSiteSettings method:", typeof storage.getSiteSettings);
      const settings = await storage.getSiteSettings();
      console.log("Site settings from DB:", settings);
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
      const optimizedSettings = {
        ...settings,
        // Keep legacy fields as null for compatibility while frontend migrates
        mainImage: null,
        networkImage: null,
        aboutImage: null,
        // Add new URL fields for optimized image serving
        mainImageUrl: "/api/images/site/main",
        networkImageUrl: "/api/images/site/network",
        aboutImageUrl: "/api/images/site/about"
      };
      console.log(`=== Site settings optimized - images served separately ===`);
      res.json(optimizedSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
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
        mainImageUrl: "",
        networkImageUrl: "",
        aboutImageUrl: "",
        cores: {}
      };
      console.log("Error occurred, returning default settings:", defaultSettings);
      res.json(defaultSettings);
    }
  });
  app2.put("/api/settings/site", async (req, res) => {
    try {
      console.log("=== PUT /api/settings/site called ===");
      console.log("Request body keys:", Object.keys(req.body));
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      console.log("Parsed settings data successfully");
      const processedData = { ...settingsData };
      const base64ToBuffer = (base64String) => {
        const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
        return Buffer.from(base64Data, "base64");
      };
      if (typeof processedData.mainImage === "string" && processedData.mainImage) {
        processedData.mainImage = base64ToBuffer(processedData.mainImage);
        console.log("Converted mainImage from base64 to Buffer");
      }
      if (typeof processedData.networkImage === "string" && processedData.networkImage) {
        processedData.networkImage = base64ToBuffer(processedData.networkImage);
        console.log("Converted networkImage from base64 to Buffer");
      }
      if (typeof processedData.aboutImage === "string" && processedData.aboutImage) {
        processedData.aboutImage = base64ToBuffer(processedData.aboutImage);
        console.log("Converted aboutImage from base64 to Buffer");
      }
      const settings = await storage.updateSiteSettings(processedData);
      console.log("Site settings updated successfully");
      res.json(settings);
    } catch (error) {
      console.error("Error in PUT /api/settings/site:", error);
      res.status(400).json({ message: "Invalid site settings data", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/settings/rules", async (req, res) => {
    try {
      console.log("=== API /api/settings/rules called ===");
      const settings = await storage.getRulesSettings();
      console.log("Rules settings from DB:", settings);
      if (!settings) {
        const defaultSettings = {
          fixedPercentage: 0
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
  app2.put("/api/settings/rules", async (req, res) => {
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
  let themeCache = null;
  let themeCacheTime = 0;
  let themeCacheEtag = "";
  const THEME_CACHE_TTL = 5 * 60 * 1e3;
  app2.get("/api/settings/theme", async (req, res) => {
    const startTime = Date.now();
    try {
      const now = Date.now();
      const isFromCache = themeCache && now - themeCacheTime < THEME_CACHE_TTL;
      const clientEtag = req.headers["if-none-match"];
      if (clientEtag && clientEtag === themeCacheEtag && isFromCache) {
        console.log(`[PERFORMANCE] /api/settings/theme 304 from cache in ${Date.now() - startTime}ms`);
        res.status(304).end();
        return;
      }
      let result;
      if (isFromCache) {
        result = themeCache;
        console.log(`[PERFORMANCE] /api/settings/theme 200 from memory cache in ${Date.now() - startTime}ms`);
      } else {
        result = await storage.getThemeSettings() || {};
        themeCache = result;
        themeCacheTime = now;
        themeCacheEtag = `"${now}-${JSON.stringify(result).length}"`;
        console.log(`[PERFORMANCE] /api/settings/theme 200 from DB in ${Date.now() - startTime}ms`);
      }
      res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
      res.set("ETag", themeCacheEtag);
      res.json(result);
    } catch (error) {
      console.error("Theme settings API error:", error);
      console.log(`[PERFORMANCE] /api/settings/theme ERROR in ${Date.now() - startTime}ms`);
      res.json({});
    }
  });
  app2.put("/api/settings/theme", async (req, res) => {
    const startTime = Date.now();
    try {
      console.log("Theme settings request body:", JSON.stringify(req.body, null, 2));
      const settingsData = insertThemeSettingsSchema.parse(req.body);
      const settings = await storage.updateThemeSettings(settingsData);
      themeCache = null;
      themeCacheTime = 0;
      themeCacheEtag = "";
      console.log(`[PERFORMANCE] PUT /api/settings/theme completed in ${Date.now() - startTime}ms`);
      res.json(settings);
    } catch (error) {
      console.error("Theme validation error:", error);
      console.log(`[PERFORMANCE] PUT /api/settings/theme ERROR in ${Date.now() - startTime}ms`);
      res.status(400).json({ message: "Invalid theme settings data" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getDashboardStats(
        startDate,
        endDate
      );
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/plan-distribution", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const distribution = await storage.getPlanDistribution(
        startDate,
        endDate
      );
      res.json(distribution);
    } catch (error) {
      console.error("Plan distribution error:", error);
      res.status(500).json({ message: "Failed to fetch plan distribution" });
    }
  });
  app2.get("/api/dashboard/plan-revenue", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const revenue = await storage.getPlanRevenue(
        startDate,
        endDate
      );
      res.json(revenue);
    } catch (error) {
      console.error("Plan revenue error:", error);
      res.status(500).json({ message: "Failed to fetch plan revenue" });
    }
  });
  let dashboardCache = /* @__PURE__ */ new Map();
  const DASHBOARD_CACHE_TTL = 2 * 60 * 1e3;
  app2.get("/api/dashboard/all", async (req, res) => {
    const startTime = Date.now();
    try {
      const { startDate, endDate } = req.query;
      const cacheKey = `${startDate || "all"}-${endDate || "all"}`;
      const now = Date.now();
      const cached = dashboardCache.get(cacheKey);
      const isFromCache = cached && now - cached.timestamp < DASHBOARD_CACHE_TTL;
      const clientEtag = req.headers["if-none-match"];
      if (clientEtag && cached && clientEtag === cached.etag && isFromCache) {
        console.log(`[PERFORMANCE] /api/dashboard/all 304 from cache in ${Date.now() - startTime}ms`);
        res.status(304).end();
        return;
      }
      let dashboardData;
      let etag;
      if (isFromCache) {
        dashboardData = cached.data;
        etag = cached.etag;
        console.log(`[PERFORMANCE] /api/dashboard/all 200 from memory cache in ${Date.now() - startTime}ms`);
      } else {
        dashboardData = await storage.getDashboardData(
          startDate,
          endDate
        );
        etag = `"${now}-${JSON.stringify(dashboardData).length}"`;
        dashboardCache.set(cacheKey, {
          data: dashboardData,
          timestamp: now,
          etag
        });
        if (dashboardCache.size > 10) {
          const firstKey = dashboardCache.keys().next().value;
          dashboardCache.delete(firstKey);
        }
        console.log(`[PERFORMANCE] /api/dashboard/all 200 from DB in ${Date.now() - startTime}ms`);
      }
      res.set("Cache-Control", "private, max-age=120, stale-while-revalidate=30");
      res.set("ETag", etag);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard all data error:", error);
      console.log(`[PERFORMANCE] /api/dashboard/all ERROR in ${Date.now() - startTime}ms`);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  app2.post("/api/admin/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.SENHA_ADMIN;
      if (!adminPassword) {
        return res.status(500).json({ message: "Senha do administrador n\xE3o configurada" });
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
  const JWT_SECRET = process.env.JWT_SECRET || "unit-secret-key-change-in-production";
  app2.post("/api/unit/login", async (req, res) => {
    try {
      const { login, password } = req.body;
      if (!login || !password) {
        return res.status(400).json({ message: "Login e senha s\xE3o obrigat\xF3rios" });
      }
      const unit = await storage.getNetworkUnitByLogin(login);
      if (!unit || !unit.senhaHash) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      if (!unit.isActive) {
        return res.status(401).json({ message: "Unidade inativa" });
      }
      const isValidPassword = await bcrypt.compare(password, unit.senhaHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      const tokenPayload = {
        unitId: unit.id,
        urlSlug: unit.urlSlug,
        type: "unit"
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: "24h",
        issuer: "unipet-units"
      });
      res.cookie("unit_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1e3
        // 24 hours
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
  app2.post("/api/unit/logout", async (req, res) => {
    try {
      res.clearCookie("unit_token");
      res.json({ success: true, message: "Logout realizado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });
  app2.get("/api/unit/verify-session", async (req, res) => {
    try {
      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.unit_token) {
        token = req.cookies.unit_token;
      }
      if (!token) {
        return res.status(401).json({ message: "Token de autoriza\xE7\xE3o necess\xE1rio" });
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== "unit") {
          return res.status(401).json({ message: "Token inv\xE1lido" });
        }
        const unit = await storage.getNetworkUnit(decoded.unitId);
        if (!unit || !unit.isActive) {
          return res.status(401).json({ message: "Sess\xE3o inv\xE1lida" });
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
        return res.status(401).json({ message: "Token inv\xE1lido ou expirado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar sess\xE3o" });
    }
  });
  const authenticateUnit = async (req, res, next) => {
    try {
      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.unit_token) {
        token = req.cookies.unit_token;
      }
      if (!token) {
        return res.status(401).json({ message: "Token de autoriza\xE7\xE3o necess\xE1rio" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== "unit") {
        return res.status(401).json({ message: "Token inv\xE1lido" });
      }
      const unit = await storage.getNetworkUnit(decoded.unitId);
      if (!unit || !unit.isActive) {
        return res.status(401).json({ message: "Unidade inativa ou n\xE3o encontrada" });
      }
      req.unit = unit;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inv\xE1lido ou expirado" });
    }
  };
  app2.get("/api/unit/:unitId/guides", authenticateUnit, async (req, res) => {
    try {
      const { unitId } = req.params;
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade n\xE3o autorizada" });
      }
      const guides2 = await storage.getGuidesByNetworkUnit(unitId);
      res.json(guides2);
    } catch (error) {
      console.error("Error fetching unit guides:", error);
      res.status(500).json({ message: "Erro ao buscar guias" });
    }
  });
  app2.put("/api/unit/guides/:guideId/status", authenticateUnit, async (req, res) => {
    try {
      const { guideId } = req.params;
      const { unitStatus } = req.body;
      if (!unitStatus || !["pending", "accepted", "rejected", "completed"].includes(unitStatus)) {
        return res.status(400).json({ message: "Status inv\xE1lido" });
      }
      const guide = await storage.getGuide(guideId);
      if (!guide) {
        return res.status(404).json({ message: "Guia n\xE3o encontrada" });
      }
      if (guide.networkUnitId !== req.unit.id) {
        return res.status(403).json({ message: "Acesso negado - guia n\xE3o pertence a esta unidade" });
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
  app2.get("/api/unit/:unitId/clients", authenticateUnit, async (req, res) => {
    try {
      const { unitId } = req.params;
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade n\xE3o autorizada" });
      }
      const clients2 = await storage.getClientsByNetworkUnit(unitId);
      res.json(clients2);
    } catch (error) {
      console.error("Error fetching unit clients:", error);
      res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  });
  app2.get("/api/unit/:unitId/coverage", authenticateUnit, async (req, res) => {
    try {
      const { unitId } = req.params;
      if (req.unit.id !== unitId) {
        return res.status(403).json({ message: "Acesso negado - unidade n\xE3o autorizada" });
      }
      const coverage = await storage.getCoverageByNetworkUnit(unitId);
      res.json(coverage);
    } catch (error) {
      console.error("Error fetching unit coverage:", error);
      res.status(500).json({ message: "Erro ao buscar cobertura" });
    }
  });
  app2.post("/api/unit/guides", authenticateUnit, async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse({
        ...req.body,
        networkUnitId: req.unit.id,
        // Ensure guide is assigned to authenticated unit
        unitStatus: "accepted"
        // Guides created by units are automatically accepted
      });
      const guide = await storage.createGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating guide from unit:", error);
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ message: "Dados da guia inv\xE1lidos", details: error.message });
      } else {
        res.status(400).json({ message: "Erro ao criar guia" });
      }
    }
  });
  app2.get("/api/unit/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const unit = await storage.getNetworkUnitBySlug(slug);
      if (!unit) {
        return res.status(404).json({ message: "Unidade n\xE3o encontrada", exists: false, isActive: false });
      }
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
  app2.get("/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const staticPaths = [
        "api",
        "assets",
        "favicon.ico",
        "favicon.png",
        "robots.txt",
        "sitemap.xml",
        "@vite",
        "@fs",
        "__vite_ping",
        "src",
        "node_modules",
        "public",
        "admin",
        "rede",
        "clientes",
        "pets",
        "guias",
        "planos",
        "perguntas-frequentes",
        "formularios",
        "configuracoes",
        "administracao",
        "health",
        "login",
        "logout"
      ];
      if (staticPaths.includes(slug) || slug.includes(".") || slug.startsWith("_") || slug.startsWith("@")) {
        return next();
      }
      const unit = await storage.getNetworkUnitBySlug(slug);
      if (!unit || !unit.isActive) {
        return next();
      }
      if (process.env.NODE_ENV === "production") {
        return res.sendFile(path.resolve(__dirname, "../dist/public/index.html"));
      } else {
        req.isUnitPage = true;
        return next();
      }
    } catch (error) {
      console.error("Dynamic route error:", error);
      return next();
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "node:url";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      // Importar plugins do Replit apenas em desenvolvimento
      await import("@replit/vite-plugin-runtime-error-modal").then(
        (m) => m.default()
      ),
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(path2.dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": path2.resolve(path2.dirname(fileURLToPath(import.meta.url)), "shared"),
      "@assets": path2.resolve(path2.dirname(fileURLToPath(import.meta.url)), "attached_assets")
    }
  },
  root: path2.resolve(path2.dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: path2.resolve(path2.dirname(fileURLToPath(import.meta.url)), "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        path3.dirname(fileURLToPath2(import.meta.url)),
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(path3.dirname(fileURLToPath2(import.meta.url)), "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    });
    const gracefulShutdown = (signal) => {
      log(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        log("Server closed");
        process.exit(0);
      });
      setTimeout(() => {
        log("Force closing server");
        process.exit(1);
      }, 3e4);
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  });
})();
