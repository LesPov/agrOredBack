import { Router } from "express";
import validateToken from "../../../../../infrastructure/middleware/valdiateToken/validateToken";
import validateRole from "../../../../../infrastructure/middleware/validateRole/validateRole";
import { getAllUsersController } from "../getAllUsersController";
import { updateUserController } from "../updateUserController";
 
const adminAccountRouter = Router();

// Ruta para obtener todos los usuarios (cuentas)
adminAccountRouter.get('/accounts', validateToken, validateRole('admin'), getAllUsersController);

// Ruta para actualizar datos de la cuenta (username, email, rol y la imagen del perfil)
adminAccountRouter.put('/account/:id', validateToken, validateRole('admin'), updateUserController);

export default adminAccountRouter;
