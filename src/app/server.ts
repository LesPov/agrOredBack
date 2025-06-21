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


    // Trust proxy antes de CORS
    this.configureTrustProxy();

    // CORS y middlewares
    this.configureCors();
    this.configureMiddlewares();



    // 4. Definición de rutas
    this.routes();

    // 5. Inicio del servidor
    this.listen();
  }
  /**
     * Configura Express para que confíe en los encabezados del proxy.
     * Esencial para que req.protocol y req.get('host') funcionen correctamente detrás de un proxy.
     */
  private configureTrustProxy(): void {
    // '1' significa que confía en el primer proxy en la cadena (ej. tu Dev Tunnel).
    this.app.set('trust proxy', 1);
    console.log("[Server] Express 'trust proxy' configurado como 1.");
  }

  /** Configura CORS de forma centralizada con soporte de comodines en dev */
  private configureCors(): void {
    const rawOrigins = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(o => o); // Filtra vacíos

    console.log("[Server] Orígenes permitidos para CORS:", allowedOrigins);

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Permitir solicitudes sin 'origin' (como Postman o curl en algunos casos)
        if (!origin) return callback(null, true);

        // Si no hay orígenes configurados, permitir todo (considerar seguridad en producción)
        if (allowedOrigins.length === 0) return callback(null, true);

        const isAllowed = allowedOrigins.some(pattern => {
          if (pattern === '*') return true; // Comodín general
          if (pattern.startsWith('*.')) { // Comodín de subdominio
            const domain = pattern.substring(2);
            const regex = new RegExp(`^(https?:\/\/)?([a-zA-Z0-9-]+\.)*${domain.replace('.', '\\.')}$`);
            return regex.test(origin);
          }
          // Coincidencia exacta (incluyendo protocolo si está en el patrón)
          return origin === pattern;
        });

        if (isAllowed) {
          return callback(null, true);
        } else {
          console.warn(`[CORS] Origen no permitido: ${origin}`);
          return callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      optionsSuccessStatus: 200 // Para navegadores antiguos que pueden tener problemas con 204
    };
    this.app.use(cors(corsOptions));
    console.log("[Server] CORS configurado.");
  }

  /** Middlewares globales: JSON, URL-encoded y estáticos */
  private configureMiddlewares(): void {
    // Parseo de body JSON y URL-encoded con límite
    this.app.use(express.json({ limit: process.env.BODY_LIMIT || '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '50mb' }));
    console.log(`[Server] Middlewares de parseo de body configurados con límite: ${process.env.BODY_LIMIT || '50mb'}`);

    // Servir archivos estáticos desde la carpeta 'uploads' en la raíz del proyecto
    // La ruta /uploads en la URL mapeará a la carpeta PROJECT_ROOT/uploads
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    this.app.use(
      '/uploads', // La URL base para acceder a estos archivos
      express.static(uploadsPath, {
        etag: true, // Habilita ETags para caching del navegador
        // maxAge: '1d' // Opcional: Cachear por 1 día
      })
    );
    console.log(`[Server] Sirviendo archivos estáticos desde ${uploadsPath} en la ruta /uploads`);
  }


  /** Define las rutas de la aplicación */
  private routes(): void {
    this.app.use('/auth/user', this.authService.getRouter());
     this.app.use('/auth/user/updateStatus', updateStatusRouter);
    this.app.use(this.userService.getRouter());
    this.app.use(this.campiAmigoService.getRouter());
    // Ruta de prueba para verificar CORS
    this.app.get('/test-cors', (_req: Request, res: Response) => {
      res.json({ msg: 'CORS funciona correctamente' });
    });
    this.app.use(this.profileServer.getRouter());
    this.app.use('/user/admin', this.adminServer.getRouter());
    this.app.use(this.userService.getRouter());
    this.app.use(this.campiAmigoService.getRouter());
     
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
