// src/campiamigo/middleware/models/reviewModel.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/connection';
import { AuthModel } from '../../auth/models/authModel';
import ProductModel from '../../products/models/productModel';
 
/**
 * Interfaz para las reseñas.
 */
export interface ReviewInterface extends Model { 
  id?: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
}

export const ReviewModel = sequelize.define<ReviewInterface>(
  'review',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    }, 
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'review',
    timestamps: true,
    indexes: [ 
      {
        // Evita duplicados user–producto
        unique: true,
        name: 'unique_user_product_review',
        fields: ['userId', 'productId'],
      },
      {
        // Optimiza búsquedas por producto
        name: 'idx_review_productId',
        fields: ['productId'],
      },
    ],
  }
);

// Relaciones
AuthModel.hasMany(ReviewModel, { foreignKey: 'userId' });
ReviewModel.belongsTo(AuthModel, { foreignKey: 'userId' });

ProductModel.hasMany(ReviewModel, { foreignKey: 'productId', as: 'reviews' });
ReviewModel.belongsTo(ProductModel, { foreignKey: 'productId' });
