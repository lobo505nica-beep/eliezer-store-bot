const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = {
name: 'download',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const cmd = args[0]
const query = args.slice(1).join(' ')

if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

if(cmd === 'play' || cmd === 'yta') {
if(!query) return sock.sendMessage(from, {text: `Uso:.play nombre de cancion\n*${BOT_NAME}*`})
await sock.sendMessage(from, {text: `*${BOT_NAME}* 🔍 Buscando: ${query}...`})
try {
const r = await yts(query)
const url = r.videos[0].url
const title = r.videos[0].title
const file = `./tmp/${Date.now()}.mp3`
exec(`yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${file}" "${url}"`, async (err) => {
if(err) return sock.sendMessage(from, {text: `*${BOT_NAME}* Error al descargar`})
await sock.sendMessage(from, {
audio: fs.readFileSync(file),
mimetype: 'audio/mpeg',
fileName: title + '.mp3',
contextInfo: { externalAdReply: { title: title, body: BOT_NAME } }
})
fs.unlinkSync(file)
})
} catch(e){ sock.sendMessage(from, {text: `*${BOT_NAME}* Error: ${e}`}) }
}

else if(cmd === 'ytv') {
if(!query) return sock.sendMessage(from, {text: `Uso:.ytv link o nombre`})
await sock.sendMessage(from, {text: `*${BOT_NAME}* 📹 Descargando video...`})
try {
const r = await yts(query)
const url = r.videos[0].url
const title = r.videos[0].title
const file = `./tmp/${Date.now()}.mp4`
exec(`yt-dlp -f "best[height<=480]" -o "${file}" "${url}"`, async (err) => {
if(err) return sock.sendMessage(from, {text: `*${BOT_NAME}* Error`})
await sock.sendMessage(from, {video: fs.readFileSync(file), caption: title})
fs.unlinkSync(file)
})
} catch(e){ sock.sendMessage(from, {text: `*${BOT_NAME}* Error: ${e}`}) }
}

else if(cmd === 'tiktok' || cmd === 'tt') {
if(!query) return sock.sendMessage(from, {text: `Uso:.tiktok link`})
await sock.sendMessage(from, {text: `*${BOT_NAME}* 📱 Descargando tiktok...`})
const file = `./tmp/${Date.now()}.mp4`
exec(`yt-dlp -o "${file}" "${query}"`, async (err) => {
if(err) return sock.sendMessage(from, {text: `*${BOT_NAME}* Error`})
await sock.sendMessage(from, {video: fs.readFileSync(file), caption: `*${BOT_NAME}*`})
fs.unlinkSync(file)
})
}

else if(cmd === 'ig') {
if(!query) return sock.sendMessage(from, {text: `Uso:.ig link de instagram`})
await sock.sendMessage(from, {text: `*${BOT_NAME}* 📸 Descargando...`})
const file = `./tmp/${Date.now()}.mp4`
exec(`yt-dlp -o "${file}" "${query}"`, async (err) => {
if(err) return sock.sendMessage(from, {text: `*${BOT_NAME}* Error`})
await sock.sendMessage(from, {video: fs.readFileSync(file)})
fs.unlinkSync(file)
})
}

else if(cmd === 'fb') {
if(!query) return sock.sendMessage(from, {text: `Uso:.fb link`})
await sock.sendMessage(from, {text: `*${BOT_NAME}* 📘 Descargando...`})
const file = `./tmp/${Date.now()}.mp4`
exec(`yt-dlp -o "${file}" "${query}"`, async (err) => {
if(err) return sock.sendMessage(from, {text: `*${BOT_NAME}* Error`})
await sock.sendMessage(from, {video: fs.readFileSync(file)})
fs.unlinkSync(file)
})
}

else {
let lista = ['play','yta','ytv','tiktok','tt','ig','fb']
await sock.sendMessage(from, {text: `*${BOT_NAME} - DOWNLOAD*\n\n.${lista.join('\n.')}\n\nEjemplo:.play peso pluma`})
}
}}
