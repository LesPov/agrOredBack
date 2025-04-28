// src/campiamigo/middleware/models/tagModel.ts
import { DataTypes, Model } from 'sequelize';
 import { userProfileModel } from '../../profiles/models/userProfileModel';
import sequelize from '../../../infrastructure/database/connection';
 
export interface TagInterface extends Model {
  id?: number;
  userProfileId: number;
  name: string;
  color: string;          // ← nuevo campo
  createdAt?: Date;
  updatedAt?: Date;
}

export const TagModel = sequelize.define<TagInterface>(
  'tag',
  {
    /** PK autoincremental */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    /** FK a userProfile.id */
    userProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userProfileModel,
        key: 'id',
      },
    },

    /** Nombre único por usuario */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    /**
     * Color de la etiqueta.
     * Se guarda como string (p. ej. '#ff0000' o 'red').
     */
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#cccccc',  // color por defecto si no se envía
      validate: {
        notEmpty: true,
      }
    },
  },
  {
    tableName: 'tag',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userProfileId', 'name'],
        name: 'unique_userprofile_tagname'
      }
    ]
  }
);

// Relaciones
userProfileModel.hasMany(TagModel, { foreignKey: 'userProfileId', as: 'tags' });
TagModel.belongsTo(userProfileModel, { foreignKey: 'userProfileId', as: 'userProfile' }); 
