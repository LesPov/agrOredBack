import { Request, Response } from 'express';
import ProductModel from '../../../../products/models/productModel';
import uploadAssets from '../../../../../infrastructure/uploadsfiles/uploadAssetsConfig';
  
export const createProductController = async (req: Request, res: Response): Promise<void> => {
  uploadAssets(req, res, async err => {
    if (err) {
      return res.status(400).json({ msg: `Error en la subida de activos: ${err.message}` });
    }
    try {
      // Archivos
      const files = req.files as Record<string, Express.Multer.File[]>;
      const imagenes = files.imagenes?.map(f => f.filename) || [];
      const videos = files.videos?.map(f => f.filename) || [];
      const modelos = files.modelos?.map(f => f.filename) || [];

      // Campos básicos
      const {
        name,
        subtitle,
        description,
        price,
        stock,

        // Campos nuevos
        unit,
        minOrder,
        deliveryTime,
        harvestDate,
        originCity,
        originRegion,
        climate,

        // Nutrición
        calories,
        proteins,
        carbohydrates,
        fats,

        // Arrays (recibidos como JSON-string o CSV)
        vitamins,
        categories,

        conservation
      } = req.body;

      // Validaciones esenciales
      if (!name || price == null) {
        return res.status(400).json({ msg: 'Los campos "name" y "price" son obligatorios.' });
      }
      if (subtitle && subtitle.length > 255) {
        return res.status(400).json({ msg: 'El "subtitle" no puede superar 255 caracteres.' });
      }

      // Parseo de userId
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ msg: 'El parámetro "id" debe ser numérico.' });
      }

      // Normalizamos arrays: si vienen como string JSON o CSV
      const parseArray = (input: any): string[] | null => {
        if (!input) return null;
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') {
          try {
            return JSON.parse(input);
          } catch {
            return input.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        return null;
      };

      const vitaminsArr = parseArray(vitamins);
      const categoriesArr = parseArray(categories);

      // Creamos el producto
      const newProduct = await ProductModel.create({
        name,
        subtitle: subtitle || null,
        description: description || null,
        price: parseFloat(price),
        image: imagenes[0] || null,
        video: videos[0] || null,
        glbFile: modelos[0] || null,
        userId,
        stock: stock != null ? parseInt(stock, 10) : 0,
        rating: 0,
        reviewCount: 0,

        // Nuevos campos
        unit: unit || 'kg',
        minOrder: minOrder != null ? parseFloat(minOrder) : 1,
        deliveryTime: deliveryTime || null,
        harvestDate: harvestDate || null,
        originCity: originCity || null,
        originRegion: originRegion || null,
        climate: (climate as any) || null,

        calories: calories != null ? parseFloat(calories) : null,
        proteins: proteins != null ? parseFloat(proteins) : null,
        carbohydrates: carbohydrates != null ? parseFloat(carbohydrates) : null,
        fats: fats != null ? parseFloat(fats) : null,

        vitamins: vitaminsArr,
        categories: categoriesArr,
        conservation: conservation || null
      });

      res.status(201).json({
        msg: 'Producto creado correctamente.',
        product: newProduct
      });

    } catch (error: any) {
      console.error("Error en createProductController:", error);
      res.status(500).json({ msg: 'Error al crear el producto.', error: error.message });
    }
  });
};
