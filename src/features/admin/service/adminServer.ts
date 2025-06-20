/**
 * @file adminServices.ts
 * @description Servicio que agrupa los routers del módulo de administración.
 */
import { Router } from 'express';
import dotenv from 'dotenv';
import { ZoneModel } from '../../zones/models/zoneModel';
import { Country } from '../../countries/models/paisModel';
import adminRouter from '../routes/adminRoute';
import adminAccountRouter from '../controllers/users/routes/adminAuthsUsersRouter';
import adminProfileRouter from '../controllers/profile/routes/profileUseRouter';
import adminZoneRouter from '../controllers/zones/routes/zone';
import productosRouter from '../controllers/products/routes/productosRouter';
import { IndicatorModel } from '../../indicators/models/indicador';
import { TagModel } from '../../tags/models/tagModel';
import { ReviewModel } from '../../tags/models/reviewModel';
import ProductModel from '../../products/models/productModel';
import tagRouter from '../../tags/etiqueta/routes/tagRouter';

dotenv.config();

class AdminServer {
  private router: Router;
  constructor() {
    this.router = Router();
    this.routes();
    this.dbConnect();

  }

  routes(): void {

    this.router.use(productosRouter);

    this.router.use(adminRouter);
    this.router.use(adminAccountRouter);
    this.router.use(adminProfileRouter);
    this.router.use(adminZoneRouter);
    this.router.use(tagRouter);
 
  }
  async dbConnect() {
    try {
      await ProductModel.sync();
      await ZoneModel.sync();
      await Country.sync();
      await IndicatorModel.sync();
      await TagModel.sync();
      await ReviewModel.sync();

      console.log('Modelos de denuncias sincronizados correctamente.');
    } catch (error) {
      console.error('Error al sincronizar los modelos de denuncias:', error);
    }
  }
  getRouter(): Router { return this.router; }
}
export default AdminServer;
