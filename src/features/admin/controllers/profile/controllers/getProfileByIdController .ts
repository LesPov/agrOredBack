import { Request, Response } from 'express';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';
 
/**
 * Controlador GET para obtener el perfil de un usuario por su ID.
 * Se espera que el parámetro de la ruta contenga el ID del usuario.
 */
export const getProfileByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Se extrae el id del usuario desde los parámetros de la URL.
    const { id } = req.params;
    
    // Se busca el perfil asociado al userId.
    const profile = await userProfileModel.findOne({ where: { userId: id } });
    
    // Si no se encuentra el perfil, se retorna un 404.
    if (!profile) {
      res.status(404).json({ msg: 'Perfil no encontrado' });
      return;
    }
    
    // Se retorna el perfil encontrado con un status 200.
    res.status(200).json(profile);
  } catch (error: any) {
    console.error("Error en getProfileByIdController:", error);
    res.status(500).json({ 
      msg: error.message || 'Error en el servidor al obtener el perfil', 
      error 
    });
  }
};
