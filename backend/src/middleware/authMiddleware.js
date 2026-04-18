import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No hay token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretotango123');
        req.user = decoded; // Guardamos los datos del usuario en la petición
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
};