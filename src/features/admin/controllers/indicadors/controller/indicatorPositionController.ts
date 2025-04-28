import { Request, Response } from 'express';
import { IndicatorModel } from '../../../../indicators/models/indicador';
 
export const updateIndicatorPosition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { x, y, z } = req.body;
  
      if (x === undefined || y === undefined || z === undefined) {
        res.status(400).json({ msg: 'Debe proporcionar x, y, z' });
        return;
      }
  
      const indicator = await IndicatorModel.findOne({ where: { userId: id } });
      if (!indicator) {
        res.status(404).json({ msg: 'Indicador no encontrado.' });
        return;
      }
  
      await indicator.update({ x, y, z });
  
      res.status(200).json({ msg: 'Posición actualizada.', indicator });
    } catch (error: any) {
      res.status(500).json({ msg: 'Error al actualizar la posición.', error: error.message });
    }
  };
  