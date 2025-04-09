
const venom = require('venom-bot');

let isOwnerOnline = false;
let lastSeen = new Date();

venom
  .create({
    session: 'bot-wa',
    multidevice: true,
    headless: true,
    puppeteerOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  })
  .then((client) => start(client))
  .catch((error) => console.log('Error venom:', error));

function start(client) {
  console.log('✅ Bot is running...');

  client.onMessage(async (message) => {
    if (!message.isGroupMsg) {
      const now = new Date();
      const diffInMs = now - lastSeen;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (isOwnerOnline) {
        await client.sendText(message.from, `👋 Hai! Owner sedang *ONLINE*.
Berikut menu yang tersedia:
1. Buat stiker → ketik: !stiker + kirim gambar
2. Info lainnya → ketik: !info
        `);
      } else if (diffInHours >= 1) {
        await client.sendText(message.from, `💤 Owner sedang *OFFLINE*.
Pesanmu sudah diterima dan akan dibalas saat owner kembali online.`);
      }

      if (message.body === '!online') {
        isOwnerOnline = true;
        lastSeen = new Date();
        await client.sendText(message.from, 'Status owner diubah ke *ONLINE*');
      }

      if (message.body === '!offline') {
        isOwnerOnline = false;
        lastSeen = new Date();
        await client.sendText(message.from, 'Status owner diubah ke *OFFLINE*');
      }

      // Fitur stiker otomatis
      if (message.mimetype && message.isMedia && message.caption === '!stiker') {
        const mediaData = await client.decryptFile(message);
        await client.sendImageAsSticker(message.from, mediaData, {
          author: 'Bot WA',
          pack: 'AutoStiker',
        });
      }
    }
  });
}
