import { Request, Response } from 'express';
import { ZoneModel } from '../../../../zones/models/zoneModel';

/**
 * Controlador para eliminar una zona por su ID.
 * @param req - Objeto de solicitud de Express.
 * @param res - Objeto de respuesta de Express.
 */
export const deleteZoneController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Buscar la zona por su ID
    const zone = await ZoneModel.findByPk(id);

    // Verificar si la zona existe
    if (!zone) {
      res.status(404).json({
        msg: 'Zona no encontrada.',
      });
      return;
    }

    // Eliminar la zona
    await zone.destroy();

    res.status(200).json({
      msg: 'Zona eliminada correctamente.',
    });
  } catch (error: any) {
    console.error('Error en deleteZoneController:', error);
    res.status(500).json({
      msg: 'Error al eliminar la zona.',
      error: error.message,
    });
  }
};
