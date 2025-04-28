import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { errorMessages } from '../../../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';
import { successMessagesCp } from '../../../../../shared/admin/succes/succesMessagesCp';
import { IndicatorModel } from '../../../../indicators/models/indicador';
 
/**
 * Función de validación de datos requeridos para el perfil.
 * Se requieren: firstName, lastName, birthDate y gender.
 */
const validateProfileData = (
  firstName: string,
  lastName: string,
  birthDate: string,
  gender: string
): string[] => {
  const errors: string[] = [];
  if (!firstName || !lastName || !birthDate || !gender) {
    errors.push(errorMessages.requiredFields || 'Faltan campos obligatorios');
  }
  if (birthDate && isNaN(Date.parse(birthDate))) {
    errors.push('La fecha de nacimiento no es válida.');
  }
  return errors;
};

/**
 * Controlador PUT para que el admin actualice el perfil de un usuario específico.
 * Recibe el id del usuario a actualizar en req.params.id y los datos en el body.
 *
 * Además de la lógica existente, se agrega la actualización del campo status.
 * Si el campo campiamigo cambia a false, se elimina la zona asignada al usuario
 * (se pone zoneId en null) y se borra el indicador asociado.
 */
export const updateUserProfileByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ msg: 'Se requiere el id del usuario para actualizar.' });
      return;
    }

    // Extraemos los datos enviados en el body, incluyendo el campo status
    const {
      firstName,
      lastName,
      identificationNumber,
      identificationType,
      biography,
      direccion,
      birthDate,
      gender,
      campiamigo,
      status, // nuevo campo para actualizar el estado del usuario
    } = req.body;

    // Validamos los campos requeridos
    const validationErrors = validateProfileData(firstName, lastName, birthDate, gender);
    if (validationErrors.length > 0) {
      res.status(400).json({ msg: validationErrors });
      return;
    }

    // Verificar duplicados para el número de identificación
    if (identificationNumber) {
      const duplicateIdentification = await userProfileModel.findOne({
        where: {
          identificationNumber,
          userId: { [Op.ne]: userId }
        }
      });
      if (duplicateIdentification) {
        res.status(400).json({
          msg: 'El número de identificación ya está registrado en otro perfil.',
          error: 'Número de identificación duplicado'
        });
        return;
      }
    }

    // Buscar el perfil existente por el id del usuario
    const existingProfile = await userProfileModel.findOne({ where: { userId } });
    if (!existingProfile) {
      res.status(404).json({ msg: 'Perfil no encontrado para el usuario especificado.' });
      return;
    }

    // Construir el objeto de actualización
    const updateData: any = {
      firstName,
      lastName,
      biography,
      direccion,
      birthDate,
      gender,
    };

    if (campiamigo !== undefined) {
      // Convertir a booleano (considera que puede venir como cadena "true" o "false")
      updateData.campiamigo = campiamigo === true || campiamigo === 'true';
    }

    if (identificationNumber) {
      updateData.identificationNumber = identificationNumber;
    }
    if (identificationType) {
      updateData.identificationType = identificationType;
    }
    // Si status se envía, se agrega al objeto de actualización.
    if (status !== undefined) {
      updateData.status = status;
    }

    // Si campiamigo es false, se elimina la zona asignada (zoneId se pone en null)
    if (updateData.campiamigo === false) {
      updateData.zoneId = null;
    }

    // Actualizar el perfil existente
    await existingProfile.update(updateData);

    // Si campiamigo fue actualizado a false, eliminar cualquier indicador asociado al usuario
    if (updateData.campiamigo === false) {
      await IndicatorModel.destroy({ where: { userId } });
    }

    res.status(200).json({ 
      msg: successMessagesCp.personalDataRegistered || 'Perfil actualizado correctamente.' 
    });
  } catch (error: any) {
    console.error('Error en updateUserProfileByAdmin:', error);
    res.status(500).json({ msg: error.message || 'Error interno del servidor.' });
  }
};
