import express from 'express';
// Agregamos updateGastoHogar a la importación
import { getGastosHogar, createGastoHogar, deleteGastoHogar, updateGastoHogar } from '../controllers/gastosHogarController.js';

const router = express.Router();

router.get('/', getGastosHogar);
router.post('/', createGastoHogar);
router.delete('/:id', deleteGastoHogar);
// NUEVA RUTA PARA EDITAR
router.put('/:id', updateGastoHogar);

export default router;