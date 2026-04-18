import { Router } from 'express';
import multer from 'multer';
// Importamos del controlador correcto y con los nombres correctos
import { 
    getGastos, 
    createGasto, 
    updateGasto, 
    deleteGasto 
} from '../controllers/gastosController.js';

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
router.get('/', getGastos);
router.post('/', upload.single('recibo'), createGasto); 
router.put('/:id', updateGasto);
router.delete('/:id', deleteGasto);

export default router;