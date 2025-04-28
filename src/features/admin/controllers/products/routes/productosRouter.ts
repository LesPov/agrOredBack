// routes/assetsRouter.ts
import { Router } from 'express';
import validateToken from '../../../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../../../infrastructure/middleware/validateRole/validateRole';
import { getAllProductsController } from '../controllers/getAllProductsController';
import { getProductByIdController } from '../controllers/getProductByIdController';
import { getUserProductsController } from '../controllers/getProductCountController';
import { createProductController } from '../controllers/postProductController';
 
const productosRouter = Router();

// Ruta para subir activos (máx: 3 imágenes y 2 modelos 3D)
// Puedes ajustar la validación de token y role según lo requieras (por ejemplo, 'admin' o 'user')
productosRouter.post('/product/:id', validateToken, validateRole('admin'), createProductController);
productosRouter.get('/product/:id/count', validateToken, validateRole('admin'), getUserProductsController);
// Cambiar de '/products/all' a 'products/all' (montado bajo /campiamigo/product)
productosRouter.get('/products/all', getAllProductsController);
// NUEVA RUTA
// GET   /product/detail/:id      -> getProductByIdController
productosRouter.get('/product/detail/:id', getProductByIdController);

export default productosRouter;
