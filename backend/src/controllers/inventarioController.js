import fs from 'fs/promises'; 
import { existsSync } from 'fs'; // Necesitamos la versión síncrona para chequeos rápidos
import path from 'path';

// Ruta al archivo JSON
const dataPath = path.resolve('src/data/inventario.json');

// Función auxiliar para leer los datos
const leerDatos = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si el archivo no existe o está vacío, retorna array vacío
    }
};

// Función auxiliar para guardar los datos
const escribirDatos = async (datos) => {
    await fs.writeFile(dataPath, JSON.stringify(datos, null, 2));
};

// --- Métodos del Controlador ---

// GET /api/inventario
export const getZapatos = async (req, res) => {
    try {
        const inventario = await leerDatos();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: "Error al leer el inventario" });
    }
};

// POST /api/inventario
export const createZapato = async (req, res) => {
    try {
        const inventario = await leerDatos();
        
        // Estructura empresarial con soporte para IMAGEN
        const nuevoZapato = {
            id: Date.now(), 
            referencia: req.body.referencia,
            categoria: req.body.categoria, 
            talla: req.body.talla, 
            color: req.body.color,
            tacon: req.body.tacon || "N/A",
            suela: req.body.suela || "N/A",
            ancho: req.body.ancho || "N/A",
            costo: Number(req.body.costo),
            precioVenta: Number(req.body.precioVenta),
            stock: Number(req.body.stock) || 0,
            // Guardamos el nombre del archivo que generó Multer
            imagen: req.file ? req.file.filename : null, 
            fechaRegistro: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false }),
            registradoPor: req.body.registradoPor || "Admin"
        };

        inventario.push(nuevoZapato);
        await escribirDatos(inventario);
        
        res.status(201).json({ message: "Zapato registrado con éxito", nuevoZapato });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar el zapato" });
    }
};

// PUT /api/inventario/:id
export const updateZapato = async (req, res) => {
    try {
        const { id } = req.params;
        let inventario = await leerDatos();
        
        const index = inventario.findIndex(z => z.id === parseInt(id));
        if (index === -1) return res.status(404).json({ message: "Zapato no encontrado" });

        // Actualizamos manteniendo el ID y la imagen previa si no se sube una nueva
        inventario[index] = { 
            ...inventario[index], 
            ...req.body, 
            id: inventario[index].id,
            ultimaEdicion: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false })
        };

        await escribirDatos(inventario);
        res.json({ message: "Zapato actualizado", zapato: inventario[index] });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};

// DELETE /api/inventario/:id
export const deleteZapato = async (req, res) => {
    try {
        const { id } = req.params;
        let inventario = await leerDatos();
        
        const zapatoAEliminar = inventario.find(z => z.id === parseInt(id));
        
        if (!zapatoAEliminar) {
            return res.status(404).json({ message: "Zapato no encontrado" });
        }

        // --- BORRADO FÍSICO DE LA IMAGEN ---
        if (zapatoAEliminar.imagen) {
            const rutaImagen = path.resolve('uploads', zapatoAEliminar.imagen);
            // Verificamos si el archivo existe antes de intentar borrarlo
            if (existsSync(rutaImagen)) {
                await fs.unlink(rutaImagen); 
                console.log(`Archivo borrado: ${zapatoAEliminar.imagen}`);
            }
        }

        // Filtramos el JSON
        const nuevoInventario = inventario.filter(z => z.id !== parseInt(id));
        await escribirDatos(nuevoInventario);
        
        res.json({ message: "Zapato e imagen eliminados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el producto o su imagen" });
    }
};