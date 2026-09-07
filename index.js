const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const fs = require('fs')
const pino = require('pino')
const prefix = '.'
const BOT_NAME = 'eliezerstorebot'

const commands = new Map()
fs.readdirSync('./commands').filter(f => f.endsWith('.js')).forEach(f => {
    const cmd = require(`./commands/${f}`)
    commands.set(cmd.name, cmd)
})

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const sock = makeWASocket({
        auth: state,
        logger: pino({level: 'silent'}),
        browser: ['eliezerstorebot', 'Chrome', '1.0.0']
    })

    sock.ev.on('connection.update', (u) => {
        if(u.pairingCode) console.log(`\n=== eliezerstorebot ===\nCODIGO: ${u.pairingCode}\n`)
        if(u.connection === 'open') console.log(`${BOT_NAME} conectado ✅`)
        if(u.connection === 'close') startBot()
    })
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if(!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        if(!text.startsWith(prefix)) return
        const args = text.slice(prefix.length).trim().split(/ +/)
        const cmd = args.shift().toLowerCase()
        if(commands.has(cmd)) commands.get(cmd).execute(sock, msg, args, BOT_NAME)
    })
}
startBot()
