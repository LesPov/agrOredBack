// controllers/getAllProductsController.ts
import { Request, Response } from 'express';
import { AuthModel } from '../../../../auth/models/authModel';
import ProductModel from '../../../../products/models/productModel';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';
import { TagModel } from '../../../../tags/models/tagModel';
import { ZoneModel } from '../../../../zones/models/zoneModel';
 
export const getAllProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const allProducts = await ProductModel.findAll({
      include: [
        {
          model: AuthModel,
          // quitamos password y username
          attributes: ['id', 'email', 'phoneNumber', 'rol', 'status'],
          include: [
            {
              model: userProfileModel,
              attributes: [
                'id',
                'firstName',
                'lastName',
                'profilePicture',
                'identificationType',
                'identificationNumber',
                'birthDate',
                'gender',
                'biography',
                'direccion',
                'campiamigo',
                'status',
                'zoneId'
              ],
              include: [
                {
                  model: ZoneModel,
                  attributes: [
                    'id',
                    'name',
                    'departamentoName',
                    'tipoZona',
                    'climate',
                    'cityImage',
                    'zoneImage'
                  ]
                },
                {
                  model: TagModel,
                  as: 'tags',
                  attributes: ['id', 'name', 'color']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      msg: `Se han obtenido ${allProducts.length} producto(s) en total.`,
      count: allProducts.length,
      products: allProducts
    });
  } catch (error: any) {
    console.error("Error en getAllProductsController:", error);
    res.status(500).json({
      msg: 'Error al obtener todos los productos.',
      error: error.message
    });
  }
};
