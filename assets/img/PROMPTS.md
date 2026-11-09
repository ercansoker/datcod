# Hero slider görselleri — üretim promptları

Slider'daki 1. görsel (`slide-1-depo.jpg`) hazır: logiby.com anasayfasındaki render'ın
üst bandı kırpılmış hâli. Kalan 4 görsel şu an **placeholder** — üretip aynı isimle
üzerine yazman yeterli, kodda değişiklik gerekmiyor.

## Kurallar

| | |
| --- | --- |
| **Boyut** | 1024 × 868 px (veya 1:1 üretip üstten/alttan kırp) |
| **Format** | `.jpg`, kalite ~85, hedef 250–350 KB |
| **Dosya adları** | Aşağıda her promptun başlığında |
| **Konum** | `datcod/assets/img/` |

Görseller 1. slaytla aynı görsel dilde olmalı: **3D render, izometrik/yüksek açı,
koyu lacivert ortam, cyan ve mor neon aydınlatma, temiz kurumsal fütürizm.** Her
prompta şu ortak son eki ekle:

> `--- Style: 3D rendered isometric illustration, high angle view, dark navy blue environment, cyan and purple neon accent lighting, glowing light paths on the floor, clean corporate futurism, soft reflections, no text or logos anywhere in the image, highly detailed, 4k`

("no text or logos" kısmı önemli — üretilen görsellerde okunaksız sahte yazılar
çıkmasın.)

---

## 1. `slide-2-satinalma.jpg` — Satınalma Programı

> A futuristic corporate office interior rendered in 3D, high angle isometric view. A large glowing holographic approval workflow floats above a conference table: a purchase request document card on the left connects through glowing cyan lines to three sequential approval checkpoints, each marked with a glowing checkmark ring, ending in a purchase order document on the right. Two business people in dark suits stand beside the table looking up at the hologram, one holding a tablet. Floating translucent panels around the hologram show abstract bar charts and budget gauges in cyan and purple. Dark navy office with neon rim lighting.
>
> *(+ ortak stil son eki)*

---

## 2. `slide-3-entegrasyon.jpg` — Entegrasyonlar

> A futuristic 3D isometric illustration of a central glowing server hub in the middle of a dark navy digital space. Six separate floating platforms surround it in a circle, each holding a different abstract system module: a warehouse rack, a shopping cart, an invoice ledger, a delivery truck, a database cylinder, and a mobile phone. Bright cyan and purple energy streams flow in both directions between the central hub and every platform, showing two-way data sync. Small glowing data packets travel along the streams. The central hub emits a soft cyan glow onto the platforms.
>
> *(+ ortak stil son eki)*

---

## 3. `slide-4-mail.jpg` — E-postadan sipariş

> A futuristic 3D isometric illustration. On the left, a large glowing email envelope icon floats and opens, releasing a stream of glowing cyan particles. The particles flow to the right and reassemble into a structured order card floating above a desk — the card shows abstract product rows and quantity fields as glowing lines, no readable text. Between them, a translucent AI processing core with a soft purple glow transforms the particles. Behind the desk, a warehouse worker in a dark uniform watches a floating screen. Dark navy environment with neon rim lighting.
>
> *(+ ortak stil son eki)*

---

## 4. `slide-5-whatsapp.jpg` — WhatsApp'tan sipariş

> A futuristic 3D isometric illustration. A large smartphone stands upright on the left, screen glowing green, showing abstract chat message bubbles rising from it as glowing green shapes. The message bubbles travel right through a translucent AI processing core with a soft purple glow, and transform into a structured order card floating above a warehouse floor — the card shows abstract product rows as glowing lines, no readable text. In the background, a warehouse rack and a small autonomous transport robot with neon underglow. Dark navy environment, green accent on the phone side blending into cyan and purple on the order side.
>
> *(+ ortak stil son eki)*

---

## Üretim sonrası

1. Dosyaları `datcod/assets/img/` içine aynı adlarla koy.
2. Sayfayı yenile — slider otomatik olarak yeni görselleri gösterir.
3. Başlık metinlerini değiştirmek istersen `index.html` içindeki `<figcaption>`
   satırlarını düzenle.
