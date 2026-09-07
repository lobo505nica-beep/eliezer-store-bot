const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')

module.exports = {
name: 'sticker',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const cmd = args[0]
const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage

// 1. STICKER NORMAL
if(cmd === 's' || cmd === 'sticker') {
let media = msg.message.imageMessage || quoted?.imageMessage
if(!media) return sock.sendMessage(from, {text: `*${BOT_NAME}* Responde a una imagen con.s`})
const buffer = await downloadMediaMessage({message: {imageMessage: media}}, 'buffer', {}, {logger: console})
await sock.sendMessage(from, {sticker: buffer})
}

// 2. STICKER CON TEXTO
else if(cmd === 'ttp') {
const texto = args.slice(1).join(' ')
if(!texto) return sock.sendMessage(from, {text: `Uso:.ttp hola`})
const url = `https://api.lolhuman.xyz/api/ttp?apikey=Betabotz&text=${encodeURIComponent(texto)}`
const res = await fetch(url)
const buffer = await res.buffer()
await sock.sendMessage(from, {sticker: buffer})
}

// 3. STICKER ANIMADO
else if(cmd === 'attp') {
const texto = args.slice(1).join(' ')
if(!texto) return sock.sendMessage(from, {text: `Uso:.attp hola`})
const url = `https://api.lolhuman.xyz/api/attp?apikey=Betabotz&text=${encodeURIComponent(texto)}`
const res = await fetch(url)
const buffer = await res.buffer()
await sock.sendMessage(from, {sticker: buffer})
}

// 4. QUOTE STICKER
else if(cmd === 'qc') {
const texto = args.slice(1).join(' ') || 'Hola'
const nombre = msg.pushName || 'Usuario'
const url = `https://api.lolhuman.xyz/api/quotemaker?apikey=Betabotz&text=${encodeURIComponent(texto)}&username=${encodeURIComponent(nombre)}`
const res = await fetch(url)
const buffer = await res.buffer()
await sock.sendMessage(from, {sticker: buffer})
}

// 5. EMOJIMIX
else if(cmd === 'emojimix') {
const emoji1 = args[0]
const emoji2 = args[1]
if(!emoji1 ||!emoji2) return sock.sendMessage(from, {text: `Uso:.emojimix 😂 ❤️`})
const url = `https://api.lolhuman.xyz/api/emojimix?apikey=Betabotz&emoji1=${emoji1}&emoji2=${emoji2}`
const res = await fetch(url)
const buffer = await res.buffer()
await sock.sendMessage(from, {sticker: buffer})
}

// 6. STICKER A IMAGEN
else if(cmd === 'toimg') {
let media = msg.message.stickerMessage || quoted?.stickerMessage
if(!media) return sock.sendMessage(from, {text: `*${BOT_NAME}* Responde a un sticker con.toimg`})
const buffer = await downloadMediaMessage({message: {stickerMessage: media}}, 'buffer', {}, {logger: console})
await sock.sendMessage(from, {image: buffer})
}

// 7. FILTROS
else if(cmd === 'trigger') {
let media = msg.message.imageMessage || quoted?.imageMessage
if(!media) return sock.sendMessage(from, {text: `*${BOT_NAME}* Responde a una imagen`})
const buffer = await downloadMediaMessage({message: {imageMessage: media}}, 'buffer', {}, {logger: console})
const url = `https://api.lolhuman.xyz/api/filter/trigger?apikey=Betabotz&img=${encodeURIComponent(await uploadToImgur(buffer))}`
const res = await fetch(url)
const img = await res.buffer()
await sock.sendMessage(from, {sticker: img})
}

else if(cmd === 'gay') {
let media = msg.message.imageMessage || quoted?.imageMessage
if(!media) return sock.sendMessage(from, {text: `*${BOT_NAME}* Responde a una imagen`})
const buffer = await downloadMediaMessage({message: {imageMessage: media}}, 'buffer', {}, {logger: console})
const url = `https://api.lolhuman.xyz/api/filter/gay?apikey=Betabotz&img=${encodeURIComponent(await uploadToImgur(buffer))}`
const res = await fetch(url)
const img = await res.buffer()
await sock.sendMessage(from, {sticker: img})
}

else {
let lista = ['s','sticker','ttp','attp','qc','emojimix','toimg','trigger','gay']
await sock.sendMessage(from, {text: `*${BOT_NAME} - STICKER*\n\n.${lista.join('\n.')}\n\nTip: Responde imagen +.s`})
}
}}

// Funcion para subir a imgur temporal
async function uploadToImgur(buffer) {
return 'https://i.imgur.com/temp.png' // aqui iria tu api de imgur
    }
