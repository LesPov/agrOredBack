// models/userProfileModel.ts
import { DataTypes } from "sequelize";

import { UserProfileinterface } from "../interfaces/userProfileInterface";
import sequelize from "../../../infrastructure/database/connection";
import { AuthModel } from "../../auth/models/authModel";
import { ZoneModel } from "../../zones/models/zoneModel";

export const userProfileModel = sequelize.define<UserProfileinterface>('userProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'auth',
      key: 'id',
    },
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  identificationType: {
    type: DataTypes.ENUM(
      'Cédula',
      'Tarjeta de Identidad',
      'DNI',
      'Pasaporte',
      'Licencia de Conducir',
      'Otro'
    ),
    allowNull: false,
  },
  identificationNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  biography: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('Mujer', 'Hombre', 'Otro género', 'Prefiero no declarar'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  campiamigo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // Nueva columna para relacionar el perfil con una zona
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: ZoneModel,
      key: 'id',
    },
  },
}, {
  tableName: 'userProfile',
  timestamps: true,
});

// Relación entre Auth y UserProfile
AuthModel.hasOne(userProfileModel, { foreignKey: 'userId' });
userProfileModel.belongsTo(AuthModel, { foreignKey: 'userId' });

// Relación entre Zone y UserProfile
ZoneModel.hasMany(userProfileModel, { foreignKey: 'zoneId' });
userProfileModel.belongsTo(ZoneModel, { foreignKey: 'zoneId' });