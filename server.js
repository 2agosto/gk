const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
// CORS permite que el script (que está en otra página web) se conecte a este servidor
app.use(cors());

// Base de datos en memoria (Guarda las keys temporalmente)
const validKeys = new Map();

// 1. RUTA PARA GENERAR KEYS (Solo tú la usas)
// Ejemplo de uso en el navegador: https://tu-app.onrender.com/generate?admin_pass=Mopekora123
app.get('/generate', (req, res) => {
    const adminPass = req.query.admin_pass;
    
    // CAMBIA ESTO por tu propia contraseña secreta
    if (adminPass !== 'Mopekora123') {
        return res.status(403).json({ error: 'No autorizado' });
    }

    // Genera una key aleatoria. Ejemplo: MOP-A1B2C3D4
    const newKey = 'MOP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Expira en 9 horas
    const duration = 9 * 60 * 60 * 1000; 
    const expiresAt = Date.now() + duration;

    // Guardar en la base de datos temporal
    validKeys.set(newKey, expiresAt);

    res.json({ 
        message: 'Key generada con éxito',
        key: newKey, 
        expiresAt: expiresAt 
    });
});

// 2. RUTA PARA VERIFICAR LA KEY (La usa el Script de Tampermonkey)
app.get('/verify', (req, res) => {
    const userKey = req.query.key;

    if (!userKey || !validKeys.has(userKey)) {
        return res.json({ valid: false, message: 'Invalid or missing key' });
    }

    const expiresAt = validKeys.get(userKey);

    // Comprobar si ya pasó el tiempo
    if (Date.now() > expiresAt) {
        validKeys.delete(userKey); // Borrar key caducada
        return res.json({ valid: false, message: 'Key expired' });
    }

    res.json({ valid: true, expiresAt: expiresAt });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});