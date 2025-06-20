import { DataTypes, Model } from "sequelize";
import sequelize from "../../../infrastructure/database/connection";

/**
 * Interfaz para la Zona (Versión Mejorada).
 * Define una estructura jerárquica clara: Departamento -> Municipio -> Vereda.
 */
export interface ZoneInterface extends Model {
  id?: number;
  departamento: string;    // Nombre del departamento. Es un campo obligatorio.
  municipio: string;       // Nombre del municipio. Es un campo obligatorio.
  vereda?: string;         // Nombre de la vereda, quebrada o zona específica. Es opcional.

  // Campos visuales y descriptivos que se mantienen
  cityImage?: string;      // URL o path de la imagen representativa del municipio/ciudad
  zoneImage?: string;      // URL o path de la imagen específica de la vereda/zona
  description?: string;    // Descripción general de la zona
  about?: string;          // Texto adicional "acerca de" la zona 
  climate?: 'frio' | 'calido';

  // Campos para activos multimedia y 3D
  video?: string;          // Ruta o URL del video asociado a la zona
  modelPath?: string;      // Ruta o URL del modelo 3D (terreno) de la zona
  titleGlb?: string;       // Ruta o URL del archivo .glb para el título u otro asset 3D

  // Campos de datos geográficos/climáticos
  elevation?: number;      // Elevación promedio en metros sobre el nivel del mar
  temperature?: number;    // Temperatura promedio en grados Celsius
}

/**
 * Modelo de Zona (Versión Mejorada).
 * Representa la tabla "zone" con una estructura territorial jerárquica.
 * Se elimina 'tipoZona' y se reemplaza 'name' por campos específicos.
 */
export const ZoneModel = sequelize.define<ZoneInterface>('zone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del departamento al que pertenece la zona.',
    unique: 'unique_location' // Parte de la nueva clave única combinada
  },
  municipio: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del municipio al que pertenece la zona.',
    unique: 'unique_location' // Parte de la nueva clave única combinada
  },
  vereda: {
    type: DataTypes.STRING,
    allowNull: true, // Se permite nulo para representar una zona a nivel de municipio
    comment: 'Nombre de la vereda, corregimiento, quebrada, etc. Es opcional.',
    unique: 'unique_location' // Parte de la nueva clave única combinada
  },
  cityImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o ruta de la imagen del municipio'
  },
  zoneImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o ruta de la imagen específica de la vereda o zona'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Texto adicional o sección "acerca de" la zona'
  },
  climate: {
    type: DataTypes.ENUM('frio', 'calido'),
    allowNull: true,
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del video asociado a la zona'
  },
  modelPath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del modelo 3D (terreno) de la zona'
  },
  titleGlb: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del archivo .glb para un título 3D u otro asset'
  },
  elevation: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Elevación promedio en metros sobre el nivel del mar'
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Temperatura promedio en grados Celsius'
  }
}, {
  tableName: 'zone',
  timestamps: true, // Mantiene createdAt y updatedAt
  comment: 'Tabla para almacenar información territorial de forma jerárquica (Departamento, Municipio, Vereda).'
}); 