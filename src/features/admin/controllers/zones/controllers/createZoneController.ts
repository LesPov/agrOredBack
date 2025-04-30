import { Request, Response } from 'express';
import multer from 'multer'; // Necesario para instanceof multer.MulterError
// --- IMPORTA 'uploadZone' (default) Y 'limits' (nombrada) ---
import uploadZone, { limits } from '../../../../../infrastructure/uploadsfiles/uploadZoneConfig';
import { ZoneModel } from '../../../../zones/models/zoneModel'; // Ajusta la ruta si es necesario

// La función auxiliar para manejar la subida
const handleZoneImageUpload = (req: Request, res: Response, callback: () => Promise<void>): void => {
  console.log(`[handleZoneImageUpload] Recibida petición para ${req.method} ${req.originalUrl}. Intentando procesar con Multer...`);
  uploadZone(req, res, (err: any) => {
    // Manejo de errores de Multer
    if (err) {
      console.error("[Multer Error] Error durante la subida de archivos:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          // --- AHORA 'limits' SÍ ESTÁ DISPONIBLE ---
          return res.status(413).json({ // 413 Payload Too Large
            msg: `Error: El archivo subido excede el límite de ${limits.fileSize / (1024 * 1024)} MB.`,
            code: err.code
          });
        }
        // Otros errores conocidos de Multer (ej. demasiados archivos, campo inesperado)
        return res.status(400).json({ // 400 Bad Request
          msg: `Error de Multer: ${err.message}`,
          code: err.code
        });
      }
      // Otros errores inesperados durante la fase de subida (ej. problemas de disco)
      return res.status(500).json({ // 500 Internal Server Error
        msg: `Error inesperado durante la configuración de la subida: ${err.message}`
      });
    }

    // Verificar si se subieron archivos (req.files podría estar vacío si no se envió nada)
    if (!req.files || Object.keys(req.files).length === 0) {
       // Podrías decidir si esto es un error o no. Si algunos archivos son opcionales, quizás no lo sea.
       // console.warn("[handleZoneImageUpload] No se subieron archivos.");
    } else {
        console.log("[handleZoneImageUpload] Archivos procesados por Multer:", Object.keys(req.files));
    }


    // Si Multer no dio error, ejecutar el callback principal del controlador
    console.log("[handleZoneImageUpload] Multer procesó la petición sin errores aparentes. Ejecutando callback del controlador...");
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