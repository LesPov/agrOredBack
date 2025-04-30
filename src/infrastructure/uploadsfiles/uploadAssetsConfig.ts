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
    console.log(`[Uploads] Directorio creado: ${dir}`);
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

  const decodedFilename = decodeURIComponent(filename);
  let sanitized = decodedFilename.toLowerCase();
  sanitized = sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  sanitized = sanitized.replace(/[^a-z0-9.\-]/g, '-');
  sanitized = sanitized.replace(/-+/g, '-');

  const ext = path.extname(sanitized);
  let base = path.basename(sanitized, ext);
  base = base.replace(/^-+|-+$/g, '');

  if (!base) {
    base = `archivo-${Date.now()}`;
  }

  return `${base}${ext}`;
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = '';
    const fieldSubfolderMap: { [key: string]: string } = {
      'imagenes': 'imagenes',
      'videos': 'videos',
      'modelos': 'modelos'
      // Puedes añadir más mapeos si tienes otros tipos de archivos/campos
    };
    subfolder = fieldSubfolderMap[file.fieldname] || 'otros';

    // Asegúrate que la ruta base sea correcta para los productos
    const uploadPath = path.join('uploads', 'productos', subfolder);
    ensureDirectoryExistence(uploadPath);

    // Guardamos la ruta para usarla en filename
    (file as any).uploadPath = uploadPath;

    console.log(`[Uploads] Destino para ${file.originalname} (${file.fieldname}): ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 1. Sanitizar el nombre original del archivo
    const sanitizedFilename = sanitizeFilename(file.originalname);

    // 2. Construir la ruta completa donde se guardaría el archivo
    const destinationPath = (file as any).uploadPath; // Obtenido de la función destination
    if (!destinationPath) {
        // Manejo de error si uploadPath no se estableció correctamente
        return cb(new Error('Error interno: La ruta de destino no está definida.'), '');
    }
    const fullPath = path.join(destinationPath, sanitizedFilename);

    // --- Lógica Clave: Prevenir Guardado si ya Existe ---
    // 3. Comprobar si ya existe un archivo con ESE nombre sanitizado en ESE destino
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (!err) {
        // ¡El archivo SÍ existe! No queremos sobrescribir.
        console.warn(`[Uploads] Conflicto: El archivo '${sanitizedFilename}' ya existe en '${destinationPath}'. Subida cancelada para este archivo.`);
        // Llamamos al callback con un error específico para indicar el conflicto.
        // El controlador que usa 'uploadAssets' recibirá este error.
        // IMPORTANTE: Pasamos un segundo argumento vacío o un nombre inválido para asegurarnos que Multer no intente usarlo.
        // Pasar solo el error es la forma más clara según la documentación de Multer para detener el guardado desde filename.
         cb(new Error(`UPLOAD_CONFLICT: El archivo '${sanitizedFilename}' ya existe.`), '');
      } else {
        // El archivo NO existe (o hubo otro error de acceso, pero F_OK solo chequea existencia). Procedemos a guardar.
        console.log(`[Uploads] Archivo '${sanitizedFilename}' no encontrado en destino. Se guardará.`);
        // Devolver el nombre de archivo sanitizado para que Multer lo use.
        cb(null, sanitizedFilename);
      }
    });
    // --- Fin Lógica Clave ---
  },
});

const limits = {
  fileSize: 50 * 1024 * 1024, // 50 MB
};

const uploadAssets = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    // La validación de tipo de archivo sigue igual
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
         if (extname) {
            return cb(null, true);
        }
         cb(new Error(`Error: Tipo de archivo no permitido para modelos (${file.originalname})`));
    } else if (file.fieldname === 'videos') {
        const allowedTypes = /mp4|mov|avi|webm/; // Asegúrate que estos son los que quieres
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`Tipo de archivo no permitido para videos: ${file.originalname}`));
    }
    else {
       // Por defecto, podrías rechazar campos no esperados
       console.warn(`[Uploads] Campo de archivo no manejado explícitamente: ${file.fieldname}. Rechazado.`);
       cb(null, false); // Rechazar archivo si el fieldname no coincide con los esperados
       // O si prefieres permitir otros: cb(null, true);
    }
  }
}).fields([
  // La definición de campos sigue igual
  { name: 'imagenes', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'modelos', maxCount: 2 },
]);

export default uploadAssets;