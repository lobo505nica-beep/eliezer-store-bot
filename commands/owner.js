const fs = require('fs')
const { exec } = require('child_process')

const OWNER = ['50583318551@s.whatsapp.net'] // EliezerStore
const OWNER_NAME = 'EliezerStore'

module.exports = {
name: 'owner',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]

// VERIFICAR OWNER
if(!OWNER.includes(sender)) return sock.sendMessage(from,{text:`*${BOT_NAME}* ❌ Solo ${OWNER_NAME} puede usar esto`})

// BROADCAST
if(cmd==='broadcast' || cmd==='bc'){
const texto = args.slice(1).join(' ')
if(!texto) return sock.sendMessage(from,{text:`Uso:.bc hola a todos`})
const chats = Object.keys(sock.chats || {})
let enviados = 0
for(let chat of chats){
try{
await sock.sendMessage(chat, {text: `*${BOT_NAME} BROADCAST*\n\n${texto}\n\n- ${OWNER_NAME}`})
enviados++
await new Promise(r => setTimeout(r, 1000))
}catch{}
}
await sock.sendMessage(from,{text:`*${BOT_NAME}* ✅ Enviado a ${enviados} chats`})
}

// EVAL
else if(cmd==='eval'){
try{
let result = eval(args.slice(1).join(' '))
if(typeof result!== 'string') result = require('util').inspect(result)
await sock.sendMessage(from,{text:`*${OWNER_NAME} EVAL*\n\n${result}`})
}catch(e){await sock.sendMessage(from,{text:`Error: ${e}`})}
}

// EXEC
else if(cmd==='exec'){
exec(args.slice(1).join(' '), async (err, stdout, stderr) => {
if(err) return sock.sendMessage(from,{text:`Error: ${err}`})
await sock.sendMessage(from,{text:`*${OWNER_NAME} EXEC*\n\n${stdout || stderr}`})
})
}

// REINICIAR
else if(cmd==='reiniciar' || cmd==='restart'){
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 🔄 Reiniciando bot...`})
process.exit(1)
}

// APAGAR
else if(cmd==='apagar' || cmd==='shutdown'){
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 🔴 Apagando bot...`})
process.exit(0)
}

// JOIN
else if(cmd==='join'){
const link = args[1]
if(!link) return sock.sendMessage(from,{text:`Uso:.join https://chat.whatsapp.com/xxx`})
try{
const code = link.split('https://chat.whatsapp.com/')[1]
const res = await sock.groupAcceptInvite(code)
await sock.sendMessage(from,{text:`*${OWNER_NAME}* ✅ Entre al grupo: ${res}`})
}catch(e){await sock.sendMessage(from,{text:`Link invalido`})}
}

// LEAVE
else if(cmd==='leave'){
await sock.groupLeave(from)
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 👋 Sali del grupo`})
}

// BACKUP
else if(cmd==='backup'){
try{
const data = JSON.stringify(require('../../database.json'))
fs.writeFileSync('./backup.json', data)
await sock.sendMessage(from,{document: fs.readFileSync('./backup.json'), fileName: 'backup.json', mimetype: 'application/json'})
}catch(e){await sock.sendMessage(from,{text:`No hay database`})}
}

// BLOQUEAR
else if(cmd==='block'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if(!user) return sock.sendMessage(from,{text:`Menciona a alguien`})
await sock.updateBlockStatus(user, 'block')
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 🔨 Usuario bloqueado`})
}

// DESBLOQUEAR
else if(cmd==='unblock'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if(!user) return sock.sendMessage(from,{text:`Menciona a alguien`})
await sock.updateBlockStatus(user, 'unblock')
await sock.sendMessage(from,{text:`*${OWNER_NAME}* ✅ Usuario desbloqueado`})
}

// ADD OWNER
else if(cmd==='addowner'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if(!user) return sock.sendMessage(from,{text:`Menciona a alguien`})
OWNER.push(user)
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 👑 ${user} ahora es owner`})
}

// MODO PUBLICO/PRIVADO
else if(cmd==='public'){
global.mode = 'public'
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 🌍 Modo: PUBLICO`})
}
else if(cmd==='self'){
global.mode = 'self'
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 🔒 Modo: SOLO OWNER`})
}

// ANTI LLAMADA
else if(cmd==='anticall'){
global.anticall = true
await sock.sendMessage(from,{text:`*${OWNER_NAME}* 📵 Anticall activado`})
}

else{
let lista=['broadcast','bc','eval','exec','reiniciar','restart','apagar','shutdown','backup','join','leave','block','unblock','addowner','public','self','anticall']
await sock.sendMessage(from,{text:`*${OWNER_NAME} - PANEL OWNER*\n\n.${lista.join('\n.')}`})
}
}}
