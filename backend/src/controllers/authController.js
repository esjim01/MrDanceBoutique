import fs from 'fs/promises'; // Para usar las funciones de fs con promesas (async/await)
import path from 'path'; // Para manejar rutas de archivos de manera segura y compatible con diferentes sistemas operativos
import jwt from 'jsonwebtoken'; // Para generar y verificar tokens JWT
import bcrypt from 'bcryptjs'; // Para comparar contraseñas de texto plano con hashes almacenados (si decides usar hashes en el futuro)

const dataPath = path.resolve('src/data/usuarios.json');

export const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const usuarios = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

        // 1. Buscar usuario
        const userFound = usuarios.find(u => u.usuario === usuario);
        if (!userFound) return res.status(404).json({ message: "Usuario no existe" });

        // 2. Verificar contraseña (comparar el texto plano con el hash)
        // Por ahora, para tu prueba rápida, usaremos comparación directa o bcrypt
        //const isMatch = await bcrypt.compare(password, userFound.password);
        const isMatch = password === userFound.password;
        if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

        // 3. Generar Token
        const token = jwt.sign(
            { id: userFound.id, rol: userFound.rol },
            process.env.JWT_SECRET || 'secretotango123',
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { nombre: userFound.nombre, rol: userFound.rol }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};