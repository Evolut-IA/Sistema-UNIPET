import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { autoConfig } from "./config.js";

// Session data interface for client authentication
declare module 'express-session' {
  interface SessionData {
    client?: any; // For client authentication
  }
}


export function setupAuth(app: Express) {

  const sessionSettings: session.SessionOptions = {
    secret: autoConfig.get('SESSION_SECRET'),
    resave: true,
    saveUninitialized: true, // Changed to true to ensure session is saved
    cookie: {
      secure: false, // Secure cookies disabled for local development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'connect.sid', // Explicitly set session name
    store: undefined // Use default memory store for development
  };

  // Remove trust proxy for local development
  // app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Session setup complete - admin routes removed as part of admin system cleanup
}

// Middleware function for protecting client routes (non-admin)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.client) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }
  next();
}