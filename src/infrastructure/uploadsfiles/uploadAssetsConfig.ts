// uploadAssetsConfig.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Verifica si el directorio existe y, si no, lo crea.
 * @param dir - Directorio de destino.
 */
const ensureDirectoryExistence = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
};

/**
 * Sanitiza un nombre de archivo para hacerlo seguro para el sistema de archivos.
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales por guiones.
 * @param filename - Nombre de archivo original.
 * @returns Nombre de archivo sanitizado.
 */
const sanitizeFilename = (filename: string): string => {
  if (!filename) return `archivo-${Date.now()}`; // Nombre por defecto si está vacío

  // 1. Decodificar URI component por si viene codificado (ej: %20 por espacio)
  const decodedFilename = decodeURIComponent(filename);

  // 2. Convertir a minúsculas
  let sanitized = decodedFilename.toLowerCase();

  // 3. Reemplazar caracteres acentuados por sus equivalentes sin acento
  sanitized = sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 4. Reemplazar espacios y caracteres no alfanuméricos (excepto punto y guion) por guiones
  sanitized = sanitized.replace(/[^a-z0-9.\-]/g, '-');

  // 5. Reemplazar múltiples guiones seguidos por uno solo
  sanitized = sanitized.replace(/-+/g, '-');

  // 6. Quitar guiones al principio o al final (antes de la extensión)
  const ext = path.extname(sanitized);
  let base = path.basename(sanitized, ext);
  base = base.replace(/^-+|-+$/g, '');

  // 7. Asegurar que no quede vacío el nombre base
  if (!base) {
    base = `archivo-${Date.now()}`;
  }

  return `${base}${ext}`;
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = '';
    // Usar un mapeo para evitar repetir la lógica
    const fieldSubfolderMap: { [key: string]: string } = {
      'imagenes': 'imagenes',
      'videos': 'videos',
      'modelos': 'modelos'
    };
    subfolder = fieldSubfolderMap[file.fieldname] || 'otros'; // 'otros' como fallback

    const uploadPath = path.join('uploads', 'productos', subfolder);
    ensureDirectoryExistence(uploadPath);

    // Guardamos la ruta completa para usarla en filename si es necesario
    (file as any).uploadPath = uploadPath;

    console.log(`Destino para ${file.originalname} (${file.fieldname}): ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 1. Sanitizar el nombre original del archivo
    const sanitized = sanitizeFilename(file.originalname);

    // 2. Construir la ruta completa donde se guardaría el archivo
    const destinationPath = (file as any).uploadPath; // Obtenido de la función destination
    const fullPath = path.join(destinationPath, sanitized);

    // 3. Comprobar si el archivo ya existe (opcional, Multer sobrescribe por defecto)
    //    Podrías añadir lógica aquí si NO quisieras sobrescribir.
    if (fs.existsSync(fullPath)) {
      console.log(`Archivo existente encontrado: ${fullPath}. Será sobrescrito.`);
      // Opcional: podrías generar un nombre único si NO quieres sobrescribir:
      // const ext = path.extname(sanitized);
      // const baseName = path.basename(sanitized, ext);
      // sanitized = `${baseName}-${Date.now()}${ext}`;
    } else {
      console.log(`Archivo no existente. Se guardará como: ${fullPath}`);
    }

    // 4. Devolver el nombre de archivo sanitizado (sin timestamp)
    console.log(`Nombre final para ${file.originalname}: ${sanitized}`);
    cb(null, sanitized);
  },
});

const limits = {
  fileSize: 50 * 1024 * 1024, // 50 MB
};

const uploadAssets = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    // Opcional: Añadir filtro por tipo de archivo si es necesario
    // Ejemplo: Permitir solo ciertas extensiones de imagen
    if (file.fieldname === 'imagenes') {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`Error: Tipo de archivo no permitido para imágenes (${file.originalname})`));
    } else if (file.fieldname === 'modelos') {
        const allowedTypes = /gltf|glb/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
         if (extname) { // GLB no tiene un mimetype estándar universal
            return cb(null, true);
        }
         cb(new Error(`Error: Tipo de archivo no permitido para modelos (${file.originalname})`));
    } else {
       // Añadir más validaciones para videos u otros tipos si es necesario
       return cb(null, true); // Permitir otros por defecto (o añadir validación)
    }
  }
}).fields([
  { name: 'imagenes', maxCount: 5 }, // Aumentado a 5 por ejemplo
  { name: 'videos', maxCount: 2 },
  { name: 'modelos', maxCount: 2 },
]);

export default uploadAssets;