const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Memoria de keys y tokens de sesión temporales
const validKeys = new Map();
const activeSessions = new Set(); 

// ==========================================
// ⚙️ CONFIGURACIÓN DE TU SISTEMA ⚙️
// ==========================================
const ADMIN_PASSWORD = "Mopekora123";
const URL_CORTADOR = "https://link-hub.net/4821764/AtD2TVNl16mK"; 
const TIEMPO_KEY_HORAS = 9; 
// ==========================================

// 1. PÁGINA PRINCIPAL (Punto de entrada obligatorio)
app.get('/', (req, res) => {
    // Generamos un ID de sesión único para este usuario
    const sessionId = crypto.randomBytes(16).toString('hex');
    activeSessions.add(sessionId);
    
    // Eliminamos el ID después de 10 minutos si no lo usa
    setTimeout(() => activeSessions.delete(sessionId), 10 * 60 * 1000);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>MOPEKORA SYSTEM</title>
            <style>
                body { background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #333; padding: 40px; text-align: center; background: #0a0a0a; width: 320px; border-radius: 10px; }
                button { background: #fff; color: #000; border: none; padding: 15px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 20px; width: 100%; transition: 0.3s; }
                button:hover { background: #ccc; }
                p { font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="letter-spacing: 2px;">MOPEKORA</h2>
                <p>Complete the ads to get your 9-hour key</p>
                <button onclick="window.location.href='${URL_CORTADOR}'">GENERATE KEY</button>
            </div>
        </body>
        </html>
    `);
});

// 2. PÁGINA DE ÉXITO (PROTEGIDA)
app.get('/success', (req, res) => {
    const referer = req.get('Referer') || "";
    
    // PARCHE 1: Verificar que venga de Linkvertise o similar
    const isFromAds = referer.includes("link-hub.net") || referer.includes("linkvertise.com");
    
    // Si intentan entrar directo, los mandamos al inicio
    if (!isFromAds) {
        return res.send(`
            <body style="background:#000;color:#f00;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <div style="text-align:center;">
                    <h1>ACCESS DENIED</h1>
                    <p style="color:#fff;">You must go through the link shortener first.</p>
                    <button onclick="window.location.href='/'" style="padding:10px; cursor:pointer;">Go Back</button>
                </div>
            </body>
        `);
    }

    // Generamos la Key
    const newKey = 'MOP-' + crypto.randomBytes(12).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000);
    
    validKeys.set(newKey, expiresAt);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your Key</title>
            <style>
                body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: monospace; }
                .card { background: #111; padding: 30px; border: 1px solid #007BFF; text-align: center; border-radius: 5px; box-shadow: 0 0 20px rgba(0,123,255,0.2); }
                .key-display { background: #000; padding: 15px; border: 1px dashed #444; margin: 20px 0; font-size: 18px; color: #007BFF; }
                button { background: #007BFF; color: #fff; border: none; padding: 15px 30px; cursor: pointer; font-weight: bold; width: 100%; }
                button:active { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="card">
                <h3 style="margin:0;">SUCCESS!</h3>
                <p style="color:#888;">Copy and paste this in the script</p>
                <div class="key-display" id="k">${newKey}</div>
                <button onclick="navigator.clipboard.writeText('${newKey}'); alert('Key Copied!');">COPY KEY</button>
                <p style="font-size:10px; margin-top:15px; color:#444;">Expires in 9 hours</p>
            </div>
        </body>
        </html>
    `);
});

// 3. VERIFICACIÓN (La que usa el script de Tampermonkey)
app.get('/verify', (req, res) => {
    const userKey = req.query.key;
    
    if (!userKey || !validKeys.has(userKey)) {
        return res.json({ valid: false, message: 'Invalid Key' });
    }
    
    const expiresAt = validKeys.get(userKey);
    
    if (Date.now() > expiresAt) {
        validKeys.delete(userKey);
        return res.json({ valid: false, message: 'Key Expired' });
    }

    res.json({ valid: true, expiresAt: expiresAt });
});

// 4. ADMIN PANEL (Para generar keys sin anuncios)
app.post('/api/admin-gen', (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Denied' });
    const newKey = 'MOP-ADMIN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    validKeys.set(newKey, Date.now() + (999 * 60 * 60 * 1000)); // Key casi infinita
    res.json({ key: newKey });
});

// PARCHE 4: Limpieza automática de memoria cada hora
setInterval(() => {
    const now = Date.now();
    for (const [key, expire] of validKeys.entries()) {
        if (now > expire) validKeys.delete(key);
    }
    console.log(`[System] Cleanup done. Active keys: ${validKeys.size}`);
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server Mopekora Live on port ' + PORT));
