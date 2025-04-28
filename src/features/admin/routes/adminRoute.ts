import { Router } from "express";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";
import validateRole from "../../../infrastructure/middleware/validateRole/validateRole";
import { updateStatus } from "../../../infrastructure/middleware/updatestatus/updateStatus";
 
const adminRouter = Router();
adminRouter.get('/', validateToken, validateRole('admin'), (req, res) => { res.send('Bienvenido, eres un admin'); });

export default adminRouter;

