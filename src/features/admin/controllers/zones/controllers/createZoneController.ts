import { Request, Response } from 'express';
import uploadZone from '../../../../../infrastructure/uploadsfiles/uploadZoneConfig'; // Asegúrate de usar la ruta correcta
import { ZoneModel } from '../../../../zones/models/zoneModel';
// Asegúrate que la ruta al modelo sea correcta
 
// La función auxiliar para manejar la subida no necesita cambios
const handleZoneImageUpload = (req: Request, res: Response, callback: () => Promise<void>): void => {
  uploadZone(req, res, (err: any) => {
    if (err) {
      console.error("Error en la subida de archivos de zona:", err.message);
      res.status(400).json({
        msg: `Error en la subida de archivos de zona: ${err.message}`,
        errors: 'Error al cargar los archivos'
      });
      return;
    }
    callback();
  });
};

export const createZoneController = async (req: Request, res: Response): Promise<void> => {
  handleZoneImageUpload(req, res, async (): Promise<void> => {
    try {
      // --- EXTRAER LOS NUEVOS CAMPOS DEL BODY ---
      const {
        name,
        tipoZona,
        description,
        climate,
        departamentoName,
        elevation,      // Nuevo
        temperature,    // Nuevo
        about           // Nuevo
      } = req.body;

      // La verificación de zona existente sigue igual
      const existingZone = await ZoneModel.findOne({ where: { name, departamentoName } });
      if (existingZone) {
        res.status(400).json({ msg: 'Ya existe una zona con ese nombre y departamento.' });
        return;
      }

      // La extracción de archivos sigue igual
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const cityImage = files?.cityImage ? files.cityImage[0].filename : undefined;
      const zoneImage = files?.zoneImage ? files.zoneImage[0].filename : undefined;
      const video = files?.video ? files.video[0].filename : undefined;
      const modelPath = files?.modelPath ? files.modelPath[0].filename : undefined;
      const titleGlb = files?.titleGlb ? files.titleGlb[0].filename : undefined;

      // --- AÑADIR LOS NUEVOS CAMPOS AL CREAR LA ZONA ---
      const newZone = await ZoneModel.create({
        name,
        tipoZona,
        description,
        climate,
        departamentoName,
        cityImage,
        zoneImage,
        video,
        modelPath,
        titleGlb,
        elevation,      // Añadido
        temperature,    // Añadido
        about           // Añadido
      });

      // La respuesta sigue igual
      res.status(201).json({
        msg: 'Zona creada correctamente.',
        zone: newZone,
      });
    } catch (error: any) {
      // El manejo de errores sigue igual
      console.error('Error en createZoneController:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          msg: 'La combinación de nombre de zona y departamento ya existe.',
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        msg: 'Error al crear la zona.',
        error: error.message,
      });
    }
  });
};