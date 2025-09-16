import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, json, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const planTypeEnum = pgEnum("plan_type_enum", ["with_waiting_period", "without_waiting_period"]);

// Users table for authentication and administration
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"),
  permissions: json("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").default(true),
});

// Clients table
export const clients = pgTable("clients", {
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
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Pets table
export const pets = pgTable("pets", {
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
  vaccineData: json("vaccine_data").$type<{vaccine: string, date: string}[]>().default([]),
  lastCheckup: timestamp("last_checkup"),
  parasite_treatments: text("parasite_treatments"),
  planId: varchar("plan_id").references(() => plans.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Plans table  
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  buttonText: text("button_text").notNull().default("Contratar Plano"),
  displayOrder: integer("display_order").notNull().default(0),
  price: integer("price").notNull().default(0),
  planType: planTypeEnum("plan_type").notNull().default("with_waiting_period"),
});


// Network Units table
export const networkUnits = pgTable("network_units", {
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
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// FAQ items table
export const faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Procedures table - procedimentos principais
export const procedures = pgTable("procedures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
  return {
    displayOrderIdx: index("procedures_display_order_idx").on(table.displayOrder),
    isActiveIdx: index("procedures_is_active_idx").on(table.isActive),
  };
});

// Contact submissions table
export const contactSubmissions = pgTable("contact_submissions", {
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
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
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
  mainImage: text("main_image"),
  networkImage: text("network_image"),
  aboutImage: text("about_image"),
  cores: json("cores").$type<{[key: string]: string}>().default({}),
});


// Theme settings table
export const themeSettings = pgTable("theme_settings", {
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
  warningColor: text("warning_color").default("#f59e0b"),

});

// Guides table
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  networkUnitId: varchar("network_unit_id").references(() => networkUnits.id),
  type: text("type").notNull(), // 'consulta', 'exames', 'internacao', 'reembolso'
  procedure: text("procedure").notNull(),
  procedureNotes: text("procedure_notes"),
  generalNotes: text("general_notes"),
  value: decimal("value"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected', 'completed'
  unitStatus: text("unit_status").default("pending"), // 'pending', 'accepted', 'rejected' - status specific for network units
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  vaccineData: z.array(z.object({
    vaccine: z.string(),
    date: z.string()
  })).optional()
});
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true });
export const insertNetworkUnitSchema = createInsertSchema(networkUnits).omit({ id: true, createdAt: true }).extend({
  imageUrl: z.string().min(1, "Imagem da unidade é obrigatória"),
  urlSlug: z.string().optional(), // URL slug is optional - will be auto-generated if not provided
});
export const insertFaqItemSchema = createInsertSchema(faqItems).omit({ id: true, createdAt: true });
export const insertProcedureSchema = createInsertSchema(procedures).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });
export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true }).extend({
  mainImage: z.string().optional(),
  networkImage: z.string().optional(),
  aboutImage: z.string().optional(),
});
export const insertThemeSettingsSchema = createInsertSchema(themeSettings).omit({ id: true });
export const insertGuideSchema = createInsertSchema(guides).omit({ id: true, createdAt: true, updatedAt: true });

// Credential update schema for network units
export const updateNetworkUnitCredentialsSchema = z.object({
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

// Types - Using Drizzle's $inferInsert for storage compatibility
export type InsertUser = typeof users.$inferInsert;
export type InsertClient = typeof clients.$inferInsert;
export type InsertPet = typeof pets.$inferInsert;
export type InsertPlan = typeof plans.$inferInsert;
export type InsertNetworkUnit = typeof networkUnits.$inferInsert;
export type InsertFaqItem = typeof faqItems.$inferInsert;
export type InsertProcedure = typeof procedures.$inferInsert;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
export type InsertThemeSettings = typeof themeSettings.$inferInsert;
export type InsertGuide = typeof guides.$inferInsert;

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type NetworkUnit = typeof networkUnits.$inferSelect;
export type FaqItem = typeof faqItems.$inferSelect;
export type Procedure = typeof procedures.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type Guide = typeof guides.$inferSelect;

// Safe type for network units with credential status (excludes password hash)
export type NetworkUnitWithCredentialStatus = Omit<NetworkUnit, 'senhaHash'> & {
  hasCredentials: boolean;
};

// Credential update type
export type UpdateNetworkUnitCredentials = z.infer<typeof updateNetworkUnitCredentialsSchema>;
