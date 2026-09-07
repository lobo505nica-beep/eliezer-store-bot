let puntos = {}
let ticTacToe = {}
let conecta4 = {}

module.exports = {
name: 'juegos',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid
const cmd = args[0]

if(!puntos[sender]) puntos[sender] = 0

// PIEDRA PAPEL TIJERA
if(cmd==='ppt'){
const user = args[1]
const opciones = ['piedra','papel','tijera']
const bot = opciones[Math.floor(Math.random()*3)]
if(!user) return sock.sendMessage(from,{text:`Uso:.ppt piedra/papel/tijera`})
let res = ''
if(user === bot) res = 'Empate'
else if((user==='piedra'&&bot==='tijera')||(user==='papel'&&bot==='piedra')||(user==='tijera'&&bot==='papel')){
res = 'Ganaste 🎉'; puntos[sender] += 10
}else{res = 'Perdiste 😢'; puntos[sender] -= 5}
await sock.sendMessage(from,{text:`*${BOT_NAME} PPT*\nTu: ${user}\nBot: ${bot}\nResultado: ${res}\nPuntos: ${puntos[sender]}`})
}

// DADO
else if(cmd==='dado'){
const dado = Math.floor(Math.random()*6)+1
await sock.sendMessage(from,{text:`*${BOT_NAME}* Tiraste: ${dado} 🎲`})
}

// MONEDA
else if(cmd==='moneda'){
const res = Math.random()>0.5?'Cara':'Cruz'
await sock.sendMessage(from,{text:`*${BOT_NAME}* Salió: ${res} 🪙`})
}

// CASINO
else if(cmd==='casino'){
const apuesta = parseInt(args[1]) || 100
const win = Math.random()>0.5
if(win){puntos[sender] += apuesta; await sock.sendMessage(from,{text:`*${BOT_NAME}* Ganaste $${apuesta}! Total: ${puntos[sender]}`})}
else{puntos[sender] -= apuesta; await sock.sendMessage(from,{text:`*${BOT_NAME}* Perdiste $${apuesta}. Total: ${puntos[sender]}`})}
}

// ADIVINA
else if(cmd==='adivina'){
const num = Math.floor(Math.random()*10)+1
const userNum = parseInt(args[1])
if(!userNum) return sock.sendMessage(from,{text:`Uso:.adivina 1-10`})
if(userNum === num){puntos[sender] += 20; await sock.sendMessage(from,{text:`*${BOT_NAME}* Acertaste! Era ${num}\n+20 puntos. Total: ${puntos[sender]}`})}
else{await sock.sendMessage(from,{text:`*${BOT_NAME}* Fallaste. Era ${num}`})}
}

// TIC TAC TOE -.ttt
else if(cmd==='ttt'){
if(!ticTacToe[from]){
ticTacToe[from] = {tablero: ['1','2','3','4','5','6','7','8','9'], turno: 'X', jugadores: [sender]}
await sock.sendMessage(from,{text:`*${BOT_NAME} TIC TAC TOE*\n\n${mostrarTablero(ticTacToe[from].tablero)}\n\nTurno: X\nJuega con:.ttt 1-9`})
}else{
const pos = parseInt(args[1])-1
if(pos < 0 || pos > 8) return sock.sendMessage(from,{text:`Usa numeros del 1-9`})
if(ticTacToe[from].tablero[pos] === 'X' || ticTacToe[from].tablero[pos] === 'O') return sock.sendMessage(from,{text:`Esa casilla ya esta ocupada`})
ticTacToe[from].tablero[pos] = ticTacToe[from].turno
const ganador = checkGanador(ticTacToe[from].tablero)
let texto = `*${BOT_NAME} TIC TAC TOE*\n\n${mostrarTablero(ticTacToe[from].tablero)}\n\n`
if(ganador){texto += `Gano: ${ganador}`; delete ticTacToe[from]}else{ticTacToe[from].turno = ticTacToe[from].turno === 'X'? 'O' : 'X'; texto += `Turno: ${ticTacToe[from].turno}`}
await sock.sendMessage(from,{text:texto})
}
}

// CONECTA 4 -.c4
else if(cmd==='c4'){
if(!conecta4[from]){
conecta4[from] = {tablero: Array(6).fill().map(() => Array(7).fill('⚫')), turno: '🔴'}
await sock.sendMessage(from,{text:`*${BOT_NAME} CONECTA 4*\n\n${mostrarC4(conecta4[from].tablero)}\n1 2 3 4 5 6 7\n\nTurno: 🔴\nJuega con:.c4 1-7`})
}else{
const col = parseInt(args[1])-1
if(col < 0 || col > 6) return sock.sendMessage(from,{text:`Usa columnas del 1-7`})
for(let i=5; i>=0; i--){
if(conecta4[from].tablero[i][col] === '⚫'){
conecta4[from].tablero[i][col] = conecta4[from].turno
break
}
}
let texto = `*${BOT_NAME} CONECTA 4*\n\n${mostrarC4(conecta4[from].tablero)}\n1 2 3 4 5 6 7\n\n`
const ganador = checkC4(conecta4[from].tablero)
if(ganador){texto += `Gano: ${ganador}`; delete conecta4[from]}else{conecta4[from].turno = conecta4[from].turno === '🔴'? '🟡' : '🔴'; texto += `Turno: ${conecta4[from].turno}`}
await sock.sendMessage(from,{text:texto})
}
}

// RANK
else if(cmd==='rank'){
await sock.sendMessage(from,{text:`*${BOT_NAME}* Tus puntos: ${puntos[sender]}`})
}

// TOP
else if(cmd==='top'){
let top = Object.entries(puntos).sort((a,b)=>b[1]-a[1]).slice(0,5)
let txt = `*${BOT_NAME} TOP 5*\n\n`
top.forEach((v,i)=>txt+=`${i+1}. @${v[0].split('@')[0]} - ${v[1]} pts\n`)
await sock.sendMessage(from,{text:txt,mentions:top.map(v=>v[0])})
}

else{
let lista=['ppt','dado','moneda','casino','adivina','ttt','c4','rank','top']
await sock.sendMessage(from,{text:`*${BOT_NAME} - JUEGOS*\n\n.${lista.join('\n.')}\n\nEjemplo:.ttt 5.c4 3`})
}

// FUNCIONES
function mostrarTablero(t){
return `${t[0]}|${t[1]}|${t[2]}\n${t[3]}|${t[4]}|${t[5]}\n${t[6]}|${t[7]}|${t[8]}`
}
function checkGanador(t){
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
for(let w of wins){if(t[w[0]]===t[w[1]]&&t[w[1]]===t[w[2]]&&t[w[0]]!==' ')return t[w[0]]}
return null
}
function mostrarC4(t){
return t.map(fila=>fila.join('')).join('\n')
}
function checkC4(t){return null} // simplificado
}}
