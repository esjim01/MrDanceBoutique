import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
    getZapatos, 
    createZapato, 
    updateZapato, 
    deleteZapato 
} from '../controllers/inventarioController.js';

const router = Router();

// Configuración de Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Definición de Rutas
router.get('/', getZapatos);

// Aquí permitimos que createZapato reciba la imagen
router.post('/', upload.single('imagen'), createZapato); 

router.put('/:id', updateZapato);
router.delete('/:id', deleteZapato);

export default router;