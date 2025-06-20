/**
 * @file createZoneController.ts
 * @description Controlador para la creación de una nueva zona geográfica, adaptado al modelo de datos jerárquico.
 */

import { Request, Response } from 'express';
import multer from 'multer';
// Importamos la configuración de Multer para manejar la subida de archivos y los límites.
import uploadZone, { limits } from '../../../../../infrastructure/uploadsfiles/uploadZoneConfig';
// Importamos el nuevo modelo de Zona.
import { ZoneModel } from '../../../../zones/models/zoneModel';

/**
 * Función de ayuda (Wrapper) que primero procesa la subida de archivos con Multer
 * y luego ejecuta la lógica principal del controlador.
 * Esta estructura separa la gestión de archivos de la lógica de negocio.
 * @param req - Objeto de solicitud de Express.
 * @param res - Objeto de respuesta de Express.
 * @param callback - La función del controlador principal a ejecutar después de que Multer termine.
 */
const handleZoneFileUpload = (req: Request, res: Response, callback: () => Promise<void>): void => {
  uploadZone(req, res, (err: any) => {
    // 1. Manejo de errores específicos de Multer.
    if (err) {
      console.error("[Multer Error] Error durante la subida de archivos:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            msg: `Error: El archivo es demasiado grande. El límite es de ${limits.fileSize / (1024 * 1024)} MB.`,
            code: err.code
          });
        }
        return res.status(400).json({
          msg: `Error de Multer: ${err.message}`,
          code: err.code
        });
      }
      // 2. Manejo de otros errores inesperados durante la subida.
      return res.status(500).json({
        msg: `Error inesperado durante la subida del archivo: ${err.message}`
      });
    }

    // 3. Si Multer se ejecuta sin errores, llamamos a la lógica principal del controlador.
    callback();
  });
};

/**
 * Controlador para crear una nueva Zona.
 * Se encarga de validar los datos de entrada, comprobar duplicados, procesar
 * archivos subidos y finalmente, crear el registro en la base de datos.
 * @param req - La solicitud de Express, que contiene los datos de la zona en `req.body` y los archivos en `req.files`.
 * @param res - La respuesta de Express.
 */
export const createZoneController = async (req: Request, res: Response): Promise<void> => {
  // Usamos el wrapper para que primero se gestionen los archivos.
  handleZoneFileUpload(req, res, async (): Promise<void> => {
    try {
      // --- 1. EXTRACCIÓN Y VALIDACIÓN DE DATOS DEL BODY ---
      // Extraemos los campos del cuerpo de la petición, adaptados al nuevo modelo.
      const {
        departamento,
        municipio,
        vereda, // Este es opcional
        description,
        climate,
        elevation,
        temperature,
        about
      } = req.body;

      // Validación fundamental: 'departamento' y 'municipio' son obligatorios.
      if (!departamento || !municipio) {
        res.status(400).json({ msg: 'Los campos "departamento" y "municipio" son obligatorios.' });
        return;
      }

      // --- 2. VERIFICACIÓN DE ZONA EXISTENTE (LÓGICA ACTUALIZADA) ---
      // Comprobamos si ya existe una zona con la misma combinación única de departamento, municipio y vereda.
      // Sequelize manejará `vereda` como `NULL` si no se proporciona, lo que es correcto.
      const existingZone = await ZoneModel.findOne({
        where: {
          departamento,
          municipio,
          vereda: vereda || null // Aseguramos que se compare con NULL si 'vereda' viene vacío o undefined.
        }
      });

      if (existingZone) {
        res.status(409).json({ // 409 Conflict es más semántico para un recurso que ya existe.
          msg: `Ya existe una zona con la combinación: Departamento='${departamento}', Municipio='${municipio}'` + (vereda ? `, Vereda='${vereda}'` : '.')
        });
        return;
      }

      // --- 3. EXTRACCIÓN DE RUTAS DE ARCHIVOS (LÓGICA SIN CAMBIOS) ---
      // Accedemos a los archivos procesados por Multer.
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const cityImage = files?.cityImage ? files.cityImage[0].filename : undefined;
      const zoneImage = files?.zoneImage ? files.zoneImage[0].filename : undefined;
      const video = files?.video ? files.video[0].filename : undefined;
      const modelPath = files?.modelPath ? files.modelPath[0].filename : undefined;
      const titleGlb = files?.titleGlb ? files.titleGlb[0].filename : undefined;

      // --- 4. CREACIÓN DE LA NUEVA ZONA EN LA BASE DE DATOS ---
      // Creamos la nueva instancia en la tabla 'zone' con todos los datos validados y procesados.
      const newZone = await ZoneModel.create({
        departamento,
        municipio,
        vereda,
        description,
        climate,
        cityImage,
        zoneImage,
        video,
        modelPath,
        titleGlb,
        elevation,
        temperature,
        about
      });

      // --- 5. RESPUESTA DE ÉXITO ---
      // Respondemos con un estado 201 (Creado) y la información de la nueva zona.
      res.status(201).json({
        msg: 'Zona creada correctamente.',
        zone: newZone,
      });

    } catch (error: any) {
      // --- 6. MANEJO DE ERRORES DE BASE DE DATOS ---
      console.error('Error en la lógica de createZoneController:', error);
      // Capturamos el error específico de la restricción de unicidad de Sequelize.
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(409).json({ // 409 Conflict
          msg: 'La combinación de departamento, municipio y vereda ya existe. Conflicto de datos.',
          error: error.message,
        });
        return;
      }
      // Para cualquier otro error, devolvemos un error 500 (Error Interno del Servidor).
      res.status(500).json({
        msg: 'Error interno del servidor al intentar crear la zona.',
        error: error.message,
      });
    }
  });
};