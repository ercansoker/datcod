# Datcod — yeni web sitesi

datcod.com'un yenilenmiş hâli. Bağımlılık yok, build adımı yok: saf HTML + CSS + JavaScript.

## Yapı

```
datcod/
├── index.html
└── assets/
    ├── css/style.css
    ├── js/main.js
    └── img/
        ├── logo.png             (beyaz wordmark — koyu zemin için)
        ├── logo-dark.png        (koyu wordmark — açık zemin için)
        ├── favicon.png
        ├── slide-1-depo.jpg     (hazır)
        ├── slide-2-satinalma.jpg    ┐
        ├── slide-3-entegrasyon.jpg  │ placeholder —
        ├── slide-4-mail.jpg         │ PROMPTS.md'ye bak
        ├── slide-5-whatsapp.jpg     ┘
        └── PROMPTS.md           (görsel üretim promptları)
```

## Logo

`logo.png` ve `favicon.png` mevcut datcod.com'dan (Wix medya) alınmış orijinal marka
varlıklarıdır. Orijinal logo yalnızca beyaz metin + amber vurgu içeriyor; sayfa
kaydırıldığında başlık beyaza döndüğü için beyaz metin `#10162a` ile değiştirilerek
`logo-dark.png` üretildi (amber vurgu korundu). İkisi CSS ile `.site-header.solid`
durumuna göre değiştirilir.

Logodaki amber `#f4b108` renk paletine `--gold` olarak eklendi ve bölüm başlıklarındaki
nokta işaretlerinde kullanılıyor.

Tek dış bağımlılık Google Fonts (Space Grotesk + Inter). İnternetsiz ortamda sistem
fontlarına düşer, sayfa bozulmaz.

## Yerel önizleme

Proje kökündeki `.claude/launch.json` içinde `datcod-site` yapılandırması tanımlı
(statik dosya sunucusu, port 5530). Claude Code içinden başlatılabilir, ya da
klasörü herhangi bir statik sunucuyla açabilirsiniz:

```bash
npx serve C:/Users/ercan.soker/Desktop/Logiby/datcod -l 5530
```

Ardından http://localhost:5530 adresini açın.

## Yayın

**Cloudflare Workers** (statik varlık sunumu) üzerinde, `ercansoker/datcod`
reposunun `main` dalından. Derleme adımı yok; depo kökü olduğu gibi yayınlanır.

Yapılandırma `wrangler.jsonc` içinde. Build command boş kalır, deploy komutu
`npx wrangler deploy`. `main` dalına her push otomatik yayına gider.

| Dosya | İşlevi |
| --- | --- |
| `wrangler.jsonc` | Proje adı, statik varlık dizini, 404 davranışı |
| `_headers` | Önbellek ve güvenlik başlıkları |
| `.assetsignore` | Depoda durup yayınlanmayacak dosyalar |

Not: Cloudflare yeni hesaplarda Pages akışını gizleyip Workers'a yönlendiriyor.
Sonuç aynı — statik site, ücretsiz katman, global CDN.

Alan adı `datcod.com` GoDaddy'de kayıtlı, ad sunucuları şu an Wix'e bakıyor
(`NS14/NS15.WIXDNS.NET`). Yeni siteye geçmek için GoDaddy tarafında ad
sunucularının Cloudflare'e çevrilmesi gerekir.

## İletişim formu

Form `/api/contact` adresine JSON gönderir; `src/index.js` içindeki
Worker doğrulayıp **Resend** üzerinden `info@datcod.com` adresine iletir.
Gönderenin adresi `Reply-To` olarak eklenir, yani gelen maile doğrudan
cevap verilebilir.

Koruma katmanları: Cloudflare **Turnstile**, gizli bal küpü alanı ve IP başına
dakikada 3 gönderim sınırı.

### Kurulum (tek seferlik)

**1. Resend hesabı ve alt alan adı doğrulaması**

