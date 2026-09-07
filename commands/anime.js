module.exports = {
name: 'anime',
execute: async (sock, msg, args, BOT_NAME) => {
const from = msg.key.remoteJid
const cmd = args[0]
const query = args.slice(1).join(' ')

// WAIFU RANDOM
if(cmd==='waifu'){
const url = 'https://api.waifu.pics/sfw/waifu'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} WAIFU*`})
}

// NEKO
else if(cmd==='neko'){
const url = 'https://api.waifu.pics/sfw/neko'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} NEKO*`})
}

// MEGUMIN
else if(cmd==='megumin'){
const url = 'https://api.waifu.pics/sfw/megumin'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} MEGUMIN*`})
}

// SHINOBU
else if(cmd==='shinobu'){
const url = 'https://api.waifu.pics/sfw/shinobu'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} SHINOBU*`})
}

// WALLPAPER ANIME
else if(cmd==='wallpaper'){
const url = 'https://api.waifu.pics/sfw/wallpaper'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {image: {url: data.url}, caption: `*${BOT_NAME} WALLPAPER*`})
}

// BUSCAR ANIME
else if(cmd==='search-anime' || cmd==='anime'){
if(!query) return sock.sendMessage(from,{text:`Uso:.anime naruto`})
const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
const res = await fetch(url)
const data = await res.json()
const anime = data.data[0]
await sock.sendMessage(from, {
image: {url: anime.images.jpg.image_url},
caption: `*${BOT_NAME} INFO ANIME*\n\n*Titulo:* ${anime.title}\n*Episodios:* ${anime.episodes}\n*Score:* ${anime.score}\n*Estado:* ${anime.status}\n*Genero:* ${anime.genres.map(g=>g.name).join(', ')}`
})
}

// PERSONAJE
else if(cmd==='character' || cmd==='character-anime'){
if(!query) return sock.sendMessage(from,{text:`Uso:.character itachi`})
const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`
const res = await fetch(url)
const data = await res.json()
const char = data.data[0]
await sock.sendMessage(from, {
image: {url: char.images.jpg.image_url},
caption: `*${BOT_NAME} PERSONAJE*\n\n*Nombre:* ${char.name}\n*Favoritos:* ${char.favorites}\n*Sobre:* ${char.about?.substring(0,300)}...`
})
}

// MANGA
else if(cmd==='manga'){
if(!query) return sock.sendMessage(from,{text:`Uso:.manga one piece`})
const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`
const res = await fetch(url)
const data = await res.json()
const manga = data.data[0]
await sock.sendMessage(from, {
image: {url: manga.images.jpg.image_url},
caption: `*${BOT_NAME} MANGA*\n\n*Titulo:* ${manga.title}\n*Capitulos:* ${manga.chapters}\n*Score:* ${manga.score}\n*Estado:* ${manga.status}`
})
}

// QUOTE ANIME
else if(cmd==='quote-anime'){
const url = 'https://animechan.xyz/api/random'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from,{text:`*${BOT_NAME} QUOTE*\n\n"${data.quote}"\n- ${data.character} de ${data.anime}`})
}

// GIF ANIME
else if(cmd==='gif-anime'){
const url = 'https://api.waifu.pics/sfw/hug'
const res = await fetch(url)
const data = await res.json()
await sock.sendMessage(from, {video: {url: data.url}, caption: `*${BOT_NAME} GIF*`})
}

// TOP ANIME
else if(cmd==='top-anime'){
const url = 'https://api.jikan.moe/v4/top/anime'
const res = await fetch(url)
const data = await res.json()
let txt = `*${BOT_NAME} TOP 5 ANIMES*\n\n`
data.data.slice(0,5).forEach((a,i)=> txt += `${i+1}. ${a.title} - ${a.score} ⭐\n`)
await sock.sendMessage(from,{text:txt})
}

else{
let lista=['waifu','neko','megumin','shinobu','wallpaper','anime','manga','character','quote-anime','gif-anime','top-anime']
await sock.sendMessage(from,{text:`*${BOT_NAME} - ANIME*\n\n.${lista.join('\n.')}\n\nEjemplo:.anime naruto.character luffy`})
}
}}
