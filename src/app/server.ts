/**
 * @file server.ts
 * @description Clase que representa el servidor de la aplicación con mejoras en CORS, compresión y caching para entornos de túnel.
 */
import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

import AuthService from '../features/auth/services/auth.service';
import ProfileServer from '../features/profiles/service/profileServer';
import AdminServer from '../features/admin/service/adminServer';
import updateStatusRouter from '../features/auth/routes/updateStatusRouter';
 import CampiAmigoService from '../features/campiamigo/service/campiamigo.service';
import UserService from '../features/users/service/user.service';

dotenv.config();

class Server {
  private app: Application;
  private port: string;

  private authService: AuthService;
  private profileServer: ProfileServer;
  private adminServer: AdminServer;
  private userService: UserService;
  private campiAmigoService: CampiAmigoService;
  constructor() {
    this.app = express();
    this.port = process.env.PORT || '3001';
 // Inicialización de servicios
 this.authService = new AuthService();
 this.profileServer = new ProfileServer();
 this.adminServer = new AdminServer();
 this.userService = new UserService();
 this.campiAmigoService = new CampiAmigoService();
    // 1. Compresión general de respuestas
    this.app.use(compression());

    // 2. Configuración Centralizada de CORS
    this.configureCors();

    // 3. Middlewares de parseo y estáticos
    this.middlewares();

    // 4. Definición de rutas
    this.routes();

    // 5. Inicio del servidor
    this.listen();
  }

  /** Configura CORS de forma centralizada con soporte de comodines en dev */
  private configureCors(): void {
    const raw = process.env.ALLOWED_ORIGINS || '';
    const allowed = raw.split(',').map(o => o.trim()).filter(Boolean);

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Permitir sin origen (p.ej. herramientas CLI o plugins de VS Code)
        if (!origin) return callback(null, true);

        // Match exacto o wildcard (*) en dev
        const match = allowed.some(pattern => {
          if (pattern === '*') return true;
          // Convertir a regex si tiene comodín
          if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            return regex.test(origin);
          }
          return origin === pattern;
        });

        if (match) {
          return callback(null, true);
        }
        console.warn(`[CORS] Origen no permitido: ${origin}`);
        callback(new Error('No permitido por CORS'));
      },
      credentials: true,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));
  }

  /** Middlewares globales: JSON, URL-encoded y estáticos con cache */
  private middlewares(): void {
    // Parseo body
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    // Servir uploads con caching y rutas absolutas
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    this.app.use(
      '/uploads',
      express.static(uploadsPath, {
         etag: true,
      })
    );
  }

  /** Define las rutas de la aplicación */
  private routes(): void {
    this.app.use('/auth/user', this.authService.getRouter());
    this.app.use('/user/profile', this.profileServer.getRouter());
    this.app.use('/user/admin', this.adminServer.getRouter());
    this.app.use('/auth/user/updateStatus', updateStatusRouter);
    this.app.use(this.userService.getRouter());
    this.app.use(this.campiAmigoService.getRouter());
    // Ruta de prueba para verificar CORS
    this.app.get('/test-cors', (_req: Request, res: Response) => {
      res.json({ msg: 'CORS funciona correctamente' });
    });
  }

  /** Inicia el servidor en el puerto configurado */
  private listen(): void {
    this.app.listen(this.port, () => {
      console.log(`[Server] Iniciando en puerto ${this.port} - ${new Date().toISOString()}`);
    });
  }
}

export default Server;

console.log(`Inicializando Server.ts – entorno: ${process.env.NODE_ENV || 'development'}`);
