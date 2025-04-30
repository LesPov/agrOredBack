import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Asegura que el directorio de destino exista.
 * @param dir - Directorio que se verificará o creará.
 */
const ensureDirectoryExistence = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[Multer] Directorio creado: ${dir}`); // Log útil
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = '';
    switch (file.fieldname) {
      case 'cityImage':
      case 'zoneImage':
        subfolder = 'images';
        break;
      case 'video':
        subfolder = 'videos';
        break;
      case 'modelPath':
      case 'titleGlb':
        subfolder = 'models';
        break;
      default:
        subfolder = 'unknown'; // Es bueno tener un default por si acaso
        console.warn(`[Multer] Fieldname no esperado recibido: ${file.fieldname}`);
    }
    const uploadPath = path.resolve(process.cwd(), 'uploads', 'zones', subfolder); // Usar resolve para rutas absolutas más seguras
    ensureDirectoryExistence(uploadPath);
    // Almacena el subdirectorio en el objeto file para usarlo en el callback de filename
    (file as any).subfolder = subfolder;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Usamos el nombre base original sin agregar sufijos para evitar duplicados
    const baseName = path.basename(file.originalname, ext);
    // Considerar sanitizar el nombre del archivo para evitar caracteres problemáticos
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFileName = `${sanitizedBaseName}-${Date.now()}${ext}`; // Añadir timestamp para evitar colisiones si se sube rápido el mismo nombre

    const subfolder = (file as any).subfolder || 'unknown'; // Recuperar subfolder, con fallback
    const fullPath = path.resolve(process.cwd(), 'uploads', 'zones', subfolder, finalFileName);

    // Ya no es necesario eliminar si el nombre tiene timestamp, pero lo dejamos por si quitas el timestamp
    // if (fs.existsSync(fullPath)) {
    //   console.warn(`[Multer] Sobrescribiendo archivo existente: ${fullPath}`);
    //   fs.unlinkSync(fullPath);
    // }

    console.log(`[Multer] Guardando archivo como: ${finalFileName} en subcarpeta ${subfolder}`);
    cb(null, finalFileName);
  },
});

// --- EXPORTA LA CONSTANTE 'limits' ---
export const limits = {
  fileSize: 200 * 1024 * 1024, // 200 MB en bytes
};
console.log(`[Multer] Configurado con límite de tamaño de archivo: ${limits.fileSize / (1024 * 1024)} MB`);

// El middleware de Multer se configura usando la constante local 'limits'
const uploadZone = multer({
   storage,
   limits,
   fileFilter: (req, file, cb) => { // Añadir un filtro básico si quieres restringir tipos
    console.log(`[Multer] Filtrando archivo: ${file.originalname}, mimetype: ${file.mimetype}, fieldname: ${file.fieldname}`);
    // Ejemplo: Permitir solo imágenes, videos y modelos GLB/GLTF (ajusta según necesites)
    // const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'model/gltf-binary', 'model/gltf+json'];
    // if (allowedMimes.includes(file.mimetype)) {
    //   cb(null, true);
    // } else {
    //   console.warn(`[Multer] Tipo de archivo no permitido: ${file.mimetype}`);
    //   cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    // }
     cb(null, true); // Por ahora, permitir todos los tipos que lleguen
   }
  }).fields([
  { name: 'cityImage', maxCount: 1 },
  { name: 'zoneImage', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'modelPath', maxCount: 1 }, // Asumiendo que modelPath es un archivo .glb o similar
  { name: 'titleGlb', maxCount: 1 },
]);

// Exporta el middleware como default
export default uploadZone;