import { Router } from 'express';
import validateToken from '../../../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../../../infrastructure/middleware/validateRole/validateRole';
import { createZoneController } from '../controllers/createZoneController';
import { deleteZoneController } from '../controllers/deleteZoneController ';
import { getAllZonesController } from '../controllers/getAllZonesController';
import { getZoneByIdController } from '../controllers/getZoneByIdController';
import { selectExistingZoneController } from '../controllers/selectExistingZoneController';
import { updateIndicatorColor } from '../../indicadors/controller/indicatorController';
import { getIndicatorByUserIdController } from '../../indicadors/controller/getIndicatorByUserIdController';
import { updateIndicatorPosition } from '../../indicadors/controller/indicatorPositionController';
 

const adminZoneRouter = Router();

// Ruta para crear una zona
adminZoneRouter.post('/zones', validateToken, validateRole('admin'), createZoneController);

// Rutas adicionales de zona (consulta, actualización, eliminación)
adminZoneRouter.get('/zone',  getAllZonesController);

adminZoneRouter.get('/zone/:id', validateToken, validateRole(['user', 'supervisor', 'admin']), getZoneByIdController);

adminZoneRouter.put('/zones/indicator-colors/:id', validateToken, validateRole('admin'), updateIndicatorColor);
adminZoneRouter.get('/zones/indicator/:id', validateToken, validateRole(['admin', 'supervisor', 'user']), getIndicatorByUserIdController);
adminZoneRouter.put('/zones/indicator-position/:id', validateToken, validateRole('admin'), updateIndicatorPosition);

adminZoneRouter.put('/user/:id/zone', validateToken, validateRole('admin'), selectExistingZoneController);

adminZoneRouter.delete('/zones/:id', validateToken, validateRole('admin'), deleteZoneController);

export default adminZoneRouter;
