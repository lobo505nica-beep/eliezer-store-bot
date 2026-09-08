let economia = {}

module.exports = {
name: 'economia',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]
const userName = msg.pushName || 'Usuario'

if(!economia[sender]) economia[sender] = {billetera: 100, banco: 0, ultimoTrabajo: 0, casado: null}

// BALANCE
if(cmd==='balance' || cmd==='bal'){
await sock.sendMessage(from,{text:`*${BOT_NAME} BALANCE*\n\n💰 Billetera: $${economia[sender].billetera}\n🏦 Banco: $${economia[sender].banco}\n💵 Total: $${economia[sender].billetera + economia[sender].banco}`})
}

// TRABAJAR
else if(cmd==='trabajar' || cmd==='work'){
const ahora = Date.now()
if(ahora - economia[sender].ultimoTrabajo < 60000) return sock.sendMessage(from,{text:`*${BOT_NAME}* Espera 1 min para volver a trabajar`})
const ganancia = Math.floor(Math.random()*500)+100
economia[sender].billetera += ganancia
economia[sender].ultimoTrabajo = ahora
const trabajos = ['Programador','Chef','Taxista','Doctor','Streamer']
const trabajo = trabajos[Math.floor(Math.random()*trabajos.length)]
await sock.sendMessage(from,{text:`*${BOT_NAME}* Trabajaste de ${trabajo}\nGanaste: $${ganancia}\nBilletera: $${economia[sender].billetera}`})
}

// DEPOSITAR
else if(cmd==='depositar' || cmd==='dep'){
const cantidad = parseInt(args[1])
if(!cantidad || cantidad > economia[sender].billetera) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes esa cantidad`})
economia[sender].billetera -= cantidad
economia[sender].banco += cantidad
await sock.sendMessage(from,{text:`*${BOT_NAME}* Depositaste $${cantidad}\nBanco: $${economia[sender].banco}`})
}

// RETIRAR
else if(cmd==='retirar' || cmd==='ret'){
const cantidad = parseInt(args[1])
if(!cantidad || cantidad > economia[sender].banco) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes esa cantidad en el banco`})
economia[sender].banco -= cantidad
economia[sender].billetera += cantidad
await sock.sendMessage(from,{text:`*${BOT_NAME}* Retiraste $${cantidad}\nBilletera: $${economia[sender].billetera}`})
}

// PAGAR
else if(cmd==='pagar'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
const cantidad = parseInt(args[2])
if(!user ||!cantidad) return sock.sendMessage(from,{text:`Uso:.pagar @usuario 100`})
if(economia[sender].billetera < cantidad) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes suficiente`})
if(!economia[user]) economia[user] = {billetera: 100, banco: 0, ultimoTrabajo: 0, casado: null}
economia[sender].billetera -= cantidad
economia[user].billetera += cantidad
await sock.sendMessage(from,{text:`*${BOT_NAME}* Le pagaste $${cantidad} a @${user.split('@')[0]}`, mentions:[user]})
}

// ROBAR
else if(cmd==='robar'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if(!user) return sock.sendMessage(from,{text:`Uso:.robar @usuario`})
if(!economia[user]) return sock.sendMessage(from,{text:`*${BOT_NAME}* Ese usuario no tiene cuenta`})
const ahora = Date.now()
if(ahora - economia[sender].ultimoTrabajo < 300000) return sock.sendMessage(from,{text:`*${BOT_NAME}* Espera 5 min para robar de nuevo`})
const exito = Math.random() > 0.5
const cantidad = Math.floor(Math.random()*200)+50
if(exito){
economia[user].billetera -= cantidad
economia[sender].billetera += cantidad
await sock.sendMessage(from,{text:`*${BOT_NAME}* Robaste $${cantidad} a @${user.split('@')[0]} 😈`, mentions:[user]})
}else{
economia[sender].billetera -= 100
await sock.sendMessage(from,{text:`*${BOT_NAME}* Te atraparon! Perdiste $100`})
}
economia[sender].ultimoTrabajo = ahora
}

// CASARSE
else if(cmd==='casarse' || cmd==='marry'){
const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if(!user) return sock.sendMessage(from,{text:`Uso:.casarse @usuario`})
if(economia[sender].casado) return sock.sendMessage(from,{text:`*${BOT_NAME}* Ya estas casado`})
economia[sender].casado = user
if(!economia[user]) economia[user] = {billetera: 100, banco: 0, ultimoTrabajo: 0, casado: null}
economia[user].casado = sender
await sock.sendMessage(from,{text:`*${BOT_NAME}* 💍 @${sender.split('@')[0]} y @${user.split('@')[0]} ahora estan casados!`, mentions:[sender, user]})
}

// DIVORCIAR
else if(cmd==='divorciar' || cmd==='divorce'){
if(!economia[sender].casado) return sock.sendMessage(from,{text:`*${BOT_NAME}* No estas casado`})
const ex = economia[sender].casado
economia[sender].casado = null
if(economia[ex]) economia[ex].casado = null
await sock.sendMessage(from,{text:`*${BOT_NAME}* 💔 Se divorciaron`})
}

// SLOTS
else if(cmd==='slots'){
const apuesta = parseInt(args[1]) || 50
if(economia[sender].billetera < apuesta) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes suficiente`})
const emojis = ['🍒','🍋','🔔','⭐','💎']
const r1 = emojis[Math.floor(Math.random()*5)]
const r2 = emojis[Math.floor(Math.random()*5)]
const r3 = emojis[Math.floor(Math.random()*5)]
let ganancia = 0
if(r1===r2 && r2===r3) ganancia = apuesta*5
else if(r1===r2 || r2===r3 || r1===r3) ganancia = apuesta*2
economia[sender].billetera += ganancia - apuesta
await sock.sendMessage(from,{text:`*${BOT_NAME} SLOTS*\n[${r1} ${r2} ${r3}]\n${ganancia>0?`Ganaste $${ganancia}`:`Perdiste $${apuesta}`}\nBilletera: $${economia[sender].billetera}`})
}

// TOP ECONOMIA
else if(cmd==='top-econ'){
let top = Object.entries(economia).sort((a,b)=>(b[1].billetera+b[1].banco)-(a[1].billetera+a[1].banco)).slice(0,5)
let txt = `*${BOT_NAME} TOP RICOS*\n\n`
top.forEach((v,i)=> txt += `${i+1}. @${v[0].split('@')[0]} - $${v[1].billetera+v[1].banco}\n`)
await sock.sendMessage(from,{text:txt, mentions:top.map(v=>v[0])})
}

else{
let lista=['balance','bal','trabajar','work','depositar','dep','retirar','ret','pagar','robar','casarse','marry','divorciar','slots','top-econ']
await sock.sendMessage(from,{text:`*${BOT_NAME} - ECONOMIA*\n\n.${lista.join('\n.')}\n\nEjemplo:.trabajar.pagar @user 100`})
}
}}
