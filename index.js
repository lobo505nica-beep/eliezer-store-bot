const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const qrcode = require('qrcode-terminal')
global.fetch = require('node-fetch')

const BOT_NAME = 'EliezerStore-Bot'
const PREFIX = '.'
const NUMERO_OWNER = '50583318551' // tu numero sin +

// CARGAR COMANDOS
const commands = new Map()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for(const file of commandFiles){
const command = require(`./commands/${file}`)
commands.set(command.name, command)
}

// ESTADOS GLOBALES
global.mas18 = {}
global.mode = 'public'
global.anticall = false

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState('session')

const sock = makeWASocket({
auth: state,
printQRInTerminal: false, // quitamos QR
browser: ['EliezerStore', 'Chrome', '1.0.0']
})

sock.ev.on('creds.update', saveCreds)

sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update

if(connection === 'open'){
console.log('✅ Bot conectado como EliezerStore')
}

// SI NO HAY SESION, PIDE CODIGO
if(!sock.authState.creds.registered){
await new Promise(resolve => setTimeout(resolve, 3000))
const code = await sock.requestPairingCode(NUMERO_OWNER)
console.log('CODIGO DE 8 DIGITOS:', code)
console.log('Ve a WhatsApp > Dispositivos vinculados > Vincular con codigo')
}
})

sock.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if(connection === 'close'){
const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
console.log('Conexion cerrada. Reconectando...', shouldReconnect)
if(shouldReconnect) startBot()
}
})

// ANTI LLAMADA
sock.ev.on('call', async (call) => {
if(global.anticall){
await sock.rejectCall(call[0].id, call[0].from)
}
})

// MENSAJES
sock.ev.on('messages.upsert', async (m) => {
const msg = m.messages[0]
if(!msg.message || msg.key.fromMe) return

const from = msg.key.remoteJid
const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
if(!body.startsWith(PREFIX)) return

const args = body.slice(PREFIX.length).trim().split(/ +/)
const cmd = args.shift().toLowerCase()

// MODO SELF
if(global.mode === 'self' && msg.key.remoteJid !== '50583318551@s.whatsapp.net') return

const command = commands.get(cmd)
if(command){
try{
await command.execute(sock, msg, args, BOT_NAME)
}catch(e){
console.log(e)
await sock.sendMessage(from,{text:`Error en el comando`})
}
}

// MENU
if(cmd === 'menu'){
const menu = `*${BOT_NAME} - MENU*\n\n1. .menu 1 - Download\n2. .menu 2 - Sticker\n3. .menu 3 - Grupo\n4. .menu 4 - Juegos\n5. .menu 5 - Gacha\n6. .menu 6 - Anime\n7. .menu 7 - Owner\n8. .menu 8 - Economia\n9. .menu 9 - +18\n10. .menu 10 - Utilidades\nOwner: EliezerStore\nNumero: +50583318551`
await sock.sendMessage(from,{text:menu})
}
})

console.log('Cargados', commands.size, 'comandos')
}

startBot()
