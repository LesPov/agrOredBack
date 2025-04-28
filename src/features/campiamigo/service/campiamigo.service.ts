import dotenv from 'dotenv';
import campiAmigoRouter from '../routes/campiamigoRouter';
import { Router } from 'express';
 

dotenv.config();

class CampiAmigoService {
     private router: Router;
     constructor() {
         this.router = Router();
         this.routes();
         this.dbConnect();
 
     }
    routes(): void { 
        console.log('[AuthService] Montando sub-routers...');
           this.router.use(campiAmigoRouter);
 

    }
 

    async dbConnect() {
        try {
           

            console.log('Modelos  sincronizados correctamente.');
        } catch (error) {
            console.error('Error al sincronizar los modelos :', error);
        }
    }
    getRouter(): Router { return this.router; }

}

export default CampiAmigoService;