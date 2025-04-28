/**
 * @file adminServices.ts
 * @description Servicio que agrupa los routers del módulo de administración.
 */
import { Router } from 'express';
import dotenv from 'dotenv';
import authRouter from '../routes/auth.router';
import { AuthModel } from '../models/authModel';
import { VerificationModel } from '../models/verificationModel';

dotenv.config();

class AuthService {
    private router: Router;
    constructor() {
        this.router = Router();
        this.routes();
        this.dbConnect();

    }
 

    routes(): void { 
        console.log('[AuthService] Montando sub-routers...');
          this.router.use(authRouter);
 

    }
    async dbConnect() {
        try {
            await AuthModel.sync();
            await VerificationModel.sync();
            // await Country.sync();

            console.log('Modelos  sincronizados correctamente.');
        } catch (error) {
            console.error('Error al sincronizar los modelos :', error);
        }
    }
    getRouter(): Router { return this.router; }
    
   
}
export default AuthService;
 