import { DataTypes, Model } from "sequelize";
import sequelize from "../../../infrastructure/database/connection";
 
/**
 * Interfaz para la Zona.
 * Incluye todos los campos, incluyendo los nuevos.
 */
export interface ZoneInterface extends Model {
  id?: number;
  name: string;            // Nombre del pueblo, municipio o zona
  departamentoName?: string;       // Nombre del departamento o ciudad (opcional)
  cityImage?: string;      // URL o path de la imagen de la ciudad (opcional)
  zoneImage?: string;      // URL o path de la imagen representativa de la zona (opcional)
  tipoZona: 'municipio' | 'departamento' | 'vereda' | 'ciudad';
  description?: string;
  climate?: 'frio' | 'calido';

  // Campos para los activos
  video?: string;          // Ruta o URL del video asociado a la zona
  modelPath?: string;      // Ruta o URL del modelo 3D (terreno) de la zona
  titleGlb?: string;       // Ruta o URL del archivo .glb para el título u otro asset 3D

  // --- NUEVOS CAMPOS ---
  elevation?: number;      // Elevación promedio en metros sobre el nivel del mar (opcional)
  temperature?: number;    // Temperatura promedio en grados Celsius (opcional)
  about?: string;          // Texto adicional "acerca de" la zona (opcional)
}


/**
 * Modelo de Zona.
 * Representa la tabla "zone" donde se almacena la información territorial.
 * Incluye los nuevos campos: elevation, temperature, about.
 */ 
export const ZoneModel = sequelize.define<ZoneInterface>('zone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_zone_departamento' // Mantiene la unicidad combinada
  },
  departamentoName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del departamento o ciudad relacionado con la zona',
    unique: 'unique_zone_departamento' // Mantiene la unicidad combinada
  },
  cityImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o ruta de la imagen de la ciudad'
  },
  zoneImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o ruta de la imagen representativa de la zona'
  },
  tipoZona: {
    type: DataTypes.ENUM('municipio', 'departamento', 'vereda', 'ciudad'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT, // TEXT es mejor para descripciones potencialmente largas
    allowNull: true,
  },
  climate: {
    type: DataTypes.ENUM('frio', 'calido'),
    allowNull: true,
  },
  // Campos para los activos
  video: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del video asociado a la zona'
  },
  modelPath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del modelo 3D (terreno) asociado a la zona'
  },
  titleGlb: {
    type: DataTypes.STRING, 
    allowNull: true,
    comment: 'Ruta o URL del archivo .glb para el título u otro asset 3D'
  },

  // --- NUEVOS CAMPOS ---
  elevation: {
    type: DataTypes.FLOAT, // Usamos FLOAT para permitir decimales (e.g., 1500.5 metros)
    allowNull: true,
    comment: 'Elevación promedio de la zona en metros sobre el nivel del mar' 
  },
  temperature: {
    type: DataTypes.FLOAT, // Usamos FLOAT para permitir decimales (e.g., 22.5 grados)
    allowNull: true,
    comment: 'Temperatura promedio de la zona en grados Celsius'
  },
  about: {
    type: DataTypes.TEXT, // Usamos TEXT por si el contenido es extenso
    allowNull: true,
    comment: 'Texto adicional o sección "acerca de" la zona'
  }
}, {
  tableName: 'zone',
  timestamps: true, // Mantiene las columnas createdAt y updatedAt
});