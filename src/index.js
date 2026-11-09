/**
 * Datcod sitesi — Cloudflare Worker
 *
 * Tek iş yapar: /api/contact adresine gelen form gönderimlerini doğrulayıp
 * Resend üzerinden info@datcod.com'a e-posta olarak iletir. Geri kalan her
 * istek statik dosyalara düşer.
 *
 * Gereken secret'lar (Worker → Settings → Variables and Secrets):
 *   RESEND_API_KEY        Resend API anahtarı
 *   TURNSTILE_SECRET_KEY  Turnstile gizli anahtarı
 */

const ALICI = 'info@datcod.com';
const GONDEREN = 'Datcod Web Formu <form@send.datcod.com>';

// Aynı IP'den kısa sürede gelen tekrarlı gönderimleri sınırlamak için.
const PENCERE_SN = 60;
const PENCERE_LIMIT = 3;
const sonGonderimler = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return cevap({ ok: false, hata: 'Yalnızca POST kabul edilir.' }, 405);
      }
      return iletisimFormu(request, env);
    }

    // Diğer her şey statik dosya
    return env.ASSETS.fetch(request);
  },
};

async function iletisimFormu(request, env) {
  try {
    if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
      console.error('Eksik secret: RESEND_API_KEY veya TURNSTILE_SECRET_KEY tanımlı değil.');
      return cevap({ ok: false, hata: 'Sunucu yapılandırması eksik.' }, 500);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'bilinmiyor';
    if (hizSiniriAsildi(ip)) {
      return cevap({ ok: false, hata: 'Çok sık deneme yaptınız. Bir dakika sonra tekrar deneyin.' }, 429);
    }

    let veri;
    try {
      veri = await request.json();
    } catch {
      return cevap({ ok: false, hata: 'Geçersiz istek.' }, 400);
    }

    // Bal küpü: insanlar bu alanı göremez, botlar doldurur.
    if (veri.website) {
      return cevap({ ok: true });
    }

    const ad = kirp(veri.name, 120);
    const eposta = kirp(veri.email, 160);
    const mesaj = kirp(veri.message, 5000);
    const firma = kirp(veri.company, 160);
    const telefon = kirp(veri.phone, 60);
    const konu = kirp(veri.topic, 120);

    if (!ad || !eposta || !mesaj) {
      return cevap({ ok: false, hata: 'Ad, e-posta ve mesaj zorunlu.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) {
      return cevap({ ok: false, hata: 'E-posta adresi geçersiz.' }, 400);
    }

    const turnstileGecerli = await turnstileDogrula(veri.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileGecerli) {
      return cevap({ ok: false, hata: 'Doğrulama başarısız. Sayfayı yenileyip tekrar deneyin.' }, 403);
    }

    const gonderildi = await resendIleGonder(env.RESEND_API_KEY, {
      ad, eposta, firma, telefon, konu, mesaj, ip,
      ulke: request.headers.get('CF-IPCountry') || '-',
    });

    if (!gonderildi.ok) {
      console.error('Resend hatası:', gonderildi.detay);
      return cevap({ ok: false, hata: 'Mesaj gönderilemedi. Lütfen info@datcod.com adresine yazın.' }, 502);
    }

    return cevap({ ok: true });
  } catch (err) {
    console.error('Beklenmeyen hata:', err && err.stack ? err.stack : String(err));
    return cevap({ ok: false, hata: 'Beklenmeyen bir hata oluştu.' }, 500);
  }
}

async function turnstileDogrula(token, secret, ip) {
  if (!token) return false;
  const govde = new FormData();
  govde.append('secret', secret);
  govde.append('response', token);
  if (ip && ip !== 'bilinmiyor') govde.append('remoteip', ip);

  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: govde,
  });
  if (!r.ok) return false;
  const sonuc = await r.json();
  return sonuc.success === true;
}

async function resendIleGonder(apiKey, f) {
  const html = `
    <h2 style="margin:0 0 16px;font:600 18px system-ui">Web sitesinden yeni talep</h2>
    <table style="border-collapse:collapse;font:14px system-ui">
      ${satir('Ad Soyad', f.ad)}
      ${satir('E-posta', f.eposta)}
      ${satir('Firma', f.firma || '-')}
      ${satir('Telefon', f.telefon || '-')}
      ${satir('Konu', f.konu || '-')}
    </table>
    <h3 style="margin:20px 0 8px;font:600 15px system-ui">Mesaj</h3>
    <div style="font:14px/1.6 system-ui;white-space:pre-wrap">${kacir(f.mesaj)}</div>
    <p style="margin-top:24px;color:#777;font:12px system-ui">
      IP: ${kacir(f.ip)} · Ülke: ${kacir(f.ulke)} · datcod.com iletişim formu
    </p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: GONDEREN,
      to: [ALICI],
      reply_to: f.eposta,
      subject: `Web sitesi talebi — ${f.konu || 'Genel'} · ${f.ad}`,
      html,
    }),
  });

  if (!r.ok) {
    return { ok: false, detay: `${r.status} ${await r.text()}` };
  }
  return { ok: true };
}

/* ---------- yardımcılar ---------- */

function satir(baslik, deger) {
  return `<tr>
    <td style="padding:4px 16px 4px 0;color:#666">${baslik}</td>
    <td style="padding:4px 0;font-weight:600">${kacir(deger)}</td>
  </tr>`;
}

function kacir(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kirp(deger, enFazla) {
  return String(deger == null ? '' : deger).trim().slice(0, enFazla);
}

function hizSiniriAsildi(ip) {
  const simdi = Date.now();
  const kayitlar = (sonGonderimler.get(ip) || []).filter((t) => simdi - t < PENCERE_SN * 1000);
  if (kayitlar.length >= PENCERE_LIMIT) return true;
  kayitlar.push(simdi);
  sonGonderimler.set(ip, kayitlar);
  if (sonGonderimler.size > 5000) sonGonderimler.clear();
  return false;
}

function cevap(govde, durum = 200) {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
