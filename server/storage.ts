import {
  type ContactSubmission,
  type InsertContactSubmission,
  type Plan,
  type InsertPlan,
  type NetworkUnit,
  type InsertNetworkUnit,
  type FaqItem,
  type InsertFaqItem,
  type SiteSettings,
  type InsertSiteSettings,
  type ChatSettings,
  type InsertChatSettings,
  type Client,
  type InsertClient,
  type Species,
  type InsertSpecies,
  type Pet,
  type InsertPet,
  type Contract,
  type InsertContract,
  type Procedure,
  type InsertProcedure,
  type PlanProcedure,
  type InsertPlanProcedure,
  type ServiceHistory,
  type InsertServiceHistory,
  type Protocol,
  type InsertProtocol,
  type Guide,
  type InsertGuide,
  type SatisfactionSurvey,
  type InsertSatisfactionSurvey,
  type User,
  type InsertUser,
  contactSubmissions,
  plans,
  networkUnits,
  faqItems,
  siteSettings,
  chatSettings,
  clients,
  species,
  pets,
  contracts,
  procedures,
  planProcedures,
  serviceHistory,
  protocols,
  guides,
  satisfactionSurveys,
  paymentReceipts,
  users
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, asc, and, sql, like, gte, lte } from "drizzle-orm";
import { autoConfig } from "./config.js";

export interface IStorage {
  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getAllContactSubmissionsWithDateFilter(startDate?: string, endDate?: string): Promise<ContactSubmission[]>;
  deleteContactSubmission(id: string): Promise<boolean>;

  // Plans
  getPlans(): Promise<Plan[]>;
  getAllPlans(): Promise<Plan[]>;
  getAllActivePlans(): Promise<Plan[]>; // For public API
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;

  // Network Units
  getNetworkUnits(): Promise<NetworkUnit[]>;
  getAllNetworkUnits(): Promise<NetworkUnit[]>;
  getAllActiveNetworkUnits(): Promise<NetworkUnit[]>; // For public API
  getNetworkUnit(id: string): Promise<NetworkUnit | undefined>;
  createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit>;
  updateNetworkUnit(id: string, unit: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined>;
  deleteNetworkUnit(id: string): Promise<boolean>;

  // FAQ Items
  getFaqItems(): Promise<FaqItem[]>;
  getAllFaqItems(): Promise<FaqItem[]>;
  getFaqItem(id: string): Promise<FaqItem | undefined>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: string, item: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<boolean>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined>;

  // Chat Settings
  getChatSettings(): Promise<ChatSettings | undefined>;
  updateChatSettings(settings: Partial<InsertChatSettings>): Promise<ChatSettings | undefined>;
  createDefaultChatSettings(): Promise<ChatSettings>;

  // Clients
  getClientByEmail(email: string): Promise<Client | undefined>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  getAllClients(): Promise<Client[]>;
  getAllClientsWithDateFilter(startDate?: string, endDate?: string): Promise<Client[]>;
  searchClients(query: string): Promise<Client[]>; // NEW: Missing method

  // Pets
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByClientId(clientId: string): Promise<Pet[]>;
  deletePet(id: string): Promise<boolean>;
  getAllPets(): Promise<Pet[]>;
  getAllPetsWithDateFilter(startDate?: string, endDate?: string): Promise<Pet[]>;

  // Contracts
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByClientId(clientId: string): Promise<Contract[]>;
  getContractsByPetId(petId: string): Promise<Contract[]>;
  getContractByCieloPaymentId(cieloPaymentId: string): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getAllContracts(): Promise<Contract[]>;

  // Procedures
  createProcedure(procedure: InsertProcedure): Promise<Procedure>;
  updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined>;
  getProcedure(id: string): Promise<Procedure | undefined>;
  getAllProcedures(): Promise<Procedure[]>;
  getActiveProcedures(): Promise<Procedure[]>;
  getProceduresWithCoparticipation(planId?: string): Promise<any[]>;
  deleteProcedure(id: string): Promise<boolean>;

  // Plan Procedures
  createPlanProcedure(planProcedure: InsertPlanProcedure): Promise<PlanProcedure>;
  getPlanProcedures(planId: string): Promise<PlanProcedure[]>;
  deletePlanProcedure(planId: string, procedureId: string): Promise<boolean>;
  getAllPlanProcedures(): Promise<PlanProcedure[]>;

  // Service History
  createServiceHistory(serviceHistory: InsertServiceHistory): Promise<ServiceHistory>;
  updateServiceHistory(id: string, serviceHistory: Partial<InsertServiceHistory>): Promise<ServiceHistory | undefined>;
  getServiceHistory(id: string): Promise<ServiceHistory | undefined>;
  getServiceHistoryByContractId(contractId: string): Promise<ServiceHistory[]>;
  getServiceHistoryByPetId(petId: string): Promise<ServiceHistory[]>;
  getAllServiceHistory(): Promise<ServiceHistory[]>;

  // Protocols
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined>;
  getProtocol(id: string): Promise<Protocol | undefined>;
  getProtocolsByClientId(clientId: string): Promise<Protocol[]>;
  getAllProtocols(): Promise<Protocol[]>;
  deleteProtocol(id: string): Promise<boolean>;

  // Guides
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, guide: Partial<InsertGuide>): Promise<Guide | undefined>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuideById(id: string): Promise<Guide | undefined>; // NEW: Alias for routes compatibility
  getAllGuides(): Promise<Guide[]>;
  getAllGuidesWithDateFilter(startDate?: string, endDate?: string): Promise<Guide[]>;
  getActiveGuides(): Promise<Guide[]>;
  deleteGuide(id: string): Promise<boolean>;
  getGuidesWithNetworkUnits(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: Guide[];
    total: number;
    totalPages: number;
    page: number;
  }>;

  // Satisfaction Surveys
  createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey>;
  getSatisfactionSurvey(id: string): Promise<SatisfactionSurvey | undefined>;
  getSatisfactionSurveysByClientId(clientId: string): Promise<SatisfactionSurvey[]>;
  getAllSatisfactionSurveys(): Promise<SatisfactionSurvey[]>;

