import session from "express-session";
import { autoConfig } from "./config.js";
export function setupAuth(app) {
    const sessionSettings = {
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
export function requireAuth(req, res, next) {
    if (!req.session || !req.session.client) {
        return res.status(401).json({ error: "Acesso não autorizado" });
    }
    next();
}
// Middleware function for protecting admin routes
export function requireAdmin(req, res, next) {
    if (!req.session || !req.session.admin) {
        return res.status(401).json({ error: "Acesso administrativo não autorizado" });
    }
    next();
}
