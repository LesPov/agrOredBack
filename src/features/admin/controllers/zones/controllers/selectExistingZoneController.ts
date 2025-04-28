// controllers/RegisterCAmigos/utils/zone/selectExistingZoneController.ts
import { Request, Response } from 'express';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';
import { IndicatorModel } from '../../../../indicators/models/indicador';
  
export const selectExistingZoneController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtenemos el userId desde los parámetros de la ruta.
    const userId = parseInt(req.params.id);

    // Obtenemos el zoneId desde el body.
    const { zoneId } = req.body;
    if (!zoneId) {
      res.status(400).json({
        msg: 'El campo zoneId es obligatorio.'
      });
      return;
    }

    // Actualizamos el campo zoneId del perfil del usuario.
    const [updatedRows] = await userProfileModel.update(
      { zoneId },
      { where: { userId } }
    );

    if (updatedRows === 0) {
      res.status(404).json({
        msg: 'No se encontró un perfil asociado a este usuario o no se realizaron cambios.'
      });
      return;
    }
    
    // Verificar si ya existe un indicador para este usuario.
    let indicator = await IndicatorModel.findOne({ where: { userId } });

    if (!indicator) {
      // Si no existe, crear un nuevo indicador con los valores por defecto.
      indicator = await IndicatorModel.create({
        zoneId,
        userId,
        color: 'white',    // Puedes cambiar el color por defecto según tus necesidades
        x: 50,
        y: 50,
        z: 0
      });
    } else {
      // Opcional: si ya existe y deseas actualizar el zoneId en el indicador,
      // puedes hacerlo aquí.
      await indicator.update({ zoneId });
    }

    res.status(200).json({
      msg: 'Zona actualizada exitosamente en el perfil y se ha inicializado el indicador correspondiente.',
      indicator
    });
  } catch (error: any) {
    console.error('Error al actualizar la zona del usuario y el indicador:', error);
    res.status(500).json({
      msg: 'Error al actualizar la zona y el indicador del usuario.',
      error: error.message
    });
  }
};
