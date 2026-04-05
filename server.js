const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const validKeys = new Map();

const ADMIN_PASSWORD = "Mopekora123";
const URL_CORTADOR = "https://link-hub.net/4821764/AtD2TVNl16mK"; 
const TIEMPO_KEY_HORAS = 9; 
const SECRET_SALT = "Mopekora_Security_V1";

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Key System</title>
            <style>
                body { 
                    background: #000; 
                    color: #fff; 
                    font-family: sans-serif; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    margin: 0; 
                    overflow: hidden; 
                }

                .marquee-container {
                    width: 100%;
                    overflow: hidden;
                    position: absolute;
                    top: 25%;
                }

                .moving-text {
                    display: inline-block;
                    white-space: nowrap;
                    font-size: 20px;
                    font-weight: bold;
                    animation: marquee 10s linear infinite;
                }

                @keyframes marquee {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100vw); }
                }

                button { 
                    background: #007BFF; 
                    color: #fff; 
                    border: none; 
                    padding: 20px 50px; 
                    font-size: 18px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    border-radius: 5px;
                    z-index: 10;
                }
                
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="marquee-container">
                <div class="moving-text">Get your 9-hour access key 🔑</div>
            </div>
            
            <button onclick="window.location.href='${URL_CORTADOR}'">GENERATE KEY</button>
        </body>
        </html>
    `);
});

app.get('/success', (req, res) => {
    const referer = req.get('Referer') || "";
    const isFromAds = referer.includes("link-hub.net") || referer.includes("linkvertise.com");
    
    if (!isFromAds) {
        return res.send(`
            <body style="background:#000;color:#f00;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column;">
                <div style="text-align:center;">
                    <h1>ACCESS DENIED</h1>
                    <button onclick="window.location.href='/'" style="padding:10px; cursor:pointer; background:#007BFF; color:#fff; border:none;">Go Back</button>
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
            <style>
                body { background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                .key-box { border: 1px solid #333; padding: 30px; text-align: center; }
                .key { color: #007BFF; font-size: 24px; margin: 20px 0; font-weight: bold; }
                button { background: #007BFF; color: #fff; border: none; padding: 15px 30px; cursor: pointer; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="key-box">
                <div class="key">${newKey}</div>
                <button onclick="navigator.clipboard.writeText('${newKey}'); alert('Copied!');">COPY KEY</button>
            </div>
        </body>
        </html>
    `);
});

app.get('/verify', (req, res) => {
    const userKey = req.query.key;
    if (!userKey || !validKeys.has(userKey)) return res.json({ valid: false });
    const expiresAt = validKeys.get(userKey);
    if (Date.now() > expiresAt) {
        validKeys.delete(userKey);
        return res.json({ valid: false });
    }
    
    const signature = crypto.createHash('sha256').update(userKey + expiresAt + SECRET_SALT).digest('hex');
    res.json({ valid: true, expiresAt: expiresAt, signature: signature });
});

app.post('/api/admin-gen', (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Denied' });
    const newKey = 'MOP-ADMIN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    validKeys.set(newKey, Date.now() + (999 * 60 * 60 * 1000));
    res.json({ key: newKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { });
