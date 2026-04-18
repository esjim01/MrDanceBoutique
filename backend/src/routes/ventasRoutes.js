import { Router } from 'express';
import { getVentas, createVenta, deleteVenta } from '../controllers/ventasController.js';

const router = Router();

// Rutas de ventas
router.get('/', getVentas);
router.post('/', createVenta);
router.delete('/:id', deleteVenta);

export default router;