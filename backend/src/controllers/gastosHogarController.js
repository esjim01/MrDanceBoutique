import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegúrate de que esta ruta apunte correctamente a donde guardas tus JSON
// Si tus JSON están en la raíz del proyecto, usa esto:
const gastosHogarFilePath = path.join(__dirname, '../gastos_hogar.json');

// Función auxiliar para leer el archivo JSON
const readGastosHogar = () => {
    if (!fs.existsSync(gastosHogarFilePath)) return [];
    const data = fs.readFileSync(gastosHogarFilePath, 'utf8');
    return JSON.parse(data);
};

// Función auxiliar para guardar en el archivo JSON
const writeGastosHogar = (data) => {
    fs.writeFileSync(gastosHogarFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// 1. Obtener todos los gastos del hogar
export const getGastosHogar = (req, res) => {
    try {
        const gastos = readGastosHogar();
        res.json(gastos);
    } catch (error) {
        res.status(500).json({ message: 'Error al leer los gastos del hogar', error });
    }
};

// 2. Crear un nuevo gasto del hogar
export const createGastoHogar = (req, res) => {
    try {
        const gastos = readGastosHogar();
        const nuevoGasto = req.body;
        
        gastos.push(nuevoGasto);
        writeGastosHogar(gastos);
        
        res.status(201).json({ message: 'Gasto del hogar registrado con éxito', gasto: nuevoGasto });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar el gasto del hogar', error });
    }
};

// 3. Eliminar un gasto del hogar
export const deleteGastoHogar = (req, res) => {
    try {
        const gastos = readGastosHogar();
        const id = parseInt(req.params.id);
        
        const gastosFiltrados = gastos.filter(g => g.id !== id);
        
        if (gastos.length === gastosFiltrados.length) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        writeGastosHogar(gastosFiltrados);
        res.json({ message: 'Gasto del hogar eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el gasto del hogar', error });
    }
};

// 4. Actualizar un gasto del hogar
export const updateGastoHogar = (req, res) => {
    try {
        const gastos = readGastosHogar();
        const id = parseInt(req.params.id);
        const index = gastos.findIndex(g => g.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        // Mantenemos el ID original y actualizamos los demás campos
        gastos[index] = { ...gastos[index], ...req.body, id: id };
        writeGastosHogar(gastos);

        res.json({ message: 'Gasto actualizado con éxito', gasto: gastos[index] });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el gasto', error });
    }
};