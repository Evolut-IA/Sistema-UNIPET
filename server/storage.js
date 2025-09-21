import { contactSubmissions, plans, networkUnits, faqItems, siteSettings, chatSettings, clients, species, pets, contracts, procedures, planProcedures, serviceHistory, protocols, guides, satisfactionSurveys, paymentReceipts, users } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, asc, and, sql, gte, lte } from "drizzle-orm";
import { autoConfig } from "./config.js";
export class InMemoryStorage {
    // Chat conversations removed
    constructor() {
        this.contactSubmissions = [];
        this.plans = [];
        this.networkUnits = [];
        this.faqItems = [];
        this.clients = [];
        this.users = [];
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
    async createContactSubmission(submission) {
        const newSubmission = {
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
    async getContactSubmissions() {
        return this.contactSubmissions;
    }
    async getAllContactSubmissions() {
        return this.contactSubmissions;
    }
    async deleteContactSubmission(id) {
        const index = this.contactSubmissions.findIndex(s => s.id === id);
        if (index > -1) {
            this.contactSubmissions.splice(index, 1);
            return true;
        }
        return false;
    }
    async getPlans() {
        return this.plans.filter(p => p.isActive);
    }
    async getAllPlans() {
        return this.plans;
    }
    async getAllActivePlans() {
        return this.plans.filter(p => p.isActive);
    }
    async getPlan(id) {
        return this.plans.find(p => p.id === id);
    }
    async createPlan(plan) {
        const newPlan = {
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
    async updatePlan(id, plan) {
        const index = this.plans.findIndex(p => p.id === id);
        if (index > -1) {
            this.plans[index] = { ...this.plans[index], ...plan };
            return this.plans[index];
        }
        return undefined;
    }
    async deletePlan(id) {
        const index = this.plans.findIndex(p => p.id === id);
        if (index > -1) {
            this.plans.splice(index, 1);
            return true;
        }
        return false;
    }
    async getNetworkUnits() {
        return this.networkUnits.filter(u => u.isActive);
    }
    async getAllNetworkUnits() {
        return this.networkUnits;
    }
    async getAllActiveNetworkUnits() {
        return this.networkUnits.filter(u => u.isActive);
    }
    async getNetworkUnit(id) {
        return this.networkUnits.find(u => u.id === id);
    }
    async createNetworkUnit(insertUnit) {
        const newUnit = {
            id: Math.random().toString(36).substr(2, 9),
            name: insertUnit.name,
            address: insertUnit.address,
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
    async updateNetworkUnit(id, unit) {
        const index = this.networkUnits.findIndex(u => u.id === id);
        if (index > -1) {
            this.networkUnits[index] = { ...this.networkUnits[index], ...unit };
            return this.networkUnits[index];
        }
        return undefined;
    }
    async deleteNetworkUnit(id) {
        const index = this.networkUnits.findIndex(u => u.id === id);
        if (index > -1) {
            this.networkUnits.splice(index, 1);
            return true;
        }
        return false;
    }
    async getFaqItems() {
        return this.faqItems.filter(f => f.isActive);
    }
    async getAllFaqItems() {
        return this.faqItems;
    }
    async getFaqItem(id) {
        return this.faqItems.find(f => f.id === id);
    }
    async createFaqItem(item) {
        const newItem = {
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
    async updateFaqItem(id, item) {
        const index = this.faqItems.findIndex(f => f.id === id);
        if (index > -1) {
            this.faqItems[index] = { ...this.faqItems[index], ...item };
            return this.faqItems[index];
        }
        return undefined;
    }
    async deleteFaqItem(id) {
        const index = this.faqItems.findIndex(f => f.id === id);
        if (index > -1) {
            this.faqItems.splice(index, 1);
            return true;
        }
        return false;
    }
    async getSiteSettings() {
        return this.siteSettings;
    }
    async updateSiteSettings(settings) {
        if (this.siteSettings) {
            const updatedSettings = { ...this.siteSettings, ...settings, updatedAt: new Date() };
            // Ensure Buffer types are preserved
            if (settings.mainImage !== undefined)
                updatedSettings.mainImage = settings.mainImage || Buffer.alloc(0);
            if (settings.networkImage !== undefined)
                updatedSettings.networkImage = settings.networkImage || Buffer.alloc(0);
            if (settings.aboutImage !== undefined)
                updatedSettings.aboutImage = settings.aboutImage || Buffer.alloc(0);
            this.siteSettings = updatedSettings;
            return this.siteSettings;
        }
        return undefined;
    }
    // Chat Settings methods
    async getChatSettings() {
        return this.chatSettings;
    }
    async updateChatSettings(settings) {
        if (this.chatSettings) {
            const updatedSettings = { ...this.chatSettings, ...settings, updatedAt: new Date() };
            // Ensure Buffer types are preserved
            if (settings.botIcon !== undefined)
                updatedSettings.botIcon = settings.botIcon || Buffer.alloc(0);
            if (settings.userIcon !== undefined)
                updatedSettings.userIcon = settings.userIcon || Buffer.alloc(0);
            this.chatSettings = updatedSettings;
            return this.chatSettings;
        }
        return undefined;
    }
    async createDefaultChatSettings() {
        const defaultSettings = {
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
    async getClientByEmail(email) {
        return this.clients.find(c => c.email === email);
    }
    async getClientById(id) {
        return this.clients.find(c => c.id === id);
    }
    async createClient(client) {
        const newClient = {
            id: `client-${Date.now()}`,
            full_name: client.full_name,
            fullName: client.full_name,
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
            image: client.image || null,
            imageUrl: client.imageUrl || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.clients.push(newClient);
        return newClient;
    }
    async updateClient(id, client) {
        const index = this.clients.findIndex(c => c.id === id);
        if (index > -1) {
            this.clients[index] = { ...this.clients[index], ...client, updatedAt: new Date() };
            return this.clients[index];
        }
        return undefined;
    }
    async deleteClient(id) {
        const index = this.clients.findIndex(c => c.id === id);
        if (index > -1) {
            this.clients.splice(index, 1);
            return true;
        }
        return false;
    }
    async getAllClients() {
        return this.clients;
    }
    // === NEW TABLE STUB IMPLEMENTATIONS ===
    // These are stub implementations for InMemoryStorage - not used in production
    // Pets
    async createPet(pet) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async updatePet(id, pet) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async getPet(id) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async getPetsByClientId(clientId) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async deletePet(id) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async getAllPets() {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    // Contracts
    async createContract(contract) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async updateContract(id, contract) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async getContract(id) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async getContractsByClientId(clientId) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async getContractsByPetId(petId) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async getContractByCieloPaymentId(cieloPaymentId) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async deleteContract(id) {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    async getAllContracts() {
        throw new Error('InMemoryStorage: Contracts not implemented');
    }
    // Procedures
    async createProcedure(procedure) {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async updateProcedure(id, procedure) {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async getProcedure(id) {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async getAllProcedures() {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async getActiveProcedures() {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async getProceduresWithCoparticipation(planId) {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    async deleteProcedure(id) {
        throw new Error('InMemoryStorage: Procedures not implemented');
    }
    // Plan Procedures
    async createPlanProcedure(planProcedure) {
        throw new Error('InMemoryStorage: PlanProcedures not implemented');
    }
    async getPlanProcedures(planId) {
        throw new Error('InMemoryStorage: PlanProcedures not implemented');
    }
    async deletePlanProcedure(planId, procedureId) {
        throw new Error('InMemoryStorage: PlanProcedures not implemented');
    }
    async getAllPlanProcedures() {
        throw new Error('InMemoryStorage: PlanProcedures not implemented');
    }
    // Service History
    async createServiceHistory(serviceHistoryData) {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    async updateServiceHistory(id, serviceHistoryData) {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    async getServiceHistory(id) {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    async getServiceHistoryByContractId(contractId) {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    async getServiceHistoryByPetId(petId) {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    async getAllServiceHistory() {
        throw new Error('InMemoryStorage: ServiceHistory not implemented');
    }
    // Protocols
    async createProtocol(protocol) {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    async updateProtocol(id, protocol) {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    async getProtocol(id) {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    async getProtocolsByClientId(clientId) {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    async getAllProtocols() {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    async deleteProtocol(id) {
        throw new Error('InMemoryStorage: Protocols not implemented');
    }
    // Guides
    async createGuide(guide) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async updateGuide(id, guide) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async getGuide(id) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async getAllGuides() {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async getActiveGuides() {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async deleteGuide(id) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    // Satisfaction Surveys
    async createSatisfactionSurvey(survey) {
        throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
    }
    async getSatisfactionSurvey(id) {
        throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
    }
    async getSatisfactionSurveysByClientId(clientId) {
        throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
    }
    async getAllSatisfactionSurveys() {
        throw new Error('InMemoryStorage: SatisfactionSurveys not implemented');
    }
    // Species
    async getSpecies() {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    async getAllSpecies() {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    async getActiveSpecies() {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    async createSpecies(species) {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    async updateSpecies(id, species) {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    async deleteSpecies(id) {
        throw new Error('InMemoryStorage: Species not implemented');
    }
    // Payment Receipts methods
    async getPaymentReceiptsByClientEmail(email) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    async getPaymentReceiptsByContractId(contractId) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    async getPaymentReceiptById(id) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    async updatePaymentReceiptStatus(id, status) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    async createPaymentReceipt(receipt) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    async getPaymentReceiptByCieloPaymentId(cieloPaymentId) {
        throw new Error('InMemoryStorage: Payment receipts not implemented');
    }
    // Users
    async getAllUsers() {
        return this.users;
    }
    async getUserById(id) {
        return this.users.find(user => user.id === id);
    }
    async getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }
    async getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }
    async createUser(user) {
        const newUser = {
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
    async updateUser(id, user) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1)
            return undefined;
        this.users[index] = { ...this.users[index], ...user };
        return this.users[index];
    }
    async deleteUser(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index === -1)
            return false;
        this.users.splice(index, 1);
        return true;
    }
    // Missing interface methods implementation
    async getAllContactSubmissionsWithDateFilter(startDate, endDate) {
        return this.contactSubmissions;
    }
    async getAllClientsWithDateFilter(startDate, endDate) {
        return this.clients;
    }
    async searchClients(query) {
        return this.clients.filter(client => client.full_name?.toLowerCase().includes(query.toLowerCase()) ||
            client.email.toLowerCase().includes(query.toLowerCase()) ||
            client.phone?.includes(query));
    }
    async getAllPetsWithDateFilter(startDate, endDate) {
        throw new Error('InMemoryStorage: Pets not implemented');
    }
    async getAllGuidesWithDateFilter(startDate, endDate) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async getGuideById(id) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
    async getGuidesWithNetworkUnits(params) {
        throw new Error('InMemoryStorage: Guides not implemented');
    }
}
export class DatabaseStorage {
    constructor() {
        // Session management now uses MemoryStore via express-session
    }
    // Contact Submissions
    async createContactSubmission(insertSubmission) {
        const [submission] = await db.insert(contactSubmissions).values(insertSubmission).returning();
        return submission;
    }
    async getContactSubmissions() {
        return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    }
    async getAllContactSubmissions() {
        return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    }
    async deleteContactSubmission(id) {
        const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Plans
    async getPlans() {
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
        }
        catch (error) {
            console.error("Error in getPlans:", error);
            throw error;
        }
    }
    async getAllPlans() {
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
        }
        catch (error) {
            console.error("Error in getAllPlans:", error);
            throw error;
        }
    }
    async getAllActivePlans() {
        return await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));
    }
    async getPlan(id) {
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
        }
        catch (error) {
            console.error("Error in getPlan:", error);
            throw error;
        }
    }
    async createPlan(insertPlan) {
        const [plan] = await db.insert(plans).values(insertPlan).returning();
        return plan;
    }
    async updatePlan(id, updateData) {
        const [plan] = await db.update(plans).set(updateData).where(eq(plans.id, id)).returning();
        return plan || undefined;
    }
    async deletePlan(id) {
        const result = await db.delete(plans).where(eq(plans.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Network Units
    async getNetworkUnits() {
        return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true));
    }
    async getAllNetworkUnits() {
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
        }
        catch (error) {
            console.error("❌ [STORAGE] Error fetching network units:", error);
            throw error;
        }
    }
    async getAllActiveNetworkUnits() {
        return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true)).orderBy(desc(networkUnits.createdAt));
    }
    async getNetworkUnit(id) {
        const [unit] = await db.select().from(networkUnits).where(eq(networkUnits.id, id));
        return unit || undefined;
    }
    async createNetworkUnit(insertUnit) {
        const [unit] = await db.insert(networkUnits).values(insertUnit).returning();
        return unit;
    }
    async updateNetworkUnit(id, updateData) {
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('Update data cannot be empty');
        }
        const [unit] = await db.update(networkUnits).set(updateData).where(eq(networkUnits.id, id)).returning();
        return unit || undefined;
    }
    async deleteNetworkUnit(id) {
        const result = await db.delete(networkUnits).where(eq(networkUnits.id, id));
        return (result.rowCount || 0) > 0;
    }
    // FAQ Items
    async getFaqItems() {
        return await db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.displayOrder));
    }
    async getAllFaqItems() {
        return await db.select().from(faqItems).orderBy(asc(faqItems.displayOrder));
    }
    async getFaqItem(id) {
        const [item] = await db.select().from(faqItems).where(eq(faqItems.id, id));
        return item || undefined;
    }
    async createFaqItem(insertItem) {
        const [item] = await db.insert(faqItems).values(insertItem).returning();
        return item;
    }
    async updateFaqItem(id, updateData) {
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('Update data cannot be empty');
        }
        const [item] = await db.update(faqItems).set(updateData).where(eq(faqItems.id, id)).returning();
        return item || undefined;
    }
    async deleteFaqItem(id) {
        const result = await db.delete(faqItems).where(eq(faqItems.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Site Settings
    async getSiteSettings() {
        const [settings] = await db.select().from(siteSettings).limit(1);
        return settings || undefined;
    }
    async updateSiteSettings(updateData) {
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('Update data cannot be empty');
        }
        // Filter only null and undefined values, but allow empty strings (to enable field clearing)
        const filteredUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => {
            // Keep if not null/undefined - allow empty strings
            return value !== null && value !== undefined;
        }));
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
        }
        else {
            const [settings] = await db.insert(siteSettings)
                .values({ ...filteredUpdateData, createdAt: new Date(), updatedAt: new Date() })
                .returning();
            console.log('🔍 [STORAGE] Created new settings:', settings);
            return settings;
        }
    }
    // Chat Settings
    async getChatSettings() {
        try {
            const [settings] = await db.select().from(chatSettings).limit(1);
            return settings || undefined;
        }
        catch (error) {
            console.error('Error fetching chat settings:', error);
            return undefined;
        }
    }
    async updateChatSettings(updateData) {
        try {
            if (!updateData || Object.keys(updateData).length === 0) {
                throw new Error('Update data cannot be empty');
            }
            const current = await this.getChatSettings();
            if (current) {
                // Convert string Buffer fields to actual Buffers if needed
                const convertedData = { ...updateData, updatedAt: new Date() };
                if (updateData.botIcon !== undefined && typeof updateData.botIcon === 'string') {
                    convertedData.botIcon = Buffer.from(updateData.botIcon, 'base64');
                }
                if (updateData.userIcon !== undefined && typeof updateData.userIcon === 'string') {
                    convertedData.userIcon = Buffer.from(updateData.userIcon, 'base64');
                }
                const [updated] = await db
                    .update(chatSettings)
                    .set(convertedData)
                    .where(eq(chatSettings.id, current.id))
                    .returning();
                return updated;
            }
            else {
                return this.createDefaultChatSettings();
            }
        }
        catch (error) {
            console.error('Error updating chat settings:', error);
            throw error;
        }
    }
    async createDefaultChatSettings() {
        try {
            const defaultData = {
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
            const [created] = await db.insert(chatSettings).values(defaultData).returning();
            return created;
        }
        catch (error) {
            console.error('Error creating default chat settings:', error);
            throw error;
        }
    }
    // Clients
    async getClientByEmail(email) {
        try {
            const [client] = await db
                .select()
                .from(clients)
                .where(eq(clients.email, email))
                .limit(1);
            return client;
        }
        catch (error) {
            console.error('❌ Error fetching client by email:', error);
            return undefined;
        }
    }
    async getClientById(id) {
        try {
            const [client] = await db
                .select()
                .from(clients)
                .where(eq(clients.id, id))
                .limit(1);
            return client;
        }
        catch (error) {
            console.error('❌ Error fetching client by id:', error);
            return undefined;
        }
    }
    async createClient(client) {
        const [newClient] = await db
            .insert(clients)
            .values(client)
            .returning();
        return newClient;
    }
    async updateClient(id, client) {
        try {
            const [updatedClient] = await db
                .update(clients)
                .set({ ...client, updatedAt: new Date() })
                .where(eq(clients.id, id))
                .returning();
            return updatedClient;
        }
        catch (error) {
            console.error('❌ Error updating client:', error);
            return undefined;
        }
    }
    async deleteClient(id) {
        try {
            const result = await db
                .delete(clients)
                .where(eq(clients.id, id));
            return (result.rowCount || 0) > 0;
        }
        catch (error) {
            console.error('❌ Error deleting client:', error);
            return false;
        }
    }
    async getAllClients() {
        try {
            const clientsList = await db.select().from(clients);
            return clientsList;
        }
        catch (error) {
            console.error('❌ Error fetching all clients:', error);
            return [];
        }
    }
    // === NEW TABLE IMPLEMENTATIONS ===
    // Pets
    async createPet(pet) {
        const [newPet] = await db.insert(pets).values(pet).returning();
        return newPet;
    }
    async updatePet(id, pet) {
        const [updatedPet] = await db
            .update(pets)
            .set({ ...pet, updatedAt: new Date() })
            .where(eq(pets.id, id))
            .returning();
        return updatedPet || undefined;
    }
    async getPet(id) {
        const [pet] = await db.select().from(pets).where(eq(pets.id, id));
        return pet || undefined;
    }
    async getPetsByClientId(clientId) {
        return await db.select().from(pets).where(eq(pets.clientId, clientId));
    }
    async deletePet(id) {
        const result = await db.delete(pets).where(eq(pets.id, id));
        return (result.rowCount || 0) > 0;
    }
    async getAllPets() {
        return await db.select().from(pets);
    }
    // Contracts
    async createContract(contract) {
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
            ...(contract.proofOfSale !== undefined && { proofOfSale: contract.proofOfSale }),
            ...(contract.authorizationCode !== undefined && { authorizationCode: contract.authorizationCode }),
            ...(contract.tid !== undefined && { tid: contract.tid }),
            ...(contract.receivedDate !== undefined && { receivedDate: contract.receivedDate }),
            ...(contract.returnCode !== undefined && { returnCode: contract.returnCode }),
            ...(contract.returnMessage !== undefined && { returnMessage: contract.returnMessage }),
            ...(contract.pixQrCode !== undefined && { pixQrCode: contract.pixQrCode }),
            ...(contract.pixCode !== undefined && { pixCode: contract.pixCode })
        };
        console.log("🔍 [STORAGE-DEBUG] Payload mapeado para Drizzle:", JSON.stringify(payload, null, 2));
        const [newContract] = await db.insert(contracts).values(payload).returning();
        return newContract;
    }
    async updateContract(id, contract) {
        const [updatedContract] = await db
            .update(contracts)
            .set({ ...contract, updatedAt: new Date() })
            .where(eq(contracts.id, id))
            .returning();
        return updatedContract || undefined;
    }
    async getContract(id) {
        const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
        return contract || undefined;
    }
    async getContractsByClientId(clientId) {
        return await db.select().from(contracts).where(eq(contracts.clientId, clientId));
    }
    async getContractsByPetId(petId) {
        return await db.select().from(contracts).where(eq(contracts.petId, petId));
    }
    async getContractByCieloPaymentId(cieloPaymentId) {
        const [contract] = await db.select().from(contracts).where(eq(contracts.cieloPaymentId, cieloPaymentId));
        return contract || undefined;
    }
    async deleteContract(id) {
        const result = await db.delete(contracts).where(eq(contracts.id, id));
        return (result.rowCount || 0) > 0;
    }
    async getAllContracts() {
        return await db.select().from(contracts);
    }
    // Procedures
    async createProcedure(procedure) {
        const [newProcedure] = await db.insert(procedures).values(procedure).returning();
        return newProcedure;
    }
    async updateProcedure(id, procedure) {
        const [updatedProcedure] = await db
            .update(procedures)
            .set({ ...procedure, updatedAt: new Date() })
            .where(eq(procedures.id, id))
            .returning();
        return updatedProcedure || undefined;
    }
    async getProcedure(id) {
        const [procedure] = await db.select().from(procedures).where(eq(procedures.id, id));
        return procedure || undefined;
    }
    async getAllProcedures() {
        return await db.select().from(procedures);
    }
    async getActiveProcedures() {
        return await db.select().from(procedures).where(eq(procedures.isActive, true));
    }
    // Get procedures with real coparticipation data from plan_procedures
    async getProceduresWithCoparticipation(planId) {
        try {
            if (planId) {
                // Get procedures for specific plan using raw SQL to access correct column names
                const result = await db.execute(sql `
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
            }
            else {
                // Get all distinct procedures (avoiding duplicates from plan relationships)
                const result = await db.execute(sql `
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
        }
        catch (error) {
            console.error('❌ Error fetching procedures with coparticipation:', error);
            return [];
        }
    }
    async deleteProcedure(id) {
        const result = await db.delete(procedures).where(eq(procedures.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Plan Procedures
    async createPlanProcedure(planProcedure) {
        const [newPlanProcedure] = await db.insert(planProcedures).values(planProcedure).returning();
        return newPlanProcedure;
    }
    async getPlanProcedures(planId) {
        return await db.select().from(planProcedures).where(eq(planProcedures.planId, planId));
    }
    async deletePlanProcedure(planId, procedureId) {
        const result = await db
            .delete(planProcedures)
            .where(eq(planProcedures.planId, planId) && eq(planProcedures.procedureId, procedureId));
        return (result.rowCount || 0) > 0;
    }
    async getAllPlanProcedures() {
        return await db.select().from(planProcedures);
    }
    // Service History
    async createServiceHistory(serviceHistoryData) {
        const [newServiceHistory] = await db.insert(serviceHistory).values(serviceHistoryData).returning();
        return newServiceHistory;
    }
    async updateServiceHistory(id, serviceHistoryData) {
        const [updatedServiceHistory] = await db
            .update(serviceHistory)
            .set({ ...serviceHistoryData, updatedAt: new Date() })
            .where(eq(serviceHistory.id, id))
            .returning();
        return updatedServiceHistory || undefined;
    }
    async getServiceHistory(id) {
        const [history] = await db.select().from(serviceHistory).where(eq(serviceHistory.id, id));
        return history || undefined;
    }
    async getServiceHistoryByContractId(contractId) {
        return await db.select().from(serviceHistory).where(eq(serviceHistory.contractId, contractId));
    }
    async getServiceHistoryByPetId(petId) {
        return await db.select().from(serviceHistory).where(eq(serviceHistory.petId, petId));
    }
    async getAllServiceHistory() {
        return await db.select().from(serviceHistory);
    }
    // Protocols
    async createProtocol(protocol) {
        const [newProtocol] = await db.insert(protocols).values(protocol).returning();
        return newProtocol;
    }
    async updateProtocol(id, protocol) {
        const [updatedProtocol] = await db
            .update(protocols)
            .set({ ...protocol, updatedAt: new Date() })
            .where(eq(protocols.id, id))
            .returning();
        return updatedProtocol || undefined;
    }
    async getProtocol(id) {
        const [protocol] = await db.select().from(protocols).where(eq(protocols.id, id));
        return protocol || undefined;
    }
    async getProtocolsByClientId(clientId) {
        return await db.select().from(protocols).where(eq(protocols.clientId, clientId));
    }
    async getAllProtocols() {
        return await db.select().from(protocols);
    }
    async deleteProtocol(id) {
        const result = await db.delete(protocols).where(eq(protocols.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Guides
    async createGuide(guide) {
        const [newGuide] = await db.insert(guides).values(guide).returning();
        return newGuide;
    }
    async updateGuide(id, guide) {
        const [updatedGuide] = await db
            .update(guides)
            .set({ ...guide, updatedAt: new Date() })
            .where(eq(guides.id, id))
            .returning();
        return updatedGuide || undefined;
    }
    async getGuide(id) {
        const [guide] = await db.select().from(guides).where(eq(guides.id, id));
        return guide || undefined;
    }
    async getAllGuides() {
        return await db.select().from(guides);
    }
    async getActiveGuides() {
        return await db.select().from(guides).where(eq(guides.status, "open"));
    }
    async deleteGuide(id) {
        const result = await db.delete(guides).where(eq(guides.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Satisfaction Surveys
    async createSatisfactionSurvey(survey) {
        const [newSurvey] = await db.insert(satisfactionSurveys).values(survey).returning();
        return newSurvey;
    }
    async getSatisfactionSurvey(id) {
        const [survey] = await db.select().from(satisfactionSurveys).where(eq(satisfactionSurveys.id, id));
        return survey || undefined;
    }
    async getSatisfactionSurveysByClientId(clientId) {
        return await db.select().from(satisfactionSurveys).where(eq(satisfactionSurveys.clientId, clientId));
    }
    async getAllSatisfactionSurveys() {
        return await db.select().from(satisfactionSurveys);
    }
    // Species
    async getSpecies() {
        return await db.select()
            .from(species)
            .where(eq(species.isActive, true))
            .orderBy(asc(species.displayOrder));
    }
    async getAllSpecies() {
        return await db.select()
            .from(species)
            .orderBy(asc(species.displayOrder));
    }
    async getActiveSpecies() {
        return await this.getSpecies();
    }
    async createSpecies(speciesData) {
        const [newSpecies] = await db.insert(species).values(speciesData).returning();
        return newSpecies;
    }
    async updateSpecies(id, speciesData) {
        const [updatedSpecies] = await db
            .update(species)
            .set({ ...speciesData, updatedAt: new Date() })
            .where(eq(species.id, id))
            .returning();
        return updatedSpecies || undefined;
    }
    async deleteSpecies(id) {
        const result = await db.delete(species).where(eq(species.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Payment Receipts
    async createPaymentReceipt(receipt) {
        const [newReceipt] = await db.insert(paymentReceipts).values(receipt).returning();
        return newReceipt;
    }
    async getPaymentReceiptById(id) {
        const [receipt] = await db.select().from(paymentReceipts).where(eq(paymentReceipts.id, id));
        return receipt || undefined;
    }
    async getPaymentReceiptsByClientEmail(clientEmail) {
        return await db.select().from(paymentReceipts)
            .where(eq(paymentReceipts.clientEmail, clientEmail))
            .orderBy(desc(paymentReceipts.createdAt));
    }
    async getPaymentReceiptsByContractId(contractId) {
        return await db.select().from(paymentReceipts)
            .where(eq(paymentReceipts.contractId, contractId))
            .orderBy(desc(paymentReceipts.createdAt));
    }
    async updatePaymentReceiptStatus(id, status) {
        const [updatedReceipt] = await db
            .update(paymentReceipts)
            .set({ status, updatedAt: new Date() })
            .where(eq(paymentReceipts.id, id))
            .returning();
        return updatedReceipt || undefined;
    }
    // ✅ IDEMPOTÊNCIA: Buscar recibo por cieloPaymentId para evitar duplicatas
    async getPaymentReceiptByCieloPaymentId(cieloPaymentId) {
        const [receipt] = await db.select().from(paymentReceipts)
            .where(eq(paymentReceipts.cieloPaymentId, cieloPaymentId));
        return receipt || undefined;
    }
    // Users
    async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
    }
    async getUserById(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async createUser(user) {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
    }
    async updateUser(id, user) {
        const [updatedUser] = await db
            .update(users)
            .set(user)
            .where(eq(users.id, id))
            .returning();
        return updatedUser || undefined;
    }
    async deleteUser(id) {
        const result = await db.delete(users).where(eq(users.id, id));
        return (result.rowCount || 0) > 0;
    }
    // Missing interface methods implementation
    async getAllContactSubmissionsWithDateFilter(startDate, endDate) {
        let query = db.select().from(contactSubmissions);
        if (startDate || endDate) {
            if (startDate && endDate) {
                query = query.where(and(gte(contactSubmissions.createdAt, new Date(startDate)), lte(contactSubmissions.createdAt, new Date(endDate))));
            }
            else if (startDate) {
                query = query.where(gte(contactSubmissions.createdAt, new Date(startDate)));
            }
            else if (endDate) {
                query = query.where(lte(contactSubmissions.createdAt, new Date(endDate)));
            }
        }
        return await query.orderBy(desc(contactSubmissions.createdAt));
    }
    async getAllClientsWithDateFilter(startDate, endDate) {
        let query = db.select().from(clients);
        if (startDate || endDate) {
            if (startDate && endDate) {
                query = query.where(and(gte(clients.createdAt, new Date(startDate)), lte(clients.createdAt, new Date(endDate))));
            }
            else if (startDate) {
                query = query.where(gte(clients.createdAt, new Date(startDate)));
            }
            else if (endDate) {
                query = query.where(lte(clients.createdAt, new Date(endDate)));
            }
        }
        return await query.orderBy(desc(clients.createdAt));
    }
    async searchClients(query) {
        const searchTerm = `%${query.toLowerCase()}%`;
        return await db.select().from(clients)
            .where(sql `LOWER(${clients.fullName}) LIKE ${searchTerm} OR 
            LOWER(${clients.email}) LIKE ${searchTerm} OR 
            ${clients.phone} LIKE ${searchTerm}`)
            .orderBy(desc(clients.createdAt));
    }
    async getAllPetsWithDateFilter(startDate, endDate) {
        let query = db.select().from(pets);
        if (startDate || endDate) {
            if (startDate && endDate) {
                query = query.where(and(gte(pets.createdAt, new Date(startDate)), lte(pets.createdAt, new Date(endDate))));
            }
            else if (startDate) {
                query = query.where(gte(pets.createdAt, new Date(startDate)));
            }
            else if (endDate) {
                query = query.where(lte(pets.createdAt, new Date(endDate)));
            }
        }
        return await query.orderBy(desc(pets.createdAt));
    }
    async getAllGuidesWithDateFilter(startDate, endDate) {
        let query = db.select().from(guides);
        if (startDate || endDate) {
            if (startDate && endDate) {
                query = query.where(and(gte(guides.createdAt, new Date(startDate)), lte(guides.createdAt, new Date(endDate))));
            }
            else if (startDate) {
                query = query.where(gte(guides.createdAt, new Date(startDate)));
            }
            else if (endDate) {
                query = query.where(lte(guides.createdAt, new Date(endDate)));
            }
        }
        return await query.orderBy(desc(guides.createdAt));
    }
    async getGuideById(id) {
        const [guide] = await db.select().from(guides).where(eq(guides.id, id));
        return guide || undefined;
    }
    async getGuidesWithNetworkUnits(params) {
        const { page = 1, limit = 10, search, status, type, startDate, endDate } = params;
        let query = db.select().from(guides);
        let conditions = [];
        if (search && search.trim()) {
            const searchTerm = `%${search.toLowerCase()}%`;
            conditions.push(sql `LOWER(${guides.procedure}) LIKE ${searchTerm} OR 
            LOWER(${guides.procedureNotes}) LIKE ${searchTerm} OR 
            LOWER(${guides.generalNotes}) LIKE ${searchTerm}`);
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
            query = query.where(and(...conditions));
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
}
// Usar storage em memória se não houver banco de dados configurado
export const storage = autoConfig.get('DATABASE_URL')
    ? new DatabaseStorage()
    : new InMemoryStorage();
