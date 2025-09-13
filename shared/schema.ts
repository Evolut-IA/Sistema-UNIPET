import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  price: decimal("price").notNull(),
  planType: text("plan_type").notNull(), // 'com_coparticipacao' or 'sem_coparticipacao'
  features: json("features").$type<string[]>().default([]),
  modalidadesDePagamento: json("modalidades_de_pagamento").$type<string[]>().default([]), // 'mensal', 'anual', 'ambos'
  tiposDePagamento: json("tipos_de_pagamento").$type<{
    mensal: string[],
    anual: string[]
  }>().default({ mensal: [], anual: [] }),
  procedures: json("procedures").$type<{
    section: string,
    name: string,
    price: number
  }[]>().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").default(true),
});

// Network Units table
export const networkUnits = pgTable("network_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  services: json("services").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  whatsapp: text("whatsapp"),
  googleMapsUrl: text("google_maps_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// FAQ items table
export const faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
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

// Chat settings table
export const chatSettings = pgTable("chat_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  welcomeMessage: text("welcome_message"),
  botIcon: text("bot_icon"),
  userIcon: text("user_icon"),
  placeholderText: text("placeholder_text"),
  chatTitle: text("chat_title"),
  chatPosition: text("chat_position"), // 'left' or 'right'
  chatSize: text("chat_size"), // 'small', 'medium', 'large'
  isEnabled: boolean("is_enabled").default(true),
});

// Guides table
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  type: text("type").notNull(), // 'consulta', 'exames', 'internacao', 'reembolso'
  procedure: text("procedure").notNull(),
  procedureNotes: text("procedure_notes"),
  generalNotes: text("general_notes"),
  value: decimal("value"),
  status: text("status").default("open"), // 'open', 'closed', 'cancelled'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true });
export const insertNetworkUnitSchema = createInsertSchema(networkUnits).omit({ id: true, createdAt: true });
export const insertFaqItemSchema = createInsertSchema(faqItems).omit({ id: true, createdAt: true });
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });
export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });
export const insertChatSettingsSchema = createInsertSchema(chatSettings).omit({ id: true });
export const insertGuideSchema = createInsertSchema(guides).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertNetworkUnit = z.infer<typeof insertNetworkUnitSchema>;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type InsertChatSettings = z.infer<typeof insertChatSettingsSchema>;
export type InsertGuide = z.infer<typeof insertGuideSchema>;

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type NetworkUnit = typeof networkUnits.$inferSelect;
export type FaqItem = typeof faqItems.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type ChatSettings = typeof chatSettings.$inferSelect;
export type Guide = typeof guides.$inferSelect;
