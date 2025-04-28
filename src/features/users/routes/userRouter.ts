import { Router } from "express";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";
import validateRole from "../../../infrastructure/middleware/validateRole/validateRole";
 
const userRouter = Router();
userRouter.get('/user', validateToken, validateRole('user'), (req, res) => { res.send('Bienvenido, eres un usuario'); });

export default userRouter;

