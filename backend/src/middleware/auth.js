const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token erro de formato' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'suachavesecretaaqui123', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }

            req.usuarioId = decoded.id;
            req.usuarioCategoria = decoded.categoria;
            return next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Erro na autenticação' });
    }
};