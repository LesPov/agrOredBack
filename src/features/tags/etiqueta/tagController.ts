// src/campiamigo/controllers/tagController.ts
import { Request, Response } from 'express';
import { TagModel } from '../models/tagModel';
 
/**
 * Crea una nueva etiqueta para el perfil de usuario indicado en req.params.id.
 * El body debe contener { name: string, color?: string }.
 */
export const createTagController = async (req: Request, res: Response): Promise<void> => {
  const userProfileId = parseInt(req.params.id, 10);
  const { name, color } = req.body;

  // 1) Validaciones básicas
  if (Number.isNaN(userProfileId)) {
    res.status(400).json({ msg: 'Parámetro "id" debe ser un número válido.' });
    return;
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ msg: 'El campo "name" es obligatorio y debe ser texto.' });
    return;
  }
  if (color && typeof color !== 'string') {
    res.status(400).json({ msg: 'El campo "color" debe ser un string válido (p.ej. "#ff0000").' });
    return;
  }

  try {
    const normalized = name.trim().toLowerCase();
    // 2) Crear etiqueta con name y color (o el default del modelo)
    const tag = await TagModel.create({
      userProfileId,
      name: normalized,
      color: color?.trim() || undefined
    });

    res.status(201).json({
      msg: 'Etiqueta creada correctamente.',
      tag
    });
  } catch (error: any) {
    console.error('Error en createTagController:', error);

    // 3) Manejo de unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        msg: `La etiqueta "${name.trim()}" ya existe para este usuario.`
      });
      return;
    }

    // 4) Otros errores
    res.status(500).json({
      msg: 'Error interno al crear la etiqueta.',
      error: error.message
    });
  }
};

/**
 * Lista todas las etiquetas de un perfil de usuario.
 * Devuelve también el color de cada etiqueta.
 */
export const getUserTagsController = async (req: Request, res: Response): Promise<void> => {
  const userProfileId = parseInt(req.params.id, 10);
  if (Number.isNaN(userProfileId)) {
    res.status(400).json({ msg: 'Parámetro "id" debe ser un número válido.' });
    return;
  }

  try {
    const tags = await TagModel.findAll({
      where: { userProfileId },
      attributes: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ userProfileId, tags });
  } catch (error: any) {
    console.error('Error en getUserTagsController:', error);
    res.status(500).json({ msg: 'Error interno al obtener etiquetas.' });
  }
};
