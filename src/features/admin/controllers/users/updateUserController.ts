import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { errorMessages } from '../../../../shared/auth/errors/auth.errors';
import { AuthModel } from '../../../auth/models/authModel';
import { userProfileModel } from '../../../profiles/models/userProfileModel';
import upload from '../../../../infrastructure/uploadsfiles/uploadConfig';
 

/**
 * Maneja la subida de imagen utilizando el middleware de upload.
 */
const handleImageUpload = (req: Request, res: Response, callback: () => Promise<void>): void => {
  upload(req, res, (err) => {
    if (err) {
      console.error(`Error en la subida de la imagen: ${err.message}`);
      return res.status(400).json({
        msg: `Error en la subida de la imagen: ${err.message}`,
        errors: 'Error al cargar la imagen',
      });
    }
    callback();
  });
};

/**
 * Valida el formato de un email.
 */
const isValidEmail = (email: string): boolean => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(email);
};

/**
 * Verifica duplicados en username y email.
 */
const checkForDuplicates = async (id: string, username: string, email: string): Promise<void> => {
  const duplicateUser = await AuthModel.findOne({
    where: { username, id: { [Op.ne]: id } },
  });
  if (duplicateUser) {
    throw new Error('El username ya existe.');
  }

  const duplicateEmail = await AuthModel.findOne({
    where: { email, id: { [Op.ne]: id } },
  });
  if (duplicateEmail) {
    throw new Error('El email ya existe.');
  }
};

/**
 * Actualiza los datos básicos del usuario (username, email, rol y phoneNumber).
 */
const updateAuthUser = async (id: string, username: string, email: string, rol: string, phoneNumber?: string): Promise<void> => {
  await AuthModel.update({ username, email, rol, phoneNumber }, { where: { id } });
};

/**
 * Actualiza la imagen del perfil.
 */
const updateProfilePicture = async (id: string, profilePicture?: string): Promise<void> => {
  if (profilePicture) {
    await userProfileModel.update({ profilePicture }, { where: { userId: id } });
  }
};

/**
 * Consulta y retorna el usuario actualizado junto con la imagen del perfil.
 */
const getUpdatedUser = async (id: string) => {
  return await AuthModel.findOne({
    where: { id },
    attributes: ['id', 'username', 'email', 'phoneNumber', 'rol', 'status'],
    include: [{
      model: userProfileModel,
      attributes: ['profilePicture'],
    }],
  });
};
// const handleSocioDemographicData = async (userId: number, rol: string): Promise<void> => {
//   if (rol.toLowerCase() === 'campesino') {
//     const socioData = await SocioDemographicModel.findOne({ where: { userId } });
//     if (!socioData) {
//       await initializeSocioDemographicData(userId);
//     }
//   } else {
//     // Si el rol cambia a otro, se elimina la información sociodemográfica (si existe)
//     await SocioDemographicModel.destroy({ where: { userId } });
//   }
// }
/**
 * Controlador para actualizar los datos del usuario.
 */
export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  req.body.actualizarDatosDeUsuario = 'actualizarDatosDeUsuario';

  handleImageUpload(req, res, async (): Promise<void> => {
    try {
      const { id } = req.params;
      // Se extraen username, email, rol y phoneNumber del body.
      const { username, email, rol, phoneNumber } = req.body;
      const profilePicture: string | undefined = req.file?.filename;

      const user = await AuthModel.findByPk(id);
      if (!user) {
        res.status(404).json({ msg: 'Usuario no encontrado' });
        return
      }

      if (!isValidEmail(email)) {
        res.status(400).json({ msg: 'El email no tiene un formato válido.' });
        return
      }

      await checkForDuplicates(id, username, email);

      await updateAuthUser(id, username, email, rol, phoneNumber);

      await updateProfilePicture(id, profilePicture);
      // Llamada a la función modular para manejar la información sociodemográfica
      // await handleSocioDemographicData(Number(id), rol);

      const updatedUser = await getUpdatedUser(id);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error("Error en updateUserController:", error);
      res.status(500).json({
        msg: error.message || errorMessages.databaseError,
        error,
      });
    }
  });
};
