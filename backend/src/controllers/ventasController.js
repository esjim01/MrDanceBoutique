import fs from 'fs/promises';
import path from 'path';

// Necesitamos acceder tanto a ventas como a inventario
const ventasPath = path.resolve('src/data/ventas.json');
const inventarioPath = path.resolve('src/data/inventario.json');

// Función genérica para leer cualquier JSON
const leerDatos = async (ruta) => {
    try {
        const data = await fs.readFile(ruta, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Función genérica para guardar cualquier JSON
const escribirDatos = async (ruta, datos) => {
    await fs.writeFile(ruta, JSON.stringify(datos, null, 2));
};

// --- GET: OBTENER TODAS LAS VENTAS ---
export const getVentas = async (req, res) => {
    try {
        const ventas = await leerDatos(ventasPath);
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: "Error al leer las ventas" });
    }
};

// --- POST: CREAR VENTA Y DESCONTAR INVENTARIO ---
export const createVenta = async (req, res) => {
    try {
        let ventas = await leerDatos(ventasPath);
        let inventario = await leerDatos(inventarioPath);

        const nuevaVenta = {
            id: Date.now(),
            fechaHora: req.body.fechaHora,
            productos: req.body.productos, // Array del carrito
            total: Number(req.body.total)
        };

        // 1. DESCONTAR DEL INVENTARIO
        req.body.productos.forEach(itemVendido => {
            const indexProducto = inventario.findIndex(p => p.id === itemVendido.id);
            if (indexProducto !== -1) {
                // Restamos la cantidad vendida al stock actual
                inventario[indexProducto].stock = Number(inventario[indexProducto].stock) - Number(itemVendido.cantidad);
            }
        });

        // 2. GUARDAR LOS CAMBIOS EN AMBOS ARCHIVOS
        ventas.push(nuevaVenta);
        await escribirDatos(ventasPath, ventas);
        await escribirDatos(inventarioPath, inventario);

        res.status(201).json({ message: "Venta registrada y stock actualizado", nuevaVenta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar la venta" });
    }
};

// --- DELETE: ANULAR VENTA Y DEVOLVER INVENTARIO ---
export const deleteVenta = async (req, res) => {
    try {
        const idVenta = parseInt(req.params.id);
        let ventas = await leerDatos(ventasPath);
        let inventario = await leerDatos(inventarioPath);

        const ventaAnulada = ventas.find(v => v.id === idVenta);
        
        if (!ventaAnulada) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // 1. DEVOLVER EL STOCK AL INVENTARIO
        ventaAnulada.productos.forEach(itemDevuelto => {
            const indexProducto = inventario.findIndex(p => p.id === itemDevuelto.id);
            if (indexProducto !== -1) {
                // Sumamos la cantidad devuelta al stock actual
                inventario[indexProducto].stock = Number(inventario[indexProducto].stock) + Number(itemDevuelto.cantidad);
            }
        });

        // 2. ELIMINAR LA VENTA DEL REGISTRO
        ventas = ventas.filter(v => v.id !== idVenta);

        // 3. GUARDAR CAMBIOS EN AMBOS ARCHIVOS
        await escribirDatos(ventasPath, ventas);
        await escribirDatos(inventarioPath, inventario);

        res.json({ message: "Venta anulada y productos devueltos al inventario" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al anular la venta" });
    }
};