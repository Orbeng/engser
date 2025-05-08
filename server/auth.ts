import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@db";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

// Função para gerar hash de senha
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Função para comparar senha fornecida com a armazenada
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configurar armazenamento de sessão com PostgreSQL
  const PostgresStore = connectPgSimple(session);
  
  // Configurações da sessão
  const sessionSettings: session.SessionOptions = {
    store: new PostgresStore({
      pool,
      tableName: 'session', // Nome da tabela para sessões
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "session_secret_dev_only",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
      httpOnly: true,
      sameSite: 'strict'
    },
    name: 'sid' // Nome personalizado para o cookie (não usar o padrão 'connect.sid')
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configurar estratégia de autenticação local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Nome de usuário ou senha incorretos" });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          return done(null, false, { message: "Nome de usuário ou senha incorretos" });
        }
        
        // Atualizar último login
        await storage.updateUserLastLogin(user.id);
        
        return done(null, {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Configurar serialização e deserialização de usuário
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return done(null, false);
      }
      
      // Não incluir a senha no objeto do usuário
      const { password, ...userWithoutPassword } = user;
      
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Rota de registro
  app.post("/api/register", async (req, res) => {
    try {
      // Verificar se o usuário já existe
      const existingUser = await storage.getUserByUsername(req.body.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já está em uso" });
      }
      
      // Criar novo usuário com senha hash
      const hashedPassword = await hashPassword(req.body.password);
      
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Autenticar o novo usuário
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login após o registro" });
        }
        
        // Não incluir a senha na resposta
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  // Rota de login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Nome de usuário ou senha incorretos" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json(user);
      });
    })(req, res, next);
  });

  // Rota de logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });

  // Rota para obter usuário atual
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    res.json(req.user);
  });

  // Rota para solicitar redefinição de senha
  app.post("/api/reset-password-request", async (req, res) => {
    try {
      const { username } = req.body;
      
      // Buscar usuário
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Por razões de segurança, não informamos se o usuário existe ou não
        return res.json({ 
          message: "Se o usuário existir, você receberá instruções para redefinir sua senha." 
        });
      }
      
      // Gerar token de redefinição
      const token = randomBytes(20).toString("hex");
      
      // Definir expiração para 1 hora à frente
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);
      
      // Salvar o token no banco de dados
      await storage.storeResetToken(user.id, token, expiry);
      
      // Em ambiente de desenvolvimento, retornar o token para testes
      if (process.env.NODE_ENV !== "production") {
        return res.json({ 
          message: "Instruções para redefinição de senha enviadas",
          token
        });
      }
      
      // Em produção, enviaria o token por email
      res.json({ message: "Se o usuário existir, você receberá instruções para redefinir sua senha." });
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para redefinir senha
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // Buscar usuário pelo token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ 
          message: "Token inválido ou expirado" 
        });
      }
      
      // Verificar se o token expirou
      if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ 
          message: "Token expirado. Solicite uma nova redefinição de senha." 
        });
      }
      
      // Gerar hash da nova senha
      const hashedPassword = await hashPassword(newPassword);
      
      // Atualizar a senha e limpar o token
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearResetToken(user.id);
      
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });
}