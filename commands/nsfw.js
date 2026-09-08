module.exports = {
name: '+18',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const cmd = args[0]
const isGroup = from.endsWith('@g.us')

// VERIFICAR SI EL GRUPO TIENE +18 ACTIVADO
if(isGroup &&!global.mas18) global.mas18 = {}
if(isGroup &&!global.mas18[from] && cmd!== 'mas18-on' && cmd!== 'mas18-off'){
return sock.sendMessage(from,{text:`*${BOT_NAME}* 🔞 Este grupo no tiene el +18 activado\nActivalo con:.mas18-on`})
}

// ACTIVAR/DESACTIVAR +18
if(cmd==='mas18-on'){
if(!isGroup) return sock.sendMessage(from,{text:`Solo en grupos`})
global.mas18[from] = true
await sock.sendMessage(from,{text:`*${BOT_NAME}* 🔞 Modo +18 ACTIVADO en este grupo`})
}
else if(cmd==='mas18-off'){
if(!isGroup) return sock.sendMessage(from,{text:`Solo en grupos`})
global.mas18[from] = false
await sock.sendMessage(from,{text:`*${BOT_NAME}* ✅ Modo +18 DESACTIVADO`})
}

// WAIFU NSFW
else if(cmd==='waifu-nsfw'){
const url = 'https://api.waifu.pics/nsfw/waifu'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} WAIFU NSFW*`})
}

// NEKO NSFW
else if(cmd==='neko-nsfw'){
const url = 'https://api.waifu.pics/nsfw/neko'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} NEKO NSFW*`})
}

// TRAP NSFW
else if(cmd==='trap-nsfw'){
const url = 'https://api.waifu.pics/nsfw/trap'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} TRAP*`})
}

// BLowJOB
else if(cmd==='bj'){
const url = 'https://api.waifu.pics/nsfw/blowjob'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {video: {url: data.url}, caption: `*${BOT_NAME}*`})
}

// HENTAI
else if(cmd==='hentai'){
const url = 'https://api.waifu.pics/nsfw/hentai'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} HENTAI*`})
}

// ASS
else if(cmd==='ass'){
const url = 'https://api.waifu.pics/nsfw/ass'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} ASS*`})
}

// ECCHI
else if(cmd==='ecchi'){
const url = 'https://api.waifu.pics/nsfw/ecchi'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} ECCHI*`})
}

// PACK
else if(cmd==='pack'){
const url = 'https://api.waifu.pics/nsfw/waifu'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} PACK*\nEnviando pack...`})
}

// ANAL
else if(cmd==='anal'){
const url = 'https://api.waifu.pics/nsfw/anal'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} ANAL*`})
}

else{
let lista=['mas18-on','mas18-off','waifu-nsfw','neko-nsfw','trap-nsfw','bj','hentai','ass','ecchi','pack','anal']
await sock.sendMessage(from,{text:`*${BOT_NAME} - +18*\n\n.${lista.join('\n.')}\n\n*IMPORTANTE:* Activa primero con.mas18-on`})
}
}}
