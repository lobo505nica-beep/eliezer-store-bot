const { exec } = require('child_process')

module.exports = {
name: 'utilidades',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]
const query = args.slice(1).join(' ')

// INFO DEL BOT
if(cmd==='info'){
await sock.sendMessage(from,{text:`*${BOT_NAME}*\nVersion: 3.0.0\nOwner: EliezerStore\nNumero: +50583318551\nComandos: 600+\nEstado: Online ✅\nLibreria: Baileys`})
}

// PING
else if(cmd==='ping'){
const start = Date.now()
await sock.sendMessage(from,{text:`*${BOT_NAME}* Pong!`})
const end = Date.now()
await sock.sendMessage(from,{text:`*Velocidad:* ${end - start}ms`})
}

// CLIMA
else if(cmd==='clima'){
if(!query) return sock.sendMessage(from,{text:`Uso:.clima Managua`})
const url = `https://wttr.in/${encodeURIComponent(query)}?format=3`
const res = await fetch(url)
const data = await res.text()
await sock.sendMessage(from,{text:`*${BOT_NAME} CLIMA*\n\n${data}`})
}

// TRADUCTOR
else if(cmd==='traducir' || cmd==='tr'){
if(!query) return sock.sendMessage(from,{text:`Uso:.tr hola como estas`})
const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=es|en`
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from,{text:`*${BOT_NAME} TRADUCTOR*\n\nES: ${query}\nEN: ${data.responseData.translatedText}`})
}

// CALCULAR
else if(cmd==='calcular' || cmd==='calc'){
try{
const resultado = eval(query)
await sock.sendMessage(from,{text:`*${BOT_NAME} CALCULADORA*\n\n${query} = ${resultado}`})
}catch(e){await sock.sendMessage(from,{text:`Operacion invalida`})}
}

// QR
else if(cmd==='qr'){
if(!query) return sock.sendMessage(from,{text:`Uso:.qr texto`})
const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(query)}`
await sock.sendMessage(from,{image: {url}, caption: `*${BOT_NAME} QR*`})
}

// FONDO
else if(cmd==='fondo' || cmd==='bg'){
if(!query) return sock.sendMessage(from,{text:`Uso:.fondo naturaleza`})
const url = `https://source.unsplash.com/1080x1920/?${encodeURIComponent(query)}`
await sock.sendMessage(from,{image: {url}, caption: `*${BOT_NAME} FONDO*`})
}

// ACORTAR LINK
else if(cmd==='acortar' || cmd==='short'){
if(!query) return sock.sendMessage(from,{text:`Uso:.short https://google.com`})
const url = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}`
const res = await fetch(url)
const data = await res.text()
await sock.sendMessage(from,{text:`*${BOT_NAME} LINK ACORTADO*\n\nOriginal: ${query}\nAcortado: ${data}`})
}

// LETRA DE CANCION
else if(cmd==='letra'){
if(!query) return sock.sendMessage(from,{text:`Uso:.letra despacito`})
const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from,{text:`*${BOT_NAME} LETRA*\n\n${data.lyrics?.substring(0,1000)}...`})
}

// IMAGEN GOOGLE
else if(cmd==='imagen' || cmd==='img'){
if(!query) return sock.sendMessage(from,{text:`Uso:.img gatos`})
const url = `https://api.lolhuman.xyz/api/googleimage?apikey=free&query=${encodeURIComponent(query)}`
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from,{image: {url: data.result[0]}, caption: `*${BOT_NAME} IMAGEN* ${query}`})
}

// AFK
else if(cmd==='afk'){
global.afk = global.afk || {}
global.afk[sender] = query || 'AFK'
await sock.sendMessage(from,{text:`*${BOT_NAME}* ${msg.pushName} ahora esta AFK: ${query || 'AFK'}`})
}

// REGLAS
else if(cmd==='reglas'){
await sock.sendMessage(from,{text:`*REGLAS DE ${BOT_NAME}*\n\n1. No spam\n2. No +18 sin activar\n3. Respetar a todos\n4. No mandar links de virus\n5. Diviertete`})
}

// FECHA
else if(cmd==='fecha'){
const fecha = new Date().toLocaleString('es-NI',{timeZone: 'America/Managua'})
await sock.sendMessage(from,{text:`*${BOT_NAME} FECHA*\n\n${fecha}`})
}

// TIPOS DE LETRA
else if(cmd==='font'){
if(!query) return sock.sendMessage(from,{text:`Uso:.font hola`})
await sock.sendMessage(from,{text:`*${BOT_NAME} FUENTES*\n\n𝐍𝐞𝐠𝐫𝐢𝐭𝐚: ${query}\n𝑪𝒖𝒓𝒔𝒊𝒗𝒂: ${query}\n𝔊𝔬𝔱𝔦𝔠𝔞: ${query}\n𝕄𝕠𝕟𝕠: ${query}`})
}

else{
let lista=['info','ping','clima','traducir','tr','calcular','calc','qr','fondo','bg','acortar','short','letra','imagen','img','afk','reglas','fecha','font']
await sock.sendMessage(from,{text:`*${BOT_NAME} - UTILIDADES*\n\n.${lista.join('\n.')}\n\nEjemplo:.clima Managua.tr hola`})
}
}}
