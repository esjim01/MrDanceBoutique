import fs from 'fs/promises'; 
import { existsSync } from 'fs'; 
import path from 'path';

// Ruta al archivo JSON de Gastos
const dataPath = path.resolve('src/data/gastos.json');

// Función auxiliar para leer los datos
const leerDatos = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si no existe el archivo, devuelve un array vacío
    }
};

// Función auxiliar para guardar los datos
const escribirDatos = async (datos) => {
    await fs.writeFile(dataPath, JSON.stringify(datos, null, 2));
};

// --- Métodos del Controlador ---

// GET /api/gastos
export const getGastos = async (req, res) => {
    try {
        const gastos = await leerDatos();
        res.json(gastos);
    } catch (error) {
        res.status(500).json({ message: "Error al leer los gastos" });
    }
};

// POST /api/gastos
export const createGasto = async (req, res) => {
    try {
        const gastos = await leerDatos();
        
        const nuevoGasto = {
            id: Date.now(), 
            concepto: req.body.concepto,
            categoria: req.body.categoria, 
            fechaGasto: req.body.fechaGasto, 
            valor: Number(req.body.valor), // Convertimos a número
            recibo: req.file ? req.file.filename : null, // Guardamos nombre del archivo si existe
            fechaRegistro: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false }),
            registradoPor: req.body.registradoPor || "Admin"
        };

        gastos.push(nuevoGasto);
        await escribirDatos(gastos);
        
        res.status(201).json({ message: "Gasto registrado con éxito", nuevoGasto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar el gasto" });
    }
};

// PUT /api/gastos/:id
export const updateGasto = async (req, res) => {
    try {
        const { id } = req.params;
        let gastos = await leerDatos();
        
        const index = gastos.findIndex(g => g.id === parseInt(id));
        if (index === -1) return res.status(404).json({ message: "Gasto no encontrado" });

        gastos[index] = { 
            ...gastos[index], 
            ...req.body, 
            id: gastos[index].id,
            ultimaEdicion: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false })
        };

        await escribirDatos(gastos);
        res.json({ message: "Gasto actualizado", gasto: gastos[index] });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};

// DELETE /api/gastos/:id
export const deleteGasto = async (req, res) => {
    try {
        const { id } = req.params;
        let gastos = await leerDatos();
        
        const gastoAEliminar = gastos.find(g => g.id === parseInt(id));
        
        if (!gastoAEliminar) {
            return res.status(404).json({ message: "Gasto no encontrado" });
        }

        // --- BORRADO FÍSICO DEL RECIBO ---
        if (gastoAEliminar.recibo) {
            const rutaRecibo = path.resolve('uploads', gastoAEliminar.recibo);
            if (existsSync(rutaRecibo)) {
                await fs.unlink(rutaRecibo); 
                console.log(`Recibo borrado: ${gastoAEliminar.recibo}`);
            }
        }

        const nuevosGastos = gastos.filter(g => g.id !== parseInt(id));
        await escribirDatos(nuevosGastos);
        
        res.json({ message: "Gasto y recibo eliminados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el gasto o su recibo" });
    }
};