import { Router } from "express";
import validateToken from "../../../../../infrastructure/middleware/valdiateToken/validateToken";
import { get } from "http";
import validateRole from "../../../../../infrastructure/middleware/validateRole/validateRole";
import { getProfileByIdController } from "../controllers/getProfileByIdController ";
import { updateUserProfileByAdmin } from "../controllers/updateUserProfileByController";
 

const adminProfileRouter = Router();

// Ruta para obtener el perfil de un usuario específico
adminProfileRouter.get('/profiles/:id', validateToken, validateRole('admin'), getProfileByIdController);

// Ruta para actualizar el perfil de un usuario específico
adminProfileRouter.put('/profile/:id', validateToken, validateRole('admin'), updateUserProfileByAdmin);

export default adminProfileRouter;
            