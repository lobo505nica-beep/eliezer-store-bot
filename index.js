// Archivo: index.js - Servidor principal con carga dinámica de 12 secciones (50 comandos c/u), sistema de encendido/apagado (.menu X off/on), y vinculación por código o QR
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, PHONENUMBER_MCC } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const qrcode = require('qrcode-terminal');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Estado de secciones (todas encendidas por defecto)
const seccionesEstado = {
    '1': true, 'bot': true,
    '2': true, 'grupo': true,
    '3': true, 'download': true,
    '4': true, 'sticker': true,
    '5': true, 'gacha': true,
    '6': true, 'sub bots': true,
    '7': true, '+18': true,
    '8': true, 'economia': true,
    '9': true, 'anime': true,
    '10': true, 'Ai': true,
    '11': true, 'creación de video': true,
    '12': true, 'creación de audio': true
};

const seccionesNombresMap = {
    '1': 'bot',
    '2': 'grupo',
    '3': 'download',
    '4': 'sticker',
    '5': 'gacha',
    '6': 'sub bots',
    '7': '+18',
    '8': 'economia',
    '9': 'anime',
    '10': 'Ai',
    '11': 'creación de video',
    '12': 'creación de audio'
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_eliezer');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        printQRInTerminal: false
    });

    // Vincular por código de 8 dígitos si no está registrado
    if (!sock.authState.creds.registered) {
        const askPairing = await question('¿Deseas vincular el bot usando un número de teléfono con código de 8 dígitos? (s/n): ');
        if (askPairing.toLowerCase() === 's') {
            const phoneNumber = await question('Por favor ingresa tu número de WhatsApp (con código de país, ej: 50588888888): ');
            setTimeout(async () => {
                let code = await sock.requestPairingCode(phoneNumber.trim());
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n🔗 TU CÓDIGO DE VINCULACIÓN DE 8 DÍGITOS ES: ${code}\n`);
            }, 3000);
        }
    }

    sock.appCommands = new Map();
    const commandFolders = path.join(__dirname, 'commands');

    if (fs.existsSync(commandFolders)) {
        const commandFiles = fs.readdirSync(commandFolders).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandFolders, file);
            const commandsList = require(filePath);
            if (Array.isArray(commandsList)) {
                for (const cmd of commandsList) {
                    if (cmd.name) {
                        sock.appCommands.set(cmd.name, { ...cmd, categoryFile: file });
                        if (cmd.aliases) {
                            cmd.aliases.forEach(alias => sock.appCommands.set(alias, { ...cmd, categoryFile: file }));
                        }
                    }
                }
            }
        }
        console.log(`✅ ¡Se cargaron exitosamente todos los comandos desde la carpeta commands!`);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('📱 Escanea este código QR en WhatsApp si prefieres vinculación por QR:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🤖 ¡El bot de Eliezer Store está conectado y funcionando al 100%!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const messageType = Object.keys(m.message)[0];
        let body = '';

        if (messageType === 'conversation') {
            body = m.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
        } else if (messageType === 'imageMessage' && m.message.imageMessage.caption) {
            body = m.message.imageMessage.caption;
        }

        const prefix = '.';
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Manejo especial de encendido/apagado o visualización del menú por secciones
        if (commandName === 'menu' || commandName === 'help' || commandName === 'ayuda') {
            const query = args[0]?.toLowerCase();
            const subQuery = args[1]?.toLowerCase();

            // Apagar o encender sección (Ej: .menu 2 off / .menu grupo on)
            if (query && (seccionesNombresMap[query] || Object.values(seccionesNombresMap).includes(query)) && (subQuery === 'off' || subQuery === 'on')) {
                const claveSec = seccionesNombresMap[query] || query;
                seccionesEstado[claveSec] = subQuery === 'on';
                return await sock.sendMessage(remoteJid, { text: `⚙️ La sección *${claveSec.toUpperCase()}* ha sido ${subQuery === 'on' ? 'activada 🟢' : 'desactivada 🔴'}.` });
            }

            // Mostrar submenú de una sección específica (Ej: .menu 1 o .menu grupo)
            if (query && (seccionesNombresMap[query] || Object.values(seccionesNombresMap).includes(query))) {
                const secKey = seccionesNombresMap[query] || query;
                if (seccionesEstado[secKey] === false) {
                    return await sock.sendMessage(remoteJid, { text: `⚠️ La sección *${secKey.toUpperCase()}* se encuentra actualmente desactivada 🔴.` });
                }
                
                let listaComandosSec = [];
                for (let [name, cmdObj] of sock.appCommands.entries()) {
                    if (cmdObj.categoryFile?.includes(secKey) && !listaComandosSec.includes(name)) {
                        listaComandosSec.push(name);
                    }
                }

                return await sock.sendMessage(remoteJid, { 
                    text: `📂 *MENÚ DE LA SECCIÓN: ${secKey.toUpperCase()}* (50 Comandos)\n\n` +
                          `Estado: Activada 🟢\n` +
                          `Comandos en esta sección: ${listaComandosSec.length}\n\n` +
                          `Ejemplos: .${listaComandosSec[0] || 'comando'}` 
                });
            }

            // Menú General con las 12 secciones y los 600 comandos totales (50 por sección)
            let menuGeneral = `🤖 *PANEL GENERAL - ELIEZER STORE* (600 Comandos / 50 por sección)\n\n` +
                `Comandos de control:\n` +
                `• .menu [núm] -> Ver los 50 comandos de la sección (Ej: .menu 1)\n` +
                `• .menu [núm] off -> Apagar sección completa\n` +
                `• .menu [núm] on -> Encender sección completa\n\n` +
                `1️⃣ Bot [${seccionesEstado['1'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `2️⃣ Grupo [${seccionesEstado['2'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `3️⃣ Download [${seccionesEstado['3'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `4️⃣ Sticker [${seccionesEstado['4'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `5️⃣ Gacha [${seccionesEstado['5'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `6️⃣ Sub Bots [${seccionesEstado['6'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `7️⃣ +18 [${seccionesEstado['7'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `8️⃣ Economía [${seccionesEstado['8'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `9️⃣ Anime [${seccionesEstado['9'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `🔟 AI [${seccionesEstado['10'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `11️⃣ Creación de Video [${seccionesEstado['11'] ? '🟢 Activo' : '🔴 Apagado'}]\n` +
                `12️⃣ Creación de Audio [${seccionesEstado['12'] ? '🟢 Activo' : '🔴 Apagado'}]`;

            return await sock.sendMessage(remoteJid, { text: menuGeneral });
        }

        const command = sock.appCommands.get(commandName);
        if (!command) return;

        // Verificar si la categoría del comando está apagada
        for (let [numKey, nameSec] of Object.entries(seccionesNombresMap)) {
            if (command.categoryFile?.includes(nameSec) && seccionesEstado[nameSec] === false) {
                return await sock.sendMessage(remoteJid, { text: `⚠️ Esta sección (*${nameSec.toUpperCase()}*) se encuentra desactivada 🔴 en este momento.` });
            }
        }

        try {
            await command.execute(sock, m, args, remoteJid);
        } catch (err) {
            console.error(err);
        }
    });
}

startBot();
