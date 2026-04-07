const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("authenticateToken 403: jwt.verify error:", err);
            return res.status(403).json({ message: `Invalid or expired token. Details: ${err.message}` });
        }
        req.user = user;
        next();
    });
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log("authorizeRole 403: Role mismatch. Expected one of:", roles, "got:", req.user ? req.user.role : 'none');
            return res.status(403).json({ message: `Access denied. Insufficient permissions. Role is ${req.user ? req.user.role : 'none'}` });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRole };
