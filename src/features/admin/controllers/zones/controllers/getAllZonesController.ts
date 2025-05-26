import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZoneModel } from '../../../../zones/models/zoneModel';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';

export const getAllZonesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { climate, departamentoName, tipoZona, description } = req.query;
    const where: any = {};
    if (climate) where.climate = climate;
    if (departamentoName) where.departamentoName = departamentoName;
    if (tipoZona) where.tipoZona = tipoZona;
    if (description) where.description = { [Op.like]: `%${description}%` };

    /* 
      Se asume que el modelo ZoneModel cuenta con los siguientes campos:
        - name (o nombre de la zona)
        - zoneImage (imagen de la zona)
        - video (ruta o URL del video asociado a la zona)
        - modelPath (ruta del modelo 3D) 
        - titleGlb (ruta del título o modelo complementario)
      
      De esta manera, si la zona tiene un modelo o video asignado, se incluirá en la respuesta.
    */
    const zones = await ZoneModel.findAll({
      where,
      attributes: [
        'id',
        'name',
        'description',
        'climate',
        'cityImage',
        'departamentoName',
        'tipoZona',
        'zoneImage',
        'video',      // video de la zona
        'modelPath',  // modelo de la zona (puedes usar otro nombre si en tu BD es distinto)
        'titleGlb',   // opcional: título o modelo adicional
        'elevation',
        'temperature',
        'about'
      ],
      include: [{
        model: userProfileModel,
        attributes: ['id', 'userId']
      }]
    });

    // Si no existe un modelo para alguna zona (campo nulo o vacío) no se realiza acción especial. 
    // Se retorna el objeto zona completo y la lógica en el front-end podrá discriminar si la zona cuenta con modelo o video.
    res.status(200).json({
      msg: 'Zonas recuperadas correctamente.',
      zones
    });
  } catch (error: any) {
    console.error('Error en getAllZonesController:', error);
    res.status(500).json({
      msg: 'Error al recuperar las zonas.',
      error: error.message
    });
  }
};
