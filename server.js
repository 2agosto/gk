const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const validKeys = new Map();

// ==========================================
// ⚙️ CONFIGURACIÓN DE TU SISTEMA ⚙️
// ==========================================

const ADMIN_PASSWORD = "Mopekora123";

// ⚠️ AQUÍ PEGARÁS TU ENLACE CORTO DE LINKVERTISE DESPUÉS DE CREARLO:
const URL_CORTADOR = "https://link-hub.net/4821764/AtD2TVNl16mK"; 

const TIEMPO_KEY_HORAS = 9; 
// ==========================================

// 1. PÁGINA PRINCIPAL PÚBLICA (La que abre al darle Get Free Key)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #333; padding: 40px; text-align: center; background: #0a0a0a; width: 300px; }
                button { background: #fff; color: #000; border: none; padding: 15px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 20px; width: 100%; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>MOPEKORA SYSTEM</h2>
                <button onclick="window.location.href='${URL_CORTADOR}'">GENERATE KEY (ADS)</button>
            </div>
        </body>
        </html>
    `);
});

// 2. PÁGINA DE ÉXITO (Solo el botón azul)
app.get('/success', (req, res) => {
    // Genera código largo (Ej: MOP-8F9A2B3C4D5E6F7A8B9C0D1E)
    const newKey = 'MOP-' + crypto.randomBytes(12).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000);
    validKeys.set(newKey, expiresAt);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Key</title>
            <style>
                body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                /* Botón azul simple */
                button { background: #007BFF; color: #fff; border: none; padding: 20px 40px; font-size: 18px; cursor: pointer; border-radius: 5px; }
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <button onclick="navigator.clipboard.writeText('${newKey}'); alert('Copied!');">COPY KEY</button>
        </body>
        </html>
    `);
});

// 3. VERIFICACIÓN AUTOMÁTICA
app.get('/verify', (req, res) => {
    const userKey = req.query.key;
    if (!userKey || !validKeys.has(userKey)) return res.json({ valid: false, message: 'Invalid or missing key' });
    
    const expiresAt = validKeys.get(userKey);
    if (Date.now() > expiresAt) {
        validKeys.delete(userKey);
        return res.json({ valid: false, message: 'Key expired' });
    }
    res.json({ valid: true, expiresAt: expiresAt });
});

// 4. PANEL ADMIN SECRETO (Opcional, por si quieres hacerte keys sin ver anuncios)
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><style>body{background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}input,button{padding:10px;margin:5px;}</style></head>
        <body>
            <div>
                <input type="password" id="p" placeholder="Password">
                <button onclick="fetch('/api/admin-gen',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('p').value})}).then(r=>r.json()).then(d=>alert(d.key||d.error))">Gen Key</button>
            </div>
        </body>
        </html>
    `);
});

app.post('/api/admin-gen', (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Wrong Password' });
    const newKey = 'MOP-' + crypto.randomBytes(12).toString('hex').toUpperCase();
    validKeys.set(newKey, Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000));
    res.json({ key: newKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
