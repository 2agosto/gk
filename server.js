const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Base de datos temporal
const validKeys = new Map();

// ==========================================
// ⚙️ CONFIGURACIÓN DE TU SISTEMA ⚙️
// ==========================================

const ADMIN_PASSWORD = "Mopekora123"; // Tu contraseña secreta para el panel Admin

// ⚠️ AQUÍ PONES EL LINK DE TU CORTADOR (Linkvertise, Workink, etc.)
// Nota: En tu cortador, debes configurar que la URL de DESTINO final sea:
// https://server-keys-mopekora.onrender.com/success
const URL_CORTADOR = "https://linkvertise.com/tu-link-de-ejemplo"; 

const TIEMPO_KEY_HORAS = 9; // Cuántas horas dura la key
// ==========================================

// 1. PÁGINA PRINCIPAL PÚBLICA (Toda negra)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mopekora Key System</title>
            <style>
                body { background: #000; color: #fff; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #333; padding: 40px; border-radius: 10px; text-align: center; background: #0a0a0a; box-shadow: 0 0 20px rgba(255,255,255,0.05); width: 300px; }
                button { background: #fff; color: #000; border: none; padding: 15px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 5px; transition: 0.3s; margin-top: 20px; width: 100%; }
                button:hover { background: #aaa; box-shadow: 0 0 10px #fff; }
                h2 { text-shadow: 0 0 10px #fff; letter-spacing: 2px; }
                .status { color: #0f0; text-shadow: 0 0 5px #0f0; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>MOPEKORA SYSTEM</h2>
                <p>Status: <span class="status">ONLINE</span></p>
                <p style="font-size: 12px; color: #888;">Key Duration: ${TIEMPO_KEY_HORAS} Hours</p>
                <button onclick="window.location.href='${URL_CORTADOR}'">GET KEY (ADS)</button>
            </div>
        </body>
        </html>
    `);
});

// 2. PÁGINA DE ÉXITO (Donde llegan después de pasar el cortador de anuncios)
app.get('/success', (req, res) => {
    // Generar la key al instante
    const newKey = 'MOP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000);
    validKeys.set(newKey, expiresAt);

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Key Generated</title>
            <style>
                body { background: #000; color: #fff; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #0f0; padding: 40px; border-radius: 10px; text-align: center; background: #051005; box-shadow: 0 0 20px rgba(0,255,0,0.1); width: 320px; }
                .key-display { background: #000; border: 1px solid #0f0; color: #0f0; padding: 15px; font-size: 22px; font-weight: bold; margin: 20px 0; letter-spacing: 2px; }
                button { background: #0f0; color: #000; border: none; padding: 12px; font-weight: bold; cursor: pointer; border-radius: 5px; width: 100%; font-size: 16px; }
                button:hover { background: #fff; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color:#0f0; text-shadow: 0 0 10px #0f0;">SUCCESS!</h2>
                <p>Your ${TIEMPO_KEY_HORAS}-hour key is ready:</p>
                <div class="key-display" id="keyText">${newKey}</div>
                <button onclick="navigator.clipboard.writeText('${newKey}'); alert('Copied to clipboard!');">COPY KEY</button>
            </div>
        </body>
        </html>
    `);
});

// 3. PANEL DE ADMINISTRADOR SECRETO (UI Negra con recuadro seguro)
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Admin Panel</title>
            <style>
                body { background: #000; color: #fff; font-family: 'Courier New', monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #444; padding: 30px; border-radius: 10px; background: #0a0a0a; text-align:center; width: 300px; }
                input { padding: 12px; width: 90%; margin-bottom: 20px; background: #000; border: 1px solid #fff; color: #fff; text-align: center; font-family: monospace; outline: none; }
                button { background: #fff; color: #000; border: none; padding: 12px; font-weight: bold; cursor: pointer; width: 100%; }
                button:hover { background: #0f0; color: #000; }
                #result { margin-top: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>ADMIN PANEL</h2>
                <input type="password" id="pass" placeholder="Enter Secret Password">
                <button onclick="generate()">GENERATE KEY</button>
                <div id="result"></div>
            </div>
            <script>
                function generate() {
                    const pass = document.getElementById('pass').value;
                    document.getElementById('result').innerHTML = "Generating...";
                    // Esto envía la contraseña de forma oculta e invisible al servidor
                    fetch('/api/admin-gen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: pass })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if(data.error) document.getElementById('result').innerHTML = '<span style="color:#ff4444;">' + data.error + '</span>';
                        else document.getElementById('result').innerHTML = '<span style="color:#0f0;">KEY: ' + data.key + '</span><br><br><span style="font-size:10px;color:#aaa;">Valid for 9 hours</span>';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Ruta interna secreta para el panel de admin
app.post('/api/admin-gen', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'WRONG PASSWORD' });
    }
    const newKey = 'MOP-ADMIN-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000);
    validKeys.set(newKey, expiresAt);
    res.json({ key: newKey });
});

// 4. VERIFICACIÓN (Esto lo usa automáticamente tu script de Tampermonkey)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
