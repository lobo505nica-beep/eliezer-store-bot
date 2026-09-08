const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

let subBots = new Map()

module.exports = {
name: 'subbot',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]

// HACER SUBBOT
if(cmd==='ser-subbot' || cmd==='subbot'){
const sessionPath = `./subbots/${sender.split('@')[0]}`
if(!fs.existsSync('./subbots')) fs.mkdirSync('./subbots')
if(subBots.has(sender)) return sock.sendMessage(from,{text:`*${BOT_NAME}* Ya eres subbot`})

await sock.sendMessage(from,{text:`*${BOT_NAME}* Enviame el codigo de 8 digitos que te aparecio`})

subBots.set(sender, { esperandoCodigo: true, sessionPath })
}

// RECIBIR CODIGO
else if(cmd==='codigo'){
const codigo = args[1]
if(!subBots.has(sender) ||!subBots.get(sender).esperandoCodigo)
return sock.sendMessage(from,{text:`*${BOT_NAME}* Primero usa.ser-subbot`})

const { sessionPath } = subBots.get(sender)
subBots.get(sender).esperandoCodigo = false

await sock.sendMessage(from,{text:`*${BOT_NAME}* Conectando subbot...`})

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
const subSock = makeWASocket({
auth: state,
printQRInTerminal: false,
browser: ['EliezerStore-SubBot', 'Chrome', '1.0.0']
})

const code = await subSock.requestPairingCode(sender.split('@')[0])
await sock.sendMessage(from,{text:`*${BOT_NAME}* Tu codigo: ${code}\nMetelo en WhatsApp > Dispositivos vinculados`})

subSock.ev.on('creds.update', saveCreds)
subSock.ev.on('connection.update', (u) => {
if(u.connection === 'open'){
subBots.set(sender, { sock: subSock, sessionPath })
sock.sendMessage(from,{text:`*${BOT_NAME}* ✅ Subbot conectado correctamente`})
}
})
}

// DETENER SUBBOT
else if(cmd==='stop-subbot'){
if(!subBots.has(sender)) return sock.sendMessage(from,{text:`*${BOT_NAME}* No eres subbot`})
const data = subBots.get(sender)
if(data.sock) await data.sock.logout()
subBots.delete(sender)
await sock.sendMessage(from,{text:`*${BOT_NAME}* Subbot desconectado`})
}

// LISTA SUBBOTS
else if(cmd==='lista-subbots'){
let lista = [...subBots.keys()].map(u=>`@${u.split('@')[0]}`).join('\n') || 'Nadie'
await sock.sendMessage(from,{text:`*${BOT_NAME} SUBBOTS ACTIVOS*\n\n${lista}`, mentions:[...subBots.keys()]})
}

else{
await sock.sendMessage(from,{text:`*${BOT_NAME} - SUBBOT*\n\n.ser-subbot - Hacerte subbot\n.codigo 1234-5678 - Poner tu codigo\n.stop-subbot - Desconectarte\n.lista-subbots - Ver subbots`})
}
}}