[resend.com](https://resend.com) → Domains → Add Domain → `send.datcod.com`

Resend birkaç DNS kaydı verir (DKIM + SPF). Bunları Cloudflare DNS panelinden
ekleyin. Alt alan adı kullanmamızın sebebi: kök alanın Alastyr SPF kaydına hiç
dokunulmaması, e-posta akışının risk altına girmemesi.

**2. Turnstile widget’ı**

Cloudflare → Turnstile → Add Site → `datcod.com` ve `www.datcod.com`

İki anahtar üretir:

- **Site key** (herkese açık) → `index.html` içindeki
  `data-sitekey="TURNSTILE_SITE_KEY"` yerine yazılır
- **Secret key** (gizli) → Worker secret olarak eklenir

**3. Worker secret’ları**

Workers & Pages → datcod → Settings → Variables and Secrets:

| Ad | Değer |
| --- | --- |
| `RESEND_API_KEY` | Resend → API Keys’ten üretilen anahtar |
| `TURNSTILE_SECRET_KEY` | Turnstile’ın verdiği gizli anahtar |

İkisi de **Secret / Encrypt** olarak kaydedilmeli, düz metin değil.
Secret eksikse form 500 döner ve Worker günlüğüne `Eksik secret` satırı düşer.

## Bölümler

| Bölüm | Anchor | İçerik |
| --- | --- | --- |
| Hero | `#anasayfa` | Ana mesaj, CTA'lar, 5 slaytlık görsel slider |
| Ürünler | `#urunler` | 5 ürün kartı (Lojistik tam genişlikte, ilk sırada) + TYRONAI bloğu (`#tyronai`) |
| Hizmetler | `#cozumler` | 7 hizmet kartı |
| Süreç | `#surec` | 6 adımlı yol haritası |
| Hakkımızda | `#hakkimizda` | Şirket anlatısı + 4 değer maddesi |
| İletişim | `#iletisim` | İletişim bilgileri, WhatsApp, form |

Ürün açıklamaları ve özellik listeleri `logiby_main/Logiby.Landing/{satinalma,idari-isler,siparis-teslimat,depo-stok}`
sayfalarındaki (ve `lojistik/`) mevcut metinlerden uyarlandı; iki site arasında tutarlılık için oralarda
bir değişiklik olursa buraya da yansıtılmalı.

## Hero slider

5 slayt, 5,5 saniyede bir çapraz geçişle döner. Fare üzerine gelince veya bir öğe
odaklanınca durur, ayrılınca devam eder; sekme arka plandayken de durur.
`prefers-reduced-motion` açıksa otomatik dönüş hiç başlamaz (oklar ve noktalar çalışmaya
devam eder). Sol/sağ ok tuşlarıyla da gezinilir.

**Görseller:** `slide-1-depo.jpg` hazır (logiby.com render'ı). Kalan 4 tanesi placeholder —
üretim promptları [assets/img/PROMPTS.md](assets/img/PROMPTS.md) içinde. Dosyaları aynı
adla değiştirmek yeterli, kodda değişiklik gerekmiyor.

## Erişilebilirlik & performans notları

- Tüm bölümler semantik etiketlerle, "İçeriğe geç" bağlantısı mevcut.
- `prefers-reduced-motion` desteklenir; animasyonlar kapanır.
- Reveal animasyonu yalnızca JS varken devreye girer (`html.js`), ayrıca
  IntersectionObserver tetiklenmezse 2.5 sn sonra içerik zorla görünür kılınır.
- Yatay taşma yok; 375px, 768px ve 1280px'te test edildi.
- Organization schema.org JSON-LD gömülü.

## Yapılacaklar (opsiyonel)

- Dört ürün için ayrı detay sayfaları (Logiby.Landing'deki sayfaların Datcod tasarımına
  uyarlanması).
- Referans/müşteri logoları ve vaka çalışmaları bölümü.
- `og:image` görseli (şu an tanımlı değil).
- Gerçek form backend'i.
