const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let pairingCodeGlobal = "Ingresa tu número abajo";
let estadoBot = "Desconectado";
let sockInstance = null;

// Interfaz Web de Administración
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Eliezer Store - Panel Bot</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                :root { --primary: #8a2be2; --secondary: #ff69b4; --bg: #0f0f13; --card: #191923; }
                * { box-sizing: border-box; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
                body { background: var(--bg); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
                .container { width: 100%; max-width: 420px; background: var(--card); border: 1px solid rgba(138,43,226,0.3); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
                h1 { font-size: 1.6rem; background: linear-gradient(45deg, var(--secondary), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 5px; }
                p { color: #b3b3c1; font-size: 0.85rem; margin-bottom: 15px; }
                input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #444; background: #000; color: #fff; font-size: 1rem; margin-bottom: 12px; text-align: center; }
                button { width: 100%; padding: 12px; border-radius: 10px; border: none; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: #fff; font-weight: 600; cursor: pointer; font-size: 1rem; }
                .code-box { background: #000; border: 1px dashed var(--secondary); border-radius: 10px; padding: 15px; font-size: 1.8rem; letter-spacing: 4px; font-weight: bold; color: var(--secondary); margin: 15px 0; }
                .status { margin-top: 15px; font-size: 0.9rem; color: #00ffcc; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Eliezer Store</h1>
                <p>Panel de Control y Vinculación 24/7</p>
                
                <form action="/vincular" method="POST">
                    <input type="text" name="telefono" placeholder="+505XXXXXXXX" required>
                    <button type="submit">Generar Código de 8 Dígitos</button>
                </form>

                <div class="code-box">${pairingCodeGlobal}</div>
                <div class="status">Estado: ${estadoBot}</div>
            </div>
        </body>
        </html>
    `);
});

// Ruta para procesar el número e iniciar el emparejamiento
app.post('/vincular', async (req, res) => {
    const telefono = req.body.telefono.replace(/[^0-9]/g, '');
    if (!telefono) return res.redirect('/');
    
    await iniciarBotConNumero(telefono);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Servidor web corriendo en el puerto ${PORT}`);
});

// Lógica de Conexión de WhatsApp y Sistema de Comandos
async function iniciarBotConNumero(numero) {
    const { state, saveCreds } = await useMultiFileAuthState('./sesion_web');

    sockInstance = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    if (!sockInstance.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sockInstance.requestPairingCode(numero);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                pairingCodeGlobal = code;
                estadoBot = "Esperando que ingreses el código en WhatsApp";
            } catch (error) {
                pairingCodeGlobal = "Error al generar";
                estadoBot = "Fallo en conexión";
            }
        }, 4000);
    }

    sockInstance.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            estadoBot = "Desconectado - Reconectando...";
            if (shouldReconnect) iniciarBotConNumero(numero);
        } else if (connection === 'open') {
            estadoBot = "Conectado y Activo 24/7";
            pairingCodeGlobal = "¡VINCULADO!";
        }
    });

    sockInstance.ev.on('creds.update', saveCreds);

    // Sistema de Comandos básico
    sockInstance.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
        
        if (!body.startsWith('.')) return;
        
        const args = body.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'menu':
                await sockInstance.sendMessage(remoteJid, { text: '🤖 *Menú - Eliezer Store*\n\n.ping - Comprobar estado' });
                break;
            case 'ping':
                await sockInstance.sendMessage(remoteJid, { text: 'Pong! El bot está activo en la nube.' });
                break;
            default:
                await sockInstance.sendMessage(remoteJid, { text: `Comando .${command} no reconocido.` });
                break;
        }
    });
}