  // Species
  getSpecies(): Promise<Species[]>;
  getAllSpecies(): Promise<Species[]>;
  getActiveSpecies(): Promise<Species[]>;
  createSpecies(species: InsertSpecies): Promise<Species>;
  updateSpecies(id: string, species: Partial<InsertSpecies>): Promise<Species | undefined>;
  deleteSpecies(id: string): Promise<boolean>;

  // Payment Receipts methods - NEW: Now in interface
  getPaymentReceiptsByClientEmail(email: string): Promise<any[]>;
  getPaymentReceiptsByContractId(contractId: string): Promise<any[]>;
  getPaymentReceiptById(id: string): Promise<any | undefined>;
  updatePaymentReceiptStatus(id: string, status: string): Promise<any | undefined>;
  createPaymentReceipt(receipt: any): Promise<any>;
  getPaymentReceiptByCieloPaymentId(cieloPaymentId: string): Promise<any | undefined>;

  // Users
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
}// Storage em memória para quando não houver banco de dados
export class InMemoryStorage implements IStorage {
  private contactSubmissions: ContactSubmission[] = [];
  private plans: Plan[] = [];
  private networkUnits: NetworkUnit[] = [];
  private faqItems: FaqItem[] = [];
  private siteSettings: SiteSettings | undefined;
  private chatSettings: ChatSettings | undefined;
  private clients: Client[] = [];
  private users: User[] = [];
  // Chat conversations removed

  constructor() {
    // Dados de exemplo para desenvolvimento
    this.plans = [
      {
        id: "1",
        name: "Plano Básico",
        price: 2000,
        description: "Cobertura básica para seu pet",
        features: ["Consultas", "Vacinas", "Exames básicos"],
        image: "/BASICicon.svg", // Adicionar imagem do plano
        buttonText: "Contratar Plano",
        displayOrder: 1,
        isActive: true,
        planType: "with_waiting_period",
        billingFrequency: "monthly",
        basePrice: "20.00",
        installmentPrice: null,
        installmentCount: null,
        perPetBilling: false,
        petDiscounts: {},
        paymentDescription: null,
        availablePaymentMethods: ["cartao", "pix"],
        availableBillingOptions: ["monthly"],
        annualPrice: null,
        annualInstallmentPrice: null,
        annualInstallmentCount: 12,
        createdAt: new Date()
      }
    ];

    this.siteSettings = {
      id: "1",
      whatsapp: "+55 (11) 91234-5678",
      email: "contato@unipetplan.com.br",
      phone: "+55 (11) 1234-5678",
      address: "AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI",
      cnpj: "00.000.000/0001-00",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      businessHours: "",
      ourStory: "",
      privacyPolicy: "",
      termsOfUse: "",
      mainImage: Buffer.alloc(0),
      networkImage: Buffer.alloc(0),
      aboutImage: Buffer.alloc(0),
      mainImageUrl: null,
      networkImageUrl: null,
      aboutImageUrl: null,
      cores: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Implementação dos métodos da interface
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const newSubmission: ContactSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      city: submission.city,
      petName: submission.petName,
      animalType: submission.animalType,
      petAge: submission.petAge,
      planInterest: submission.planInterest,
      message: submission.message || "",
      createdAt: new Date()
    };
    this.contactSubmissions.push(newSubmission);
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return this.contactSubmissions;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return this.contactSubmissions;
  }

  async deleteContactSubmission(id: string): Promise<boolean> {
    const index = this.contactSubmissions.findIndex(s => s.id === id);
    if (index > -1) {
      this.contactSubmissions.splice(index, 1);
      return true;
    }
    return false;
  }

  async getPlans(): Promise<Plan[]> {
    return this.plans.filter(p => p.isActive);
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.plans;
  }

  async getAllActivePlans(): Promise<Plan[]> {
    return this.plans.filter(p => p.isActive);
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    return this.plans.find(p => p.id === id);
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const newPlan: Plan = {
      id: Math.random().toString(36).substr(2, 9),
      name: plan.name,
      description: plan.description,
      features: plan.features,
      image: plan.image, // Adicionar campo image
      isActive: plan.isActive ?? true,
      buttonText: plan.buttonText ?? "Contratar Plano",
      displayOrder: plan.displayOrder ?? 0,
      price: plan.price ?? 0,
      planType: plan.planType ?? "with_waiting_period",
      billingFrequency: plan.billingFrequency || "monthly",
      basePrice: plan.basePrice || "0.00",
      installmentPrice: plan.installmentPrice || null,
      installmentCount: plan.installmentCount || null,
      perPetBilling: plan.perPetBilling || false,
      petDiscounts: plan.petDiscounts || {},
      paymentDescription: plan.paymentDescription || null,
      availablePaymentMethods: plan.availablePaymentMethods || ["cartao", "pix"],
      availableBillingOptions: plan.availableBillingOptions || ["monthly"],
      annualPrice: plan.annualPrice || null,
      annualInstallmentPrice: plan.annualInstallmentPrice || null,
      annualInstallmentCount: plan.annualInstallmentCount || 12,
      createdAt: new Date()
    };
    this.plans.push(newPlan);
    return newPlan;
  }

  async updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index > -1) {
      this.plans[index] = { ...this.plans[index], ...plan };
      return this.plans[index];
    }
    return undefined;
  }



  async deletePlan(id: string): Promise<boolean> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index > -1) {
      this.plans.splice(index, 1);
      return true;
    }
    return false;
  }

  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits.filter(u => u.isActive);
  }

  async getAllNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits;
  }

  async getAllActiveNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits.filter(u => u.isActive);
  }

  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    return this.networkUnits.find(u => u.id === id);
  }

  async createNetworkUnit(insertUnit: InsertNetworkUnit): Promise<NetworkUnit> {
    const newUnit: NetworkUnit = {
      id: Math.random().toString(36).substr(2, 9),
      name: insertUnit.name,
      address: insertUnit.address,
      cidade: insertUnit.cidade,
      phone: insertUnit.phone,
      services: insertUnit.services,
      imageUrl: insertUnit.imageUrl,
      isActive: insertUnit.isActive ?? true,
      createdAt: new Date(),
      whatsapp: insertUnit.whatsapp ?? null,
      googleMapsUrl: insertUnit.googleMapsUrl ?? null,
      imageData: insertUnit.imageData ?? null,
      urlSlug: insertUnit.urlSlug || null,
      login: insertUnit.login || null,
      senhaHash: insertUnit.senhaHash || null
    };
    this.networkUnits.push(newUnit);
    return newUnit;
  }

  async updateNetworkUnit(id: string, unit: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    const index = this.networkUnits.findIndex(u => u.id === id);
    if (index > -1) {
      this.networkUnits[index] = { ...this.networkUnits[index], ...unit };
      return this.networkUnits[index];
    }
    return undefined;
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const index = this.networkUnits.findIndex(u => u.id === id);
    if (index > -1) {
      this.networkUnits.splice(index, 1);
      return true;
    }
    return false;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    return this.faqItems.filter(f => f.isActive);
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return this.faqItems;
  }

  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    return this.faqItems.find(f => f.id === id);
  }

  async createFaqItem(item: InsertFaqItem): Promise<FaqItem> {
    const newItem: FaqItem = {
      id: Math.random().toString(36).substr(2, 9),
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
      question: item.question,
      answer: item.answer,
      createdAt: new Date()
    };
    this.faqItems.push(newItem);
    return newItem;
  }

  async updateFaqItem(id: string, item: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const index = this.faqItems.findIndex(f => f.id === id);
    if (index > -1) {
      this.faqItems[index] = { ...this.faqItems[index], ...item };
      return this.faqItems[index];
    }
    return undefined;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const index = this.faqItems.findIndex(f => f.id === id);
    if (index > -1) {
      this.faqItems.splice(index, 1);
      return true;
    }
    return false;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.siteSettings;
  }

  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    if (this.siteSettings) {
      const updatedSettings = { ...this.siteSettings, ...settings, updatedAt: new Date() };
      // Ensure Buffer types are preserved
      if (settings.mainImage !== undefined) updatedSettings.mainImage = settings.mainImage || Buffer.alloc(0);
      if (settings.networkImage !== undefined) updatedSettings.networkImage = settings.networkImage || Buffer.alloc(0);
      if (settings.aboutImage !== undefined) updatedSettings.aboutImage = settings.aboutImage || Buffer.alloc(0);
      this.siteSettings = updatedSettings as SiteSettings;
      return this.siteSettings;
    }
    return undefined;
  }

  // Chat Settings methods
  async getChatSettings(): Promise<ChatSettings | undefined> {
    return this.chatSettings;
  }

  async updateChatSettings(settings: Partial<InsertChatSettings>): Promise<ChatSettings | undefined> {
    if (this.chatSettings) {
      const updatedSettings = { ...this.chatSettings, ...settings, updatedAt: new Date() };
      // Ensure Buffer types are preserved
      if (settings.botIcon !== undefined) updatedSettings.botIcon = settings.botIcon || Buffer.alloc(0);
      if (settings.userIcon !== undefined) updatedSettings.userIcon = settings.userIcon || Buffer.alloc(0);
      this.chatSettings = updatedSettings as ChatSettings;
      return this.chatSettings;
    }
    return undefined;
  }

  async createDefaultChatSettings(): Promise<ChatSettings> {
    const defaultSettings: ChatSettings = {
      id: "default",
      welcomeMessage: "Olá! Como posso te ajudar hoje?",
      placeholderText: "Digite sua mensagem...",
      chatTitle: "Atendimento Virtual",
      buttonIcon: "MessageCircle",
      botIcon: Buffer.alloc(0),
      userIcon: Buffer.alloc(0),
      botIconUrl: null,
      userIconUrl: null,
      chatPosition: "bottom-right",
      chatSize: "md",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSettings = defaultSettings;
    return defaultSettings;
  }

  // Clients methods
  async getClientByEmail(email: string): Promise<Client | undefined> {
    return this.clients.find(c => c.email === email);
  }

  async getClientById(id: string): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      password: client.password ?? null,
      cpf: client.cpf || "",
      cep: client.cep || "",
      address: client.address || "",
      number: client.number || "",
      complement: client.complement || "",
      district: client.district || "",
      state: client.state || "",
      city: client.city || "",
      image: (client as any).image || null,
      imageUrl: (client as any).imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clients.push(newClient);
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index > -1) {
      this.clients[index] = { ...this.clients[index], ...client, updatedAt: new Date() };
      return this.clients[index];
    }
    return undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index > -1) {
      this.clients.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAllClients(): Promise<Client[]> {
    return this.clients;
  }

  // === NEW TABLE STUB IMPLEMENTATIONS ===
  // These are stub implementations for InMemoryStorage - not used in production

  // Pets
  async createPet(pet: InsertPet): Promise<Pet> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }
  async updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }
  async getPet(id: string): Promise<Pet | undefined> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }
  async getPetsByClientId(clientId: string): Promise<Pet[]> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }
  async deletePet(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }
  async getAllPets(): Promise<Pet[]> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }

  // Contracts
  async createContract(contract: InsertContract): Promise<Contract> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async getContract(id: string): Promise<Contract | undefined> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async getContractsByPetId(petId: string): Promise<Contract[]> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async getContractByCieloPaymentId(cieloPaymentId: string): Promise<Contract | undefined> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async deleteContract(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }
  async getAllContracts(): Promise<Contract[]> {
    throw new Error('InMemoryStorage: Contracts not implemented');
  }

  // Procedures
  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async getProcedure(id: string): Promise<Procedure | undefined> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async getAllProcedures(): Promise<Procedure[]> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async getActiveProcedures(): Promise<Procedure[]> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async getProceduresWithCoparticipation(planId?: string): Promise<any[]> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }
  async deleteProcedure(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Procedures not implemented');
  }

  // Plan Procedures
  async createPlanProcedure(planProcedure: InsertPlanProcedure): Promise<PlanProcedure> {
    throw new Error('InMemoryStorage: PlanProcedures not implemented');
  }
  async getPlanProcedures(planId: string): Promise<PlanProcedure[]> {
    throw new Error('InMemoryStorage: PlanProcedures not implemented');
  }
  async deletePlanProcedure(planId: string, procedureId: string): Promise<boolean> {
    throw new Error('InMemoryStorage: PlanProcedures not implemented');
  }
  async getAllPlanProcedures(): Promise<PlanProcedure[]> {
    throw new Error('InMemoryStorage: PlanProcedures not implemented');
  }

  // Service History
  async createServiceHistory(serviceHistoryData: InsertServiceHistory): Promise<ServiceHistory> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }
  async updateServiceHistory(id: string, serviceHistoryData: Partial<InsertServiceHistory>): Promise<ServiceHistory | undefined> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }
  async getServiceHistory(id: string): Promise<ServiceHistory | undefined> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }
  async getServiceHistoryByContractId(contractId: string): Promise<ServiceHistory[]> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }
  async getServiceHistoryByPetId(petId: string): Promise<ServiceHistory[]> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }
  async getAllServiceHistory(): Promise<ServiceHistory[]> {
    throw new Error('InMemoryStorage: ServiceHistory not implemented');
  }

  // Protocols
  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }
  async updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }
  async getProtocol(id: string): Promise<Protocol | undefined> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }
  async getProtocolsByClientId(clientId: string): Promise<Protocol[]> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }
  async getAllProtocols(): Promise<Protocol[]> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }
  async deleteProtocol(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Protocols not implemented');
  }

  // Guides
  async createGuide(guide: InsertGuide): Promise<Guide> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }
  async updateGuide(id: string, guide: Partial<InsertGuide>): Promise<Guide | undefined> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }
  async getGuide(id: string): Promise<Guide | undefined> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }
  async getAllGuides(): Promise<Guide[]> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }
  async getActiveGuides(): Promise<Guide[]> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }
  async deleteGuide(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }

  // Satisfaction Surveys
  async createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey> {
    throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
  }
  async getSatisfactionSurvey(id: string): Promise<SatisfactionSurvey | undefined> {
    throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
  }
  async getSatisfactionSurveysByClientId(clientId: string): Promise<SatisfactionSurvey[]> {
    throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
  }
  async getAllSatisfactionSurveys(): Promise<SatisfactionSurvey[]> {
    throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
  }

  // Species
  async getSpecies(): Promise<Species[]> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  async getAllSpecies(): Promise<Species[]> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  async getActiveSpecies(): Promise<Species[]> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  async createSpecies(species: InsertSpecies): Promise<Species> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  async updateSpecies(id: string, species: Partial<InsertSpecies>): Promise<Species | undefined> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  async deleteSpecies(id: string): Promise<boolean> {
    throw new Error('InMemoryStorage: Species not implemented');
  }

  // Payment Receipts methods
  async getPaymentReceiptsByClientEmail(email: string): Promise<any[]> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  async getPaymentReceiptsByContractId(contractId: string): Promise<any[]> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  async getPaymentReceiptById(id: string): Promise<any | undefined> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  async updatePaymentReceiptStatus(id: string, status: string): Promise<any | undefined> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  async createPaymentReceipt(receipt: any): Promise<any> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  async getPaymentReceiptByCieloPaymentId(cieloPaymentId: string): Promise<any | undefined> {
    throw new Error('InMemoryStorage: Payment receipts not implemented');
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...user,
      createdAt: new Date(),
      isActive: user.isActive ?? true,
      role: user.role ?? 'admin',
      permissions: user.permissions ?? []
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...user };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  // Missing interface methods implementation
  async getAllContactSubmissionsWithDateFilter(startDate?: string, endDate?: string): Promise<ContactSubmission[]> {
    return this.contactSubmissions;
  }

  async getAllClientsWithDateFilter(startDate?: string, endDate?: string): Promise<Client[]> {
    return this.clients;
  }

  async searchClients(query: string): Promise<Client[]> {
    return this.clients.filter(client => 
      client.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      client.email.toLowerCase().includes(query.toLowerCase()) ||
      client.phone?.includes(query)
    );
  }

  async getAllPetsWithDateFilter(startDate?: string, endDate?: string): Promise<Pet[]> {
    throw new Error('InMemoryStorage: Pets not implemented');
  }

  async getAllGuidesWithDateFilter(startDate?: string, endDate?: string): Promise<Guide[]> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }

  async getGuideById(id: string): Promise<Guide | undefined> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }

  async getGuidesWithNetworkUnits(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Guide[]; total: number; totalPages: number; page: number; }> {
    throw new Error('InMemoryStorage: Guides not implemented');
  }

  // Chat Conversations methods - Removed (table no longer exists)
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Session management now uses MemoryStore via express-session
  }

  // Contact Submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values(insertSubmission as any).returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async deleteContactSubmission(id: string): Promise<boolean> {
    const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    try {
      const result = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
        // ✅ Novas colunas para informações de pagamento
        billingFrequency: plans.billingFrequency,
        basePrice: plans.basePrice,
        installmentPrice: plans.installmentPrice,
        installmentCount: plans.installmentCount,
        perPetBilling: plans.perPetBilling,
        petDiscounts: plans.petDiscounts,
        paymentDescription: plans.paymentDescription,
        availablePaymentMethods: plans.availablePaymentMethods,
        availableBillingOptions: plans.availableBillingOptions,
        annualPrice: plans.annualPrice,
        annualInstallmentPrice: plans.annualInstallmentPrice,
        annualInstallmentCount: plans.annualInstallmentCount,
      }).from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));

      return result;
    } catch (error) {
      console.error("Error in getPlans:", error);
      throw error;
    }
  }

  async getAllPlans(): Promise<Plan[]> {
    try {
      const result = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
        // ✅ Novas colunas para informações de pagamento
        billingFrequency: plans.billingFrequency,
        basePrice: plans.basePrice,
        installmentPrice: plans.installmentPrice,
        installmentCount: plans.installmentCount,
        perPetBilling: plans.perPetBilling,
        petDiscounts: plans.petDiscounts,
        paymentDescription: plans.paymentDescription,
        availablePaymentMethods: plans.availablePaymentMethods,
        availableBillingOptions: plans.availableBillingOptions,
        annualPrice: plans.annualPrice,
        annualInstallmentPrice: plans.annualInstallmentPrice,
        annualInstallmentCount: plans.annualInstallmentCount,
      }).from(plans).orderBy(asc(plans.displayOrder));

      return result;
    } catch (error) {
      console.error("Error in getAllPlans:", error);
      throw error;
    }
  }

  async getAllActivePlans(): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    try {
      const [plan] = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
        // ✅ Novas colunas para informações de pagamento
        billingFrequency: plans.billingFrequency,
        basePrice: plans.basePrice,
        installmentPrice: plans.installmentPrice,
        installmentCount: plans.installmentCount,
        perPetBilling: plans.perPetBilling,
        petDiscounts: plans.petDiscounts,
        paymentDescription: plans.paymentDescription,
        availablePaymentMethods: plans.availablePaymentMethods,
        availableBillingOptions: plans.availableBillingOptions,
        annualPrice: plans.annualPrice,
        annualInstallmentPrice: plans.annualInstallmentPrice,
        annualInstallmentCount: plans.annualInstallmentCount,
      }).from(plans).where(eq(plans.id, id));

      return plan || undefined;
    } catch (error) {
      console.error("Error in getPlan:", error);
      throw error;
    }
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(insertPlan as any).returning();
    return plan;
  }

  async updatePlan(id: string, updateData: Partial<InsertPlan>): Promise<Plan | undefined> {
    const [plan] = await db.update(plans).set(updateData).where(eq(plans.id, id)).returning();
    return plan || undefined;
  }



  async deletePlan(id: string): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Network Units
  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true));
  }

  async getAllNetworkUnits(): Promise<NetworkUnit[]> {
    try {
      const results = await db.select().from(networkUnits);
      console.log(`✅ [STORAGE] Found ${results.length} network units`);

      // Debug log for the returned data
      results.forEach(unit => {
        console.log(`📸 [STORAGE] Unit ${unit.name}:`);
        console.log(`  - imageUrl (Base64):`, unit.imageUrl?.substring(0, 50) || 'null');
        console.log(`  - imageData:`, unit.imageData?.substring(0, 50) || 'null');
        console.log(`  - imageUrl starts with:`, unit.imageUrl?.substring(0, 10) || 'null');
        console.log(`  - imageUrl length:`, unit.imageUrl?.length || 0);
      });

      return results;
    } catch (error) {
      console.error("❌ [STORAGE] Error fetching network units:", error);
      throw error;
    }
  }

  async getAllActiveNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true)).orderBy(desc(networkUnits.createdAt));
  }

  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    const [unit] = await db.select().from(networkUnits).where(eq(networkUnits.id, id));
    return unit || undefined;
  }

  async createNetworkUnit(insertUnit: InsertNetworkUnit): Promise<NetworkUnit> {
    const [unit] = await db.insert(networkUnits).values(insertUnit as any).returning();
    return unit;
  }

  async updateNetworkUnit(id: string, updateData: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
    const [unit] = await db.update(networkUnits).set(updateData).where(eq(networkUnits.id, id)).returning();
    return unit || undefined;
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const result = await db.delete(networkUnits).where(eq(networkUnits.id, id));
    return (result.rowCount || 0) > 0;
  }

  // FAQ Items
  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.displayOrder));
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).orderBy(asc(faqItems.displayOrder));
  }

  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    const [item] = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return item || undefined;
  }

  async createFaqItem(insertItem: InsertFaqItem): Promise<FaqItem> {
    const [item] = await db.insert(faqItems).values(insertItem as any).returning();
    return item;
  }

  async updateFaqItem(id: string, updateData: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
    const [item] = await db.update(faqItems).set(updateData).where(eq(faqItems.id, id)).returning();
    return item || undefined;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const result = await db.delete(faqItems).where(eq(faqItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }

  async updateSiteSettings(updateData: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }

    // Filter only null and undefined values, but allow empty strings (to enable field clearing)
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => {
        // Keep if not null/undefined - allow empty strings
        return value !== null && value !== undefined;
      })
    );

    console.log('🔍 [STORAGE] Original update data:', updateData);
    console.log('🔍 [STORAGE] Filtered update data:', filteredUpdateData);

    if (Object.keys(filteredUpdateData).length === 0) {
      console.log('🔍 [STORAGE] No valid fields to update after filtering');
      throw new Error('No valid fields to update');
    }

    const existingSettings = await this.getSiteSettings();

    if (existingSettings) {
      const [settings] = await db.update(siteSettings)
        .set({ ...filteredUpdateData, updatedAt: new Date() })
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();
      console.log('🔍 [STORAGE] Updated existing settings:', settings);
      return settings || undefined;
    } else {
      const [settings] = await db.insert(siteSettings)
        .values({ ...filteredUpdateData, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      console.log('🔍 [STORAGE] Created new settings:', settings);
      return settings;
    }
  }

  // Chat Settings
  async getChatSettings(): Promise<ChatSettings | undefined> {
    try {
      const [settings] = await db.select().from(chatSettings).limit(1);
      return settings || undefined;
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      return undefined;
    }
  }

  async updateChatSettings(updateData: Partial<InsertChatSettings>): Promise<ChatSettings | undefined> {
    try {
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Update data cannot be empty');
      }

      const current = await this.getChatSettings();
      
      if (current) {
        // Convert string Buffer fields to actual Buffers if needed
        const convertedData: any = { ...updateData, updatedAt: new Date() };
        if (updateData.botIcon !== undefined && typeof updateData.botIcon === 'string') {
          convertedData.botIcon = Buffer.from(updateData.botIcon, 'base64');
        }
        if (updateData.userIcon !== undefined && typeof updateData.userIcon === 'string') {
          convertedData.userIcon = Buffer.from(updateData.userIcon, 'base64');
        }
        const [updated] = await db
          .update(chatSettings)
          .set(convertedData as any)
          .where(eq(chatSettings.id, current.id))
          .returning();
        return updated;
      } else {
        return this.createDefaultChatSettings();
      }
    } catch (error) {
      console.error('Error updating chat settings:', error);
      throw error;
    }
  }

  async createDefaultChatSettings(): Promise<ChatSettings> {
    try {
      const defaultData: InsertChatSettings = {
        welcomeMessage: "Olá! Como posso te ajudar hoje?",
        placeholderText: "Digite sua mensagem...",
        chatTitle: "Atendimento Virtual",
        buttonIcon: "MessageCircle",
        botIcon: null,
        userIcon: null,
        chatPosition: "bottom-right",
        chatSize: "md",
        isEnabled: true,
      };

      const [created] = await db.insert(chatSettings).values(defaultData as any).returning();
      return created;
    } catch (error) {
      console.error('Error creating default chat settings:', error);
      throw error;
    }
  }

  // Clients
  async getClientByEmail(email: string): Promise<Client | undefined> {
    try {
      const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, email))
        .limit(1);
      return client;
    } catch (error) {
      console.error('❌ Error fetching client by email:', error);
      return undefined;
    }
  }

  async getClientById(id: string): Promise<Client | undefined> {
    try {
      const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, id))
        .limit(1);
      return client;
    } catch (error) {
      console.error('❌ Error fetching client by id:', error);
      return undefined;
    }
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client as any)
      .returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    try {
      const [updatedClient] = await db
        .update(clients)
        .set({ ...client, updatedAt: new Date() })
        .where(eq(clients.id, id))
        .returning();
      return updatedClient;
    } catch (error) {
      console.error('❌ Error updating client:', error);
      return undefined;
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(clients)
        .where(eq(clients.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      return false;
    }
  }

  async getAllClients(): Promise<Client[]> {
    try {
      const clientsList = await db.select().from(clients);
      return clientsList;
    } catch (error) {
      console.error('❌ Error fetching all clients:', error);
      return [];
    }
  }

  // === NEW TABLE IMPLEMENTATIONS ===

  // Pets
  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet as any).returning();
    return newPet;
  }

  async updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined> {
    const [updatedPet] = await db
      .update(pets)
      .set({ ...pet, updatedAt: new Date() })
      .where(eq(pets.id, id))
      .returning();
    return updatedPet || undefined;
  }

  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async getPetsByClientId(clientId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.clientId, clientId));
  }

  async deletePet(id: string): Promise<boolean> {
    const result = await db.delete(pets).where(eq(pets.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllPets(): Promise<Pet[]> {
    return await db.select().from(pets);
  }

  // Contracts
  async createContract(contract: InsertContract): Promise<Contract> {
    // Gerar contractNumber automaticamente se não fornecido
    const contractNumber = contract.contractNumber || `UNIPET-${Date.now()}-${contract.petId?.substring(0, 4).toUpperCase() || 'XXXX'}`;
    
    // Mapear explicitamente para os campos corretos do schema
    const payload = {
      clientId: contract.clientId,
      planId: contract.planId,
      petId: contract.petId,
      contractNumber: contractNumber, // Drizzle espera este nome exato
      status: contract.status || 'active',
      startDate: contract.startDate || new Date(),
      monthlyAmount: contract.monthlyAmount,
      paymentMethod: contract.paymentMethod,
      cieloPaymentId: contract.cieloPaymentId,
      // Payment proof fields - properly typed access
      ...((contract as any).proofOfSale !== undefined && { proofOfSale: (contract as any).proofOfSale }),
      ...((contract as any).authorizationCode !== undefined && { authorizationCode: (contract as any).authorizationCode }),
      ...((contract as any).tid !== undefined && { tid: (contract as any).tid }),
      ...((contract as any).receivedDate !== undefined && { receivedDate: (contract as any).receivedDate }),
      ...((contract as any).returnCode !== undefined && { returnCode: (contract as any).returnCode }),
      ...((contract as any).returnMessage !== undefined && { returnMessage: (contract as any).returnMessage }),
      ...((contract as any).pixQrCode !== undefined && { pixQrCode: (contract as any).pixQrCode }),
      ...((contract as any).pixCode !== undefined && { pixCode: (contract as any).pixCode })
    };
    
    console.log("🔍 [STORAGE-DEBUG] Payload mapeado para Drizzle:", JSON.stringify(payload, null, 2));
    
    const [newContract] = await db.insert(contracts).values(payload).returning();
    return newContract;
  }

  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ ...contract, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract || undefined;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.clientId, clientId));
  }

  async getContractsByPetId(petId: string): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.petId, petId));
  }

  async getContractByCieloPaymentId(cieloPaymentId: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.cieloPaymentId, cieloPaymentId));
    return contract || undefined;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllContracts(): Promise<Contract[]> {
    return await db.select().from(contracts);
  }

  // Procedures
  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    const [newProcedure] = await db.insert(procedures).values(procedure as any).returning();
    return newProcedure;
  }

  async updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined> {
    const [updatedProcedure] = await db
      .update(procedures)
      .set({ ...procedure, updatedAt: new Date() })
      .where(eq(procedures.id, id))
      .returning();
    return updatedProcedure || undefined;
  }

  async getProcedure(id: string): Promise<Procedure | undefined> {
    const [procedure] = await db.select().from(procedures).where(eq(procedures.id, id));
    return procedure || undefined;
  }

  async getAllProcedures(): Promise<Procedure[]> {
    return await db.select().from(procedures);
  }

  async getActiveProcedures(): Promise<any[]> {
    return await db.select().from(procedures).where(eq(procedures.isActive, true));
  }

  // Get procedures with real coparticipation data from plan_procedures
  async getProceduresWithCoparticipation(planId?: string): Promise<any[]> {
    try {
      if (planId) {
        // Get procedures for specific plan using raw SQL to access correct column names
        const result = await db.execute(sql`
          SELECT 
            p.id,
            p.name,
            p.description,
            p.category,
            p.is_active,
            p.created_at,
            p.display_order,
            pp.coparticipacao,
            pp.price,
            pp.pay_value,
            pp.is_included,
            pp.plan_id
          FROM procedures p
          INNER JOIN plan_procedures pp ON p.id = pp.procedure_id
          WHERE p.is_active = true 
            AND pp.plan_id = ${planId}
            AND pp.is_included = true
          ORDER BY p.display_order ASC, p.name ASC
        `);
        
        return result.rows;
      } else {
        // Get all distinct procedures (avoiding duplicates from plan relationships)
        const result = await db.execute(sql`
          SELECT DISTINCT
            p.id,
            p.name,
            p.description,
            p.category,
            p.is_active,
            p.created_at,
            p.display_order,
            NULL as coparticipacao,
            NULL as price,
            NULL as pay_value,
            NULL as is_included,
            NULL as plan_id
          FROM procedures p
          WHERE p.is_active = true
          ORDER BY p.display_order ASC, p.name ASC
        `);
        
        return result.rows;
      }
    } catch (error) {
      console.error('❌ Error fetching procedures with coparticipation:', error);
      return [];
    }
  }

  async deleteProcedure(id: string): Promise<boolean> {
    const result = await db.delete(procedures).where(eq(procedures.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Plan Procedures
  async createPlanProcedure(planProcedure: InsertPlanProcedure): Promise<PlanProcedure> {
    const [newPlanProcedure] = await db.insert(planProcedures).values(planProcedure as any).returning();
    return newPlanProcedure;
  }

  async getPlanProcedures(planId: string): Promise<PlanProcedure[]> {
    return await db.select().from(planProcedures).where(eq(planProcedures.planId, planId));
  }

  async deletePlanProcedure(planId: string, procedureId: string): Promise<boolean> {
    const result = await db
      .delete(planProcedures)
      .where(
        eq(planProcedures.planId, planId) && eq(planProcedures.procedureId, procedureId)
      );
    return (result.rowCount || 0) > 0;
  }

  async getAllPlanProcedures(): Promise<PlanProcedure[]> {
    return await db.select().from(planProcedures);
  }

  // Service History
  async createServiceHistory(serviceHistoryData: InsertServiceHistory): Promise<ServiceHistory> {
    const [newServiceHistory] = await db.insert(serviceHistory).values(serviceHistoryData as any).returning();
    return newServiceHistory;
  }

  async updateServiceHistory(id: string, serviceHistoryData: Partial<InsertServiceHistory>): Promise<ServiceHistory | undefined> {
    const [updatedServiceHistory] = await db
      .update(serviceHistory)
      .set({ ...serviceHistoryData, updatedAt: new Date() })
      .where(eq(serviceHistory.id, id))
      .returning();
    return updatedServiceHistory || undefined;
  }

  async getServiceHistory(id: string): Promise<ServiceHistory | undefined> {
    const [history] = await db.select().from(serviceHistory).where(eq(serviceHistory.id, id));
    return history || undefined;
  }

  async getServiceHistoryByContractId(contractId: string): Promise<ServiceHistory[]> {
    return await db.select().from(serviceHistory).where(eq(serviceHistory.contractId, contractId));
  }

  async getServiceHistoryByPetId(petId: string): Promise<ServiceHistory[]> {
    return await db.select().from(serviceHistory).where(eq(serviceHistory.petId, petId));
  }

  async getAllServiceHistory(): Promise<ServiceHistory[]> {
    return await db.select().from(serviceHistory);
  }

  // Protocols
  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    const [newProtocol] = await db.insert(protocols).values(protocol as any).returning();
    return newProtocol;
  }

  async updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    const [updatedProtocol] = await db
      .update(protocols)
      .set({ ...protocol, updatedAt: new Date() })
      .where(eq(protocols.id, id))
      .returning();
    return updatedProtocol || undefined;
  }

  async getProtocol(id: string): Promise<Protocol | undefined> {
    const [protocol] = await db.select().from(protocols).where(eq(protocols.id, id));
    return protocol || undefined;
  }

  async getProtocolsByClientId(clientId: string): Promise<Protocol[]> {
    return await db.select().from(protocols).where(eq(protocols.clientId, clientId));
  }

  async getAllProtocols(): Promise<Protocol[]> {
    return await db.select().from(protocols);
  }

  async deleteProtocol(id: string): Promise<boolean> {
    const result = await db.delete(protocols).where(eq(protocols.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Guides
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide as any).returning();
    return newGuide;
  }

  async updateGuide(id: string, guide: Partial<InsertGuide>): Promise<Guide | undefined> {
    const [updatedGuide] = await db
      .update(guides)
      .set({ ...guide, updatedAt: new Date() })
      .where(eq(guides.id, id))
      .returning();
    return updatedGuide || undefined;
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide || undefined;
  }

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides);
  }

  async getActiveGuides(): Promise<Guide[]> {
    return await db.select().from(guides).where(eq(guides.status, "open"));
  }

  async deleteGuide(id: string): Promise<boolean> {
    const result = await db.delete(guides).where(eq(guides.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Satisfaction Surveys
  async createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey> {
    const [newSurvey] = await db.insert(satisfactionSurveys).values(survey as any).returning();
    return newSurvey;
  }

  async getSatisfactionSurvey(id: string): Promise<SatisfactionSurvey | undefined> {
    const [survey] = await db.select().from(satisfactionSurveys).where(eq(satisfactionSurveys.id, id));
    return survey || undefined;
  }

  async getSatisfactionSurveysByClientId(clientId: string): Promise<SatisfactionSurvey[]> {
    return await db.select().from(satisfactionSurveys).where(eq(satisfactionSurveys.clientId, clientId));
  }

  async getAllSatisfactionSurveys(): Promise<SatisfactionSurvey[]> {
    return await db.select().from(satisfactionSurveys);
  }

  // Species
  async getSpecies(): Promise<Species[]> {
    return await db.select()
      .from(species)
      .where(eq(species.isActive, true))
      .orderBy(asc(species.displayOrder));
  }

  async getAllSpecies(): Promise<Species[]> {
    return await db.select()
      .from(species)
      .orderBy(asc(species.displayOrder));
  }

  async getActiveSpecies(): Promise<Species[]> {
    return await this.getSpecies();
  }

  async createSpecies(speciesData: InsertSpecies): Promise<Species> {
    const [newSpecies] = await db.insert(species).values(speciesData as any).returning();
    return newSpecies;
  }

  async updateSpecies(id: string, speciesData: Partial<InsertSpecies>): Promise<Species | undefined> {
    const [updatedSpecies] = await db
      .update(species)
      .set({ ...speciesData, updatedAt: new Date() })
      .where(eq(species.id, id))
      .returning();
    return updatedSpecies || undefined;
  }

  async deleteSpecies(id: string): Promise<boolean> {
    const result = await db.delete(species).where(eq(species.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Payment Receipts
  async createPaymentReceipt(receipt: any): Promise<any> {
    const [newReceipt] = await db.insert(paymentReceipts).values(receipt as any).returning();
    return newReceipt;
  }

  async getPaymentReceiptById(id: string): Promise<any | undefined> {
    const [receipt] = await db.select().from(paymentReceipts).where(eq(paymentReceipts.id, id));
    return receipt || undefined;
  }

  async getPaymentReceiptsByClientEmail(clientEmail: string): Promise<any[]> {
    return await db.select().from(paymentReceipts)
      .where(eq(paymentReceipts.clientEmail, clientEmail))
      .orderBy(desc(paymentReceipts.createdAt));
  }

  async getPaymentReceiptsByContractId(contractId: string): Promise<any[]> {
    return await db.select().from(paymentReceipts)
      .where(eq(paymentReceipts.contractId, contractId))
      .orderBy(desc(paymentReceipts.createdAt));
  }

  async updatePaymentReceiptStatus(id: string, status: 'generated' | 'downloaded' | 'sent'): Promise<any | undefined> {
    const [updatedReceipt] = await db
      .update(paymentReceipts)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentReceipts.id, id))
      .returning();
    return updatedReceipt || undefined;
  }

  // ✅ IDEMPOTÊNCIA: Buscar recibo por cieloPaymentId para evitar duplicatas
  async getPaymentReceiptByCieloPaymentId(cieloPaymentId: string): Promise<any | undefined> {
    const [receipt] = await db.select().from(paymentReceipts)
      .where(eq(paymentReceipts.cieloPaymentId, cieloPaymentId));
    return receipt || undefined;
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user as any).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Missing interface methods implementation
  async getAllContactSubmissionsWithDateFilter(startDate?: string, endDate?: string): Promise<ContactSubmission[]> {
    let query = db.select().from(contactSubmissions);
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        query = (query as any).where(and(
          gte(contactSubmissions.createdAt, new Date(startDate)),
          lte(contactSubmissions.createdAt, new Date(endDate))
        ));
      } else if (startDate) {
        query = (query as any).where(gte(contactSubmissions.createdAt, new Date(startDate)));
      } else if (endDate) {
        query = (query as any).where(lte(contactSubmissions.createdAt, new Date(endDate)));
      }
    }
    
    return await query.orderBy(desc(contactSubmissions.createdAt));
  }

  async getAllClientsWithDateFilter(startDate?: string, endDate?: string): Promise<Client[]> {
    let query = db.select().from(clients);
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        query = (query as any).where(and(
          gte(clients.createdAt, new Date(startDate)),
          lte(clients.createdAt, new Date(endDate))
        ));
      } else if (startDate) {
        query = (query as any).where(gte(clients.createdAt, new Date(startDate)));
      } else if (endDate) {
        query = (query as any).where(lte(clients.createdAt, new Date(endDate)));
      }
    }
    
    return await query.orderBy(desc(clients.createdAt));
  }

  async searchClients(query: string): Promise<Client[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(clients)
      .where(
        sql`LOWER(${clients.fullName}) LIKE ${searchTerm} OR 
            LOWER(${clients.email}) LIKE ${searchTerm} OR 
            ${clients.phone} LIKE ${searchTerm}`
      )
      .orderBy(desc(clients.createdAt));
  }

  async getAllPetsWithDateFilter(startDate?: string, endDate?: string): Promise<Pet[]> {
    let query = db.select().from(pets);
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        query = (query as any).where(and(
          gte(pets.createdAt, new Date(startDate)),
          lte(pets.createdAt, new Date(endDate))
        ));
      } else if (startDate) {
        query = (query as any).where(gte(pets.createdAt, new Date(startDate)));
      } else if (endDate) {
        query = (query as any).where(lte(pets.createdAt, new Date(endDate)));
      }
    }
    
    return await query.orderBy(desc(pets.createdAt));
  }

  async getAllGuidesWithDateFilter(startDate?: string, endDate?: string): Promise<Guide[]> {
    let query = db.select().from(guides);
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        query = (query as any).where(and(
          gte(guides.createdAt, new Date(startDate)),
          lte(guides.createdAt, new Date(endDate))
        ));
      } else if (startDate) {
        query = (query as any).where(gte(guides.createdAt, new Date(startDate)));
      } else if (endDate) {
        query = (query as any).where(lte(guides.createdAt, new Date(endDate)));
      }
    }
    
    return await query.orderBy(desc(guides.createdAt));
  }

  async getGuideById(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide || undefined;
  }

  async getGuidesWithNetworkUnits(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Guide[]; total: number; totalPages: number; page: number; }> {
    const { page = 1, limit = 10, search, status, type, startDate, endDate } = params;
    
    let query = db.select().from(guides);
    let conditions: any[] = [];
    
    if (search && search.trim()) {
      const searchTerm = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`LOWER(${guides.procedure}) LIKE ${searchTerm} OR 
            LOWER(${guides.procedureNotes}) LIKE ${searchTerm} OR 
            LOWER(${guides.generalNotes}) LIKE ${searchTerm}`
      );
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(guides.status, status));
    }
    
    if (type && type !== 'all') {
      conditions.push(eq(guides.type, type));
    }
    
    if (startDate) {
      conditions.push(gte(guides.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(guides.createdAt, new Date(endDate)));
    }
    
    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }
    
    // Get total count
    const totalQuery = await query;
    const total = totalQuery.length;
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const data = await query
      .orderBy(desc(guides.createdAt))
      .limit(limit)
      .offset(offset);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      totalPages,
      page
    };
  }

  // Chat Conversations - Removed (table no longer exists)
}

// Usar storage em memória se não houver banco de dados configurado
export const storage = autoConfig.get('DATABASE_URL')
  ? new DatabaseStorage()
  : new InMemoryStorage();