// src/campiamigo/controllers/indicator.controller.ts
import { Request, Response } from 'express';
import { AuthModel } from '../../../../auth/models/authModel';
import { IndicatorModel } from '../../../../indicators/models/indicador';
import { userProfileModel } from '../../../../profiles/models/userProfileModel';
import { ZoneModel } from '../../../../zones/models/zoneModel';
import ProductModel from '../../../../products/models/productModel';
import { TagModel } from '../../../../tags/models/tagModel';
 
export const getIndicatorByUserIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;  // id es userProfile.id

    const indicator = await IndicatorModel.findOne({
      where: { userId: id },
      attributes: [
        'id','zoneId','userId','updatedBy','color',
        'x','y','z','createdAt','updatedAt'
      ],
      include: [
        // 1. Zona
        { 
          model: ZoneModel,
          attributes: ['id','name','tipoZona','zoneImage']
        },
        // 2. Perfil de usuario
        {
          model: userProfileModel,
          attributes: [
            'id','userId','profilePicture','firstName','lastName',
            'identificationType','identificationNumber','biography',
            'direccion','birthDate','gender','status','campiamigo',
            'zoneId','createdAt','updatedAt'
          ],
          include: [
            // 2.1 Datos de autenticación
            {
              model: AuthModel,
              as: 'auth',                   // Alias para que JSON venga en userProfile.auth
              attributes: ['id','username','email','phoneNumber'],
              include: [
                {
                  model: ProductModel,
                  as: 'products',           // Alias definido en la relación
                  attributes: ['id','name','description','price','image','glbFile','video']
                }
              ]
            },
            // 2.2 Etiquetas
            {
              model: TagModel,
              as: 'tags',                   // Alias definido en userProfileModel.hasMany()
              attributes: ['id','name','color','createdAt','updatedAt'],
              required: false               // Si no hay etiquetas, igual devuelve el perfil
            }
          ]
        }
      ]
    });

    if (!indicator) {
      res.status(404).json({ msg: 'No se encontró un indicador para este userProfile.id.' });
      return;
    }

    res.status(200).json({ msg: 'Indicador recuperado correctamente.', indicator });
  } catch (error: any) {
    console.error('Error al recuperar el indicador:', error);
    res.status(500).json({ 
      msg: 'Error del servidor al obtener el indicador.', 
      error: error.message 
    });
  }
};
