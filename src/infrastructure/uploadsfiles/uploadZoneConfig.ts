import path from 'path';
import fs from 'fs';
import multer from 'multer';

/** Mapea cada fieldname a su subcarpeta */
const subfolderMap: Record<string, string> = {
  cityImage: 'images',
  zoneImage: 'images',
  video:    'videos',
  modelPath:'models',
  titleGlb: 'models',
};

/** Asegura que exista un directorio */
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/** Filtro para rechazar duplicados */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const sub = subfolderMap[file.fieldname] || 'unknown';
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const destDir = path.resolve(process.cwd(), 'uploads', 'zones', sub);
  ensureDir(destDir);

  const fullPath = path.join(destDir, `${base}${ext}`);
  if (fs.existsSync(fullPath)) {
    console.log(`[Multer] Archivo duplicado detectado, se omite: ${base}${ext}`);
    // Rechaza la subida silenciosamente (no se guarda ni sobreescribe)
    return cb(null, false);
  } 
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = subfolderMap[file.fieldname] || 'unknown';
    const dir = path.resolve(process.cwd(), 'uploads', 'zones', sub);
    ensureDir(dir);
    // Guardamos el subfolder en file para usarlo luego si quieres
    (file as any).subfolder = sub;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Usamos siempre el nombre original, saneado, sin timestamps
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalName = `${base}${ext}`;
    console.log(`[Multer] Guardando: ${finalName}`);
    cb(null, finalName);
  }
});

export const limits = {
  fileSize: 200 * 1024 * 1024, // 200 MB
};

const uploadZone = multer({
  storage,
  limits,
  fileFilter,
}).fields([
  { name: 'cityImage', maxCount: 1 },
  { name: 'zoneImage', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'modelPath', maxCount: 1 },
  { name: 'titleGlb', maxCount: 1 },
]);

export default uploadZone;
