const jwt = require('jsonwebtoken');
const envVars = require('../../env-vars');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, envVars.jwtKey);
        req.userData = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({message: 'Auth failed'});
    }
}