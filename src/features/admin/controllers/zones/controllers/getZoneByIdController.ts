// controllers/getZoneByIdController.ts
import { Request, Response } from 'express';
import { ZoneModel } from '../../../../zones/models/zoneModel';

/**
 * Controlador para obtener una zona específica por su ID.
 * Se consulta la base de datos y se retorna la zona con sus datos completos.
 */
export const getZoneByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar la zona por su ID.
    const zone = await ZoneModel.findByPk(id);

    // Verificar si la zona existe.
    if (!zone) {
      res.status(404).json({
        msg: 'Zona no encontrada.',
      });
    }

    // Retornar la zona encontrada.
    res.status(200).json({
      msg: 'Zona recuperada correctamente.',
      zone,
    });
  } catch (error: any) {
    console.error('Error en getZoneByIdController:', error);
    res.status(500).json({
      msg: 'Error al recuperar la zona.',
      error: error.message,
    });
  }
};
