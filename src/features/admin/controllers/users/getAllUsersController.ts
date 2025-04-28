import { Request, Response } from 'express';
import { errorMessages } from '../../../../shared/auth/errors/auth.errors';
import { AuthModel } from '../../../auth/models/authModel';
import { userProfileModel } from '../../../profiles/models/userProfileModel';
 
export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Se obtienen los usuarios incluyendo el campo phoneNumber y la imagen del perfil.
    const users = await AuthModel.findAll({
      attributes: ['id', 'username', 'email', 'phoneNumber', 'rol', 'status'],
      include: [
        {
          model: userProfileModel,
          attributes: ['profilePicture'],
        },
      ],
    });

    res.status(200).json(users);
  } catch (error: any) {
    console.error("Error in getAllUsersController:", error);
    res.status(500).json({
      msg: error.message || errorMessages.databaseError,
      error,
    });
  }
};
