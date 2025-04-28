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
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determina el subdirectorio basado en el campo del formulario
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
        subfolder = '';
    }
    // Construye el path completo: uploads/zones/<subfolder>
    const uploadPath = path.join('uploads', 'zones', subfolder);
    ensureDirectoryExistence(uploadPath);
    // Almacena el subdirectorio en el objeto file para usarlo en el callback de filename
    (file as any).subfolder = subfolder;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Usamos el nombre base original sin agregar sufijos para evitar duplicados
    const baseName = path.basename(file.originalname, ext);
    const finalFileName = `${baseName}${ext}`;

    // Recuperar el subfolder almacenado previamente en file
    const subfolder = (file as any).subfolder;
    // Construir la ruta completa donde se guardará el archivo
    const fullPath = path.join('uploads', 'zones', subfolder, finalFileName);

    // Si ya existe un archivo con ese nombre, lo eliminamos
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    cb(null, finalFileName);
  },
});

// Establece un límite de tamaño de 200 MB por archivo.
const limits = {
  fileSize: 200 * 1024 * 1024, // 200 MB en bytes
};

const uploadZone = multer({ storage, limits }).fields([
  { name: 'cityImage', maxCount: 1 },
  { name: 'zoneImage', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'modelPath', maxCount: 1 },
  { name: 'titleGlb', maxCount: 1 },
]);

export default uploadZone;
