const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const validKeys = new Map();
const activeSessions = new Set(); 

// ==========================================
// ⚙️ CONFIGURACIÓN DE TU SISTEMA ⚙️
// ==========================================
const ADMIN_PASSWORD = "Mopekora123";
const URL_CORTADOR = "https://link-hub.net/4821764/AtD2TVNl16mK"; 
const TIEMPO_KEY_HORAS = 9; 
// ==========================================

// 1. PÁGINA PRINCIPAL (MODIFICADA: BLANCA Y VERDE)
app.get('/', (req, res) => {
    const sessionId = crypto.randomBytes(16).toString('hex');
    activeSessions.add(sessionId);
    setTimeout(() => activeSessions.delete(sessionId), 10 * 60 * 1000);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>MOPEKORA SYSTEM</title>
            <script src="https://unpkg.com/twemoji@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>
            <style>
                body { background: #ffffff; color: #000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { border: 1px solid #e0e0e0; padding: 40px; text-align: center; background: #fff; width: 340px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                h2 { color: #1a1a1a; margin-bottom: 5px; }
                p { font-size: 14px; color: #666; margin-bottom: 25px; }
                
                button { 
                    background: #23a559; /* Verde estilo Discord Success */
                    color: #fff; 
                    border: none; 
                    padding: 15px; 
                    font-size: 16px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    width: 100%; 
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: background 0.2s; 
                }
                button:hover { background: #1a7a42; }
                
                /* Estilo para los Twemojis */
                .emoji { width: 20px; height: 20px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>MOPEKORA</h2>
                <p>Get your 9-hour access key</p>
                <button onclick="window.location.href='${URL_CORTADOR}'">
                    <span>GENERATE KEY</span> 🔑
                </button>
            </div>
            <script>twemoji.parse(document.body);</script>
        </body>
        </html>
    `);
});

// 2. PÁGINA DE ÉXITO (PROTEGIDA CON REFERER)
app.get('/success', (req, res) => {
    const referer = req.get('Referer') || "";
    const isFromAds = referer.includes("link-hub.net") || referer.includes("linkvertise.com");
    
    if (!isFromAds) {
        return res.send(`
            <body style="background:#fff;color:#f00;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <div style="text-align:center;">
                    <h1 style="color:#da373c;">ACCESS DENIED</h1>
                    <p style="color:#666;">Unauthorized direct access. Please use the generator.</p>
                    <button onclick="window.location.href='/'" style="padding:10px; cursor:pointer; background:#23a559; color:#fff; border:none; border-radius:5px;">Go to Home</button>
                </div>
            </body>
        `);
    }

    const newKey = 'MOP-' + crypto.randomBytes(12).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (TIEMPO_KEY_HORAS * 60 * 60 * 1000);
    validKeys.set(newKey, expiresAt);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your Key</title>
            <script src="https://unpkg.com/twemoji@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>
            <style>
                body { background: #ffffff; color: #000; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                .card { background: #fff; padding: 40px; border: 2px solid #23a559; text-align: center; border-radius: 12px; width: 340px; }
                .key-display { background: #f2f3f5; padding: 15px; border: 1px solid #e0e0e0; margin: 20px 0; font-size: 16px; font-weight: bold; color: #23a559; word-break: break-all; }
                button { background: #23a559; color: #fff; border: none; padding: 15px; cursor: pointer; font-weight: bold; width: 100%; border-radius: 8px; }
                .emoji { width: 18px; height: 18px; vertical-align: middle; }
            </style>
        </head>
        <body>
            <div class="card">
                <h3 style="margin:0;">SUCCESS! ✅</h3>
                <p style="color:#666; font-size: 14px;">Your key is ready to use</p>
                <div class="key-display" id="k">${newKey}</div>
                <button onclick="navigator.clipboard.writeText('${newKey}'); alert('Copied!');">COPY KEY</button>
                <p style="font-size:11px; margin-top:15px; color:#999;">Valid for 9 hours</p>
            </div>
            <script>twemoji.parse(document.body);</script>
        </body>
        </html>
    `);
});

// 3. VERIFICACIÓN
app.get('/verify', (req, res) => {
    const userKey = req.query.key;
    if (!userKey || !validKeys.has(userKey)) return res.json({ valid: false, message: 'Invalid Key' });
    const expiresAt = validKeys.get(userKey);
    if (Date.now() > expiresAt) {
        validKeys.delete(userKey);
        return res.json({ valid: false, message: 'Key Expired' });
    }
    res.json({ valid: true, expiresAt: expiresAt });
});

// 4. ADMIN PANEL
app.post('/api/admin-gen', (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Denied' });
    const newKey = 'MOP-ADMIN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    validKeys.set(newKey, Date.now() + (999 * 60 * 60 * 1000));
    res.json({ key: newKey });
});

setInterval(() => {
    const now = Date.now();
    for (const [key, expire] of validKeys.entries()) {
        if (now > expire) validKeys.delete(key);
    }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server Mopekora Live on port ' + PORT));
