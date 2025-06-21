/**
 * @file getAllZonesController.ts
 * @description Controlador para obtener un listado de todas las zonas, con capacidad de filtrado
 *              adaptada al nuevo modelo de datos jerárquico.
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZoneModel } from '../../../../zones/models/zoneModel'; // Asegúrate que esta ruta es correcta
import { userProfileModel } from '../../../../profiles/models/userProfileModel'; // Y esta también

/**
 * Obtiene todas las zonas registradas, permitiendo filtrar por diversos criterios.
 * Los filtros se han actualizado para usar los nuevos campos del modelo:
 * `departamento`, `municipio`, `vereda`.
 *
 * @param req La solicitud de Express. Los filtros vienen en `req.query`.
 * @param res La respuesta de Express.
 */
export const getAllZonesController = async (req: Request, res: Response): Promise<void> => {
  try {
    // --- 1. EXTRACCIÓN DE PARÁMETROS DE CONSULTA (QUERY PARAMS) ACTUALIZADOS ---
    // Obtenemos los posibles filtros desde la URL (ej. /zones?departamento=Cundinamarca&climate=frio)
    const {
      departamento,
      municipio,
      vereda,
      climate,
      search // Un nuevo campo de búsqueda general para descripción y "about"
    } = req.query;

    // --- 2. CONSTRUCCIÓN DINÁMICA DE LA CLÁUSULA `WHERE` ---
    // Creamos un objeto `where` que se llenará solo con los filtros que el usuario proporcione.
    const where: any = {};

    // Filtros de ubicación jerárquica
    if (departamento) {
      // Usamos Op.iLike para una búsqueda insensible a mayúsculas/minúsculas
      where.departamento = { [Op.iLike]: `%${departamento}%` };
    }
    if (municipio) {
      where.municipio = { [Op.iLike]: `%${municipio}%` };
    }
    if (vereda) {
      where.vereda = { [Op.iLike]: `%${vereda}%` };
    }

    // Filtros de atributos
    if (climate) {
      where.climate = climate as string; // El tipo ya está validado por el ENUM del modelo
    }

    // Filtro de búsqueda de texto general. Busca en múltiples campos.
    if (search) {
      const searchTerm = `%${search}%`;
      where[Op.or] = [
        { description: { [Op.iLike]: searchTerm } },
        { about: { [Op.iLike]: searchTerm } },
        // También podríamos buscar en los nombres de la ubicación si quisiéramos
        { municipio: { [Op.iLike]: searchTerm } },
        { vereda: { [Op.iLike]: searchTerm } }
      ];
    }
    
    // --- 3. CONSULTA A LA BASE DE DATOS ---
    // Se realiza la consulta usando el `where` dinámico y seleccionando los atributos correctos.
    const zones = await ZoneModel.findAll({
      where, // Aplicamos los filtros construidos
      attributes: [
        // Lista de campos a devolver, ahora alineada con el nuevo modelo
        'id',
        'departamento',
        'municipio',
        'vereda',
        'description',
        'about',
        'climate',
        'elevation',
        'temperature',
        'cityImage', // Imagen del departamento/municipio
        'zoneImage', // Imagen de la vereda/zona
        'video',
        'modelPath',
        'titleGlb'
      ],
      // La inclusión del perfil de usuario se mantiene si sigue siendo relevante
      // include: [{
      //   model: userProfileModel,
      //   attributes: ['id', 'userId'],
      //   required: false  
      // }],
      order: [ // Ordenamos los resultados para una mejor presentación
        ['departamento', 'ASC'],
        ['municipio', 'ASC'],
        ['vereda', 'ASC']
      ]
    });

    // --- 4. RESPUESTA AL CLIENTE ---
    res.status(200).json({
      msg: `Se recuperaron ${zones.length} zonas.`,
      zones
    });

  } catch (error: any) {
    // --- 5. MANEJO DE ERRORES ---
    console.error('Error en getAllZonesController:', error);
    res.status(500).json({
      msg: 'Error interno del servidor al recuperar las zonas.',
      error: error.message
    });
  }
};