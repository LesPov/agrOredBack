import { Router } from "express";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";
import validateRole from "../../../infrastructure/middleware/validateRole/validateRole";
 
const campiAmigoRouter = Router();
campiAmigoRouter.get('/campiamigo', validateToken, validateRole('user'), (req, res) => { res.send('Bienvenido, eres un campiamigo'); });

export default campiAmigoRouter;

