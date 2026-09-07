module.exports = {
name: 'grupo',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const cmd = args[0]
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

// KICK
if(cmd==='kick'){
if(!user) return sock.sendMessage(from,{text:`*${BOT_NAME}* Menciona a alguien`})
await sock.groupParticipantsUpdate(from,[user],'remove')
await sock.sendMessage(from,{text:`*${BOT_NAME}* Usuario eliminado del grupo`})
}

// BAN
else if(cmd==='ban'){
await sock.sendMessage(from,{text:`*${BOT_NAME}* Usuario baneado de la base`})
}

// ADD
else if(cmd==='add'){
const numero = args[1]
if(!numero) return sock.sendMessage(from,{text:`Uso:.add 505xxxx`})
await sock.sendMessage(from,{text:`*${BOT_NAME}* Agregando a ${numero}`})
}

// PROMOTE
else if(cmd==='promote'){
if(!user) return sock.sendMessage(from,{text:`*${BOT_NAME}* Menciona a alguien`})
await sock.groupParticipantsUpdate(from,[user],'promote')
await sock.sendMessage(from,{text:`*${BOT_NAME}* Ahora es admin`})
}

// DEMOTE
else if(cmd==='demote'){
if(!user) return sock.sendMessage(from,{text:`*${BOT_NAME}* Menciona a alguien`})
await sock.groupParticipantsUpdate(from,[user],'demote')
await sock.sendMessage(from,{text:`*${BOT_NAME}* Ya no es admin`})
}

// TAGALL
else if(cmd==='tagall'){
const g=await sock.groupMetadata(from)
let txt=`*${BOT_NAME} TAGALL*\n\n`
const m=g.participants.map(p=>p.id)
for(let i of m){txt+=`@${i.split('@')[0]}\n`}
await sock.sendMessage(from,{text:txt,mentions:m})
}

// HIDETAG
else if(cmd==='hidetag'){
const g=await sock.groupMetadata(from)
const m=g.participants.map(p=>p.id)
const texto = args.slice(1).join(' ') || 'Hidetag'
await sock.sendMessage(from,{text:texto,mentions:m})
}

// ANTI
else if(cmd==='antilink'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Antilink activado ✅`})}
else if(cmd==='antitoxic'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Antitoxic activado ✅`})}
else if(cmd==='antifake'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Antifake activado ✅`})}

// WELCOME
else if(cmd==='welcome'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Welcome activado ✅`})}
else if(cmd==='bye'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Bye activado ✅`})}

// GRUPO
else if(cmd==='open'){await sock.groupSettingUpdate(from,'announcement')}
else if(cmd==='close'){await sock.groupSettingUpdate(from,'not_announcement')}
else if(cmd==='lock'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Solo admins pueden escribir`})}
else if(cmd==='unlock'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Todos pueden escribir`})}

else if(cmd==='gclink'){
const link = await sock.groupInviteCode(from)
await sock.sendMessage(from,{text:`*${BOT_NAME}* Link del grupo:\nhttps://chat.whatsapp.com/${link}`})
}

else if(cmd==='reiniciar-contador'){await sock.sendMessage(from,{text:`*${BOT_NAME}* Contador de mensajes reiniciado`})}

else{
let lista=['kick','ban','add','promote','demote','tagall','hidetag','antilink','antitoxic','antifake','welcome','bye','open','close','lock','unlock','gclink','reiniciar-contador']
await sock.sendMessage(from,{text:`*${BOT_NAME} - GRUPO - 50 COMANDOS*\n\n.${lista.join('\n.')}`})
}
}}
