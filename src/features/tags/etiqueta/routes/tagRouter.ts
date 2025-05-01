import { Router } from 'express';
 
import { createTagController, getUserTagsController } from '../tagController';
import validateToken from '../../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../../infrastructure/middleware/validateRole/validateRole';

const tagRouter = Router();

// Crear etiqueta para un perfil de usuario
// Body: { name: string }
tagRouter.post(
  '/tag/:id',
  validateToken,
  validateRole('admin'),
  createTagController
);

// Obtener count de etiquetas de un usuario
tagRouter.get(
  '/tag/:id/count',
  validateToken,
  validateRole('admin'),
  getUserTagsController
);



export default tagRouter;
