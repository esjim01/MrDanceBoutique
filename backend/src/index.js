import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Importamos las rutas 
import inventarioRoutes from './routes/inventarioRoutes.js';
import authRoutes from './routes/authRoutes.js';   
import gastosRoutes from './routes/gastosRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import gastosHogarRoutes from './routes/gastosHogarRoutes.js'; // <-- NUEVA RUTA IMPORTADA

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json()); 

// Hacer la carpeta "uploads" pública
app.use('/uploads', express.static('uploads'));

// Asegurarse de que la carpeta uploads exista
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Rutas
app.use('/api/inventario', inventarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/gastos-hogar', gastosHogarRoutes); // <-- NUEVA RUTA ACTIVADA

app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'Servidor operando 👞' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});