let gachaData = {}

module.exports = {
name: 'gacha',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]

if(!gachaData[sender]) gachaData[sender] = {monedas: 1000, gemas: 50, inventario: [], pity: 0}

const waifus = [
{name: 'Rem', rareza: 'SSR', img: 'https://i.imgur.com/1.jpg'},
{name: 'Zero Two', rareza: 'SSR', img: 'https://i.imgur.com/2.jpg'},
{name: 'Nezuko', rareza: 'SR', img: 'https://i.imgur.com/3.jpg'},
{name: 'Mikasa', rareza: 'SR', img: 'https://i.imgur.com/4.jpg'},
{name: 'Asuna', rareza: 'R', img: 'https://i.imgur.com/5.jpg'},
{name: 'Sakura', rareza: 'R', img: 'https://i.imgur.com/6.jpg'},
{name: 'Hinata', rareza: 'N', img: 'https://i.imgur.com/7.jpg'}
]

// ROLL 1
if(cmd==='roll'){
if(gachaData[sender].monedas < 100) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes monedas. Tienes: ${gachaData[sender].monedas}`})
gachaData[sender].monedas -= 100
gachaData[sender].pity += 1
const personaje = rollWaifu(gachaData[sender].pity)
gachaData[sender].inventario.push(personaje)
if(personaje.rareza === 'SSR') gachaData[sender].pity = 0
await sock.sendMessage(from,{text:`*${BOT_NAME} GACHA*\n\nTe toco: *${personaje.name}*\nRareza: ${personaje.rareza} ⭐\n\nMonedas: ${gachaData[sender].monedas}\nPity: ${gachaData[sender].pity}/90`})
}

// PULL x10
else if(cmd==='pull'){
if(gachaData[sender].gemas < 10) return sock.sendMessage(from,{text:`*${BOT_NAME}* No tienes gemas. Tienes: ${gachaData[sender].gemas}`})
gachaData[sender].gemas -= 10
let resultado = ''
for(let i=0; i<10; i++){
const personaje = rollWaifu(gachaData[sender].pity)
gachaData[sender].inventario.push(personaje)
resultado += `${personaje.rareza} ${personaje.name}\n`
if(personaje.rareza === 'SSR') gachaData[sender].pity = 0
}
await sock.sendMessage(from,{text:`*${BOT_NAME} PULL x10*\n\n${resultado}\nGemas: ${gachaData[sender].gemas}`})
}

// INVENTARIO
else if(cmd==='inventario' || cmd==='inv'){
if(gachaData[sender].inventario.length === 0) return sock.sendMessage(from,{text:`*${BOT_NAME}* Inventario vacío`})
let txt = `*${BOT_NAME} INVENTARIO*\n\n`
gachaData[sender].inventario.forEach((w,i)=> txt += `${i+1}. ${w.rareza} ${w.name}\n`)
txt += `\nTotal: ${gachaData[sender].inventario.length} waifus`
await sock.sendMessage(from,{text:txt})
}

// TIENDA
else if(cmd==='tienda' || cmd==='shop'){
await sock.sendMessage(from,{text:`*${BOT_NAME} TIENDA*\n\n1. Roll x1 - 100 monedas\n2. Pull x10 - 10 gemas\n3. Caja misteriosa - 500 monedas\nCompra con:.comprar 1`})
}

// COMPRAR
else if(cmd==='comprar'){
const item = args[1]
if(item === '1'){
gachaData[sender].monedas += 500
await sock.sendMessage(from,{text:`*${BOT_NAME}* Compraste 500 monedas. Total: ${gachaData[sender].monedas}`})
}
}

// DIARIO
else if(cmd==='diario'){
gachaData[sender].monedas += 200
gachaData[sender].gemas += 5
await sock.sendMessage(from,{text:`*${BOT_NAME}* Recompensa diaria:\n+200 monedas\n+5 gemas\nTotal: ${gachaData[sender].monedas} monedas | ${gachaData[sender].gemas} gemas`})
}

// VENDER
else if(cmd==='vender'){
const num = parseInt(args[1])-1
if(!gachaData[sender].inventario[num]) return sock.sendMessage(from,{text:`*${BOT_NAME}* Ese numero no existe`})
const vendido = gachaData[sender].inventario.splice(num,1)[0]
const precio = vendido.rareza === 'SSR'? 500 : vendido.rareza === 'SR'? 200 : 50
gachaData[sender].monedas += precio
await sock.sendMessage(from,{text:`*${BOT_NAME}* Vendiste ${vendido.name} por ${precio} monedas`})
}

// PERFIL GACHA
else if(cmd==='perfil-gacha'){
await sock.sendMessage(from,{text:`*${BOT_NAME} PERFIL GACHA*\n\nMonedas: ${gachaData[sender].monedas}\nGemas: ${gachaData[sender].gemas}\nWaifus: ${gachaData[sender].inventario.length}\nPity: ${gachaData[sender].pity}/90`})
}

else{
let lista=['roll','pull','inventario','inv','tienda','shop','comprar','diario','vender','perfil-gacha']
await sock.sendMessage(from,{text:`*${BOT_NAME} - GACHA*\n\n.${lista.join('\n.')}\n\nEjemplo:.roll.pull.diario`})
}
}}

function rollWaifu(pity){
const rate = pity >= 90? 100 : Math.random()*100
if(rate < 2) return {name: 'SSR Waifu', rareza: 'SSR'}
else if(rate < 10) return {name: 'SR Waifu', rareza: 'SR'}
else if(rate < 40) return {name: 'R Waifu', rareza: 'R'}
else return {name: 'N Waifu', rareza: 'N'}
}
