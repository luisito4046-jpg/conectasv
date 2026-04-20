import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

// Middleware para subida de foto de perfil de usuario
export const uploadPhoto = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
    }
}).single('profile_photo');

// Middleware para subida de logo de empresa
export const uploadLogo = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
    }
}).single('company_logo');

// ✅ NUEVO: Middleware para subida de CV en PDF
export const uploadCV = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        file.mimetype === 'application/pdf'
            ? cb(null, true)
            : cb(new Error('Solo se permiten archivos PDF'), false);
    }
}).single('cv');

// Para imágenes: aplica transformación de recorte facial
export const uploadToCloudinary = (buffer, publicId, folder = 'conectasv/profiles') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                public_id:      publicId,
                transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(buffer);
    });
};

// ✅ NUEVO: Para PDFs — sin transformación de imagen, resource_type: 'raw'
export const uploadToCloudinaryRaw = (buffer, publicId, folder = 'conectasv/cvs') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                public_id:     publicId,
                resource_type: 'raw', // obligatorio para PDFs
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(buffer);
    });
};
