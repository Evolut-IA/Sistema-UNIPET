import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Storage } from './storage.js';

interface UnitRequest extends Request {
  unit?: {
    unitId: string;
    slug: string;
  };
}

export function setupUnitRoutes(app: any, storage: Storage) {
  
  // Get unit info by slug (public)
  app.get("/api/network-units/:slug/info", async (req: Request, res: Response) => {
    try {
      const unit = await storage.getNetworkUnitBySlug(req.params.slug);
      if (!unit) {
        return res.status(404).json({ error: "Unidade não encontrada" });
      }
      res.json({ id: unit.id, name: unit.name });
    } catch (error) {
      console.error("❌ Error fetching unit info:", error);
      res.status(500).json({ error: "Erro ao buscar informações da unidade" });
    }
  });
  
  // Unit login
  app.post("/api/unit-auth/login", async (req: Request, res: Response) => {
    try {
      const { slug, login, password } = req.body;
      
      if (!slug || !login || !password) {
        return res.status(400).json({ error: "Dados incompletos" });
      }
      
      const unit = await storage.getNetworkUnitBySlug(slug);
      if (!unit) {
        return res.status(404).json({ error: "Unidade não encontrada" });
      }
      
      // Check credentials
      if (unit.login !== login) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, unit.senhaHash || '');
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { unitId: unit.id, slug: unit.urlSlug },
        process.env.SESSION_SECRET || 'unit-secret-key',
        { expiresIn: '8h' }
      );
      
      console.log(`✅ [UNIT-AUTH] Unit logged in: ${unit.name}`);
      res.json({ token, unitName: unit.name });
    } catch (error) {
      console.error("❌ [UNIT-AUTH] Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });
  
  // Middleware to verify unit authentication
  const requireUnitAuth = async (req: UnitRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Token não fornecido" });
      }
      
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'unit-secret-key') as any;
        req.unit = decoded;
        next();
      } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
      }
    } catch (error) {
      console.error("❌ [UNIT-AUTH] Auth middleware error:", error);
      res.status(500).json({ error: "Erro de autenticação" });
    }
  };
  
  // Get unit guides (authenticated)
  app.get("/api/unit/:slug/guides", requireUnitAuth, async (req: UnitRequest, res: Response) => {
    try {
      // For now, return mock data - will be implemented with actual guide data
      const guides = [
        {
          id: "1",
          guideNumber: "2025001",
          clientName: "João Silva",
          petName: "Rex",
          procedureType: "Consulta",
          status: "active",
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          guideNumber: "2025002",
          clientName: "Maria Santos",
          petName: "Luna",
          procedureType: "Vacina",
          status: "active",
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      res.json(guides);
    } catch (error) {
      console.error("❌ [UNIT] Error fetching guides:", error);
      res.status(500).json({ error: "Erro ao buscar guias" });
    }
  });
  
  // Get unit clients (authenticated)
  app.get("/api/unit/:slug/clients", requireUnitAuth, async (req: UnitRequest, res: Response) => {
    try {
      // For now, return mock data - will be implemented with actual client data
      const clients = [
        {
          id: "1",
          name: "João Silva",
          cpf: "123.456.789-00",
          phone: "(86) 99999-8888",
          email: "joao@example.com",
          address: "Rua A, 123",
          pets: [
            {
              id: "1",
              name: "Rex",
              species: "Cão",
              breed: "Labrador",
              birthDate: "2020-05-15",
              clientId: "1"
            }
          ]
        },
        {
          id: "2",
          name: "Maria Santos",
          cpf: "987.654.321-00",
          phone: "(86) 88888-7777",
          email: "maria@example.com",
          address: "Rua B, 456",
          pets: [
            {
              id: "2",
              name: "Luna",
              species: "Gato",
              breed: "Persa",
              birthDate: "2021-03-20",
              clientId: "2"
            },
            {
              id: "3",
              name: "Thor",
              species: "Cão",
              breed: "Pastor Alemão",
              birthDate: "2019-08-10",
              clientId: "2"
            }
          ]
        }
      ];
      res.json(clients);
    } catch (error) {
      console.error("❌ [UNIT] Error fetching clients:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });
  
  // Get unit procedures (authenticated)
  app.get("/api/unit/:slug/procedures", requireUnitAuth, async (req: UnitRequest, res: Response) => {
    try {
      // For now, return mock data - will be implemented with actual procedure data
      const procedures = [
        {
          id: "1",
          name: "Consulta Geral",
          description: "Consulta veterinária de rotina",
          price: 120,
          category: "Consultas",
          isActive: true
        },
        {
          id: "2",
          name: "Vacinação V10",
          description: "Vacina múltipla canina",
          price: 80,
          category: "Vacinas",
          isActive: true
        },
        {
          id: "3",
          name: "Castração",
          description: "Procedimento cirúrgico de castração",
          price: 350,
          category: "Cirurgias",
          isActive: true
        },
        {
          id: "4",
          name: "Hemograma Completo",
          description: "Exame de sangue completo",
          price: 150,
          category: "Exames",
          isActive: true
        }
      ];
      res.json(procedures);
    } catch (error) {
      console.error("❌ [UNIT] Error fetching procedures:", error);
      res.status(500).json({ error: "Erro ao buscar procedimentos" });
    }
  });
}