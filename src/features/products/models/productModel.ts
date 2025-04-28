import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/connection';
import { AuthModel } from '../../auth/models/authModel';
 
export interface ProductInterface extends Model {
  id?: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  image?: string | null;
  glbFile?: string | null;
  video?: string | null;
  userId: number;
  stock: number;
  rating: number;
  reviewCount: number;

  // Nuevos campos
  unit: string;                   // p.ej. "kg"
  minOrder: number;               // pedido mínimo
  deliveryTime?: string | null;   // p.ej. "1-3 días"
  harvestDate?: string | null;    // DATEONLY


  // Información nutricional
  calories?: number | null;       // kcal
  proteins?: number | null;       // g
  carbohydrates?: number | null;  // g
  fats?: number | null;           // g

  // Vitaminas (array de strings)
  vitamins?: string[] | null;

  // Categorías (array de strings)
  categories?: string[] | null; 

  // Instrucciones de conservación
  conservation?: string | null;
}

export const ProductModel = sequelize.define<ProductInterface>(
  'product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 255] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('price');
        return raw === null ? null : parseFloat(raw as unknown as string);
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    glbFile: {
      type: DataTypes.STRING,
      allowNull: true,
    }, 
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'auth', key: 'id' },
    },
    stock: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // ——— Campos nuevos ———
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'kg',
      comment: 'Unidad de venta, ej. kg, unidad, paquete'
    },
    minOrder: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
      comment: 'Cantidad mínima de pedido'
    },
    deliveryTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Tiempo estimado de entrega'
    },
    harvestDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de cosecha'
    },


    // Nutrición
    calories: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Valor energético (kcal)'
    },
    proteins: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Proteínas (g)'
    },
    carbohydrates: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Carbohidratos (g)' 
    },
    fats: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Grasas (g)'
    },

    vitamins: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de vitaminas (array de strings)'
    },
    categories: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de categorías (array de strings)'
    },

    conservation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones de conservación'
    }
  },
  {
    tableName: 'product',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'name'] },
    ],
  }
);

// Relaciones con AuthModel
AuthModel.hasMany(ProductModel, { foreignKey: 'userId', as: 'products' });
ProductModel.belongsTo(AuthModel, { foreignKey: 'userId' });

export default ProductModel;
