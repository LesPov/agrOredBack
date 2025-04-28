import { Request, Response } from 'express';
import ProductModel from '../../../../products/models/productModel';
 
export const getUserProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraer el id del usuario desde los parámetros de la URL.
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({
        msg: 'El parámetro "id" del usuario es obligatorio y debe ser numérico.'
      });
      return;
    }

    // Buscar todos los productos del usuario utilizando findAll.
    const products = await ProductModel.findAll({ where: { userId } });

    // Responder con el listado de productos y su cantidad
    res.status(200).json({
      msg: `Se han obtenido ${products.length} producto(s) para el usuario con id ${userId}.`,
      products,
      count: products.length
    });
  } catch (error: any) {
    console.error("Error en getUserProductsController:", error);
    res.status(500).json({
      msg: 'Error al obtener los productos del usuario.',
      error: error.message
    });
  }
};
