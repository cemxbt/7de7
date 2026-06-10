# 7'de 7 — Dream World Cup ⚽

Zarı at, tarihin gerçek Dünya Kupası kadrolarından rüya takımını kur, turnuvayı simüle et. Hedef: **7 maçın 7'sini de kazanmak!**

🎮 **Canlı oyna:** https://cemxbt.github.io/7de7/

> Viral oyun [7a0 — Sete a Zero](https://7a0.com.br)'dan ilham alınmıştır. Oyun mekanikleri ve denge modeli orijinaline sadık kalınarak yeniden geliştirilmiş, üzerine yeni modlar ve özellikler eklenmiştir. Kadro verileri orijinal oyunun halka açık veritabanından alınmıştır.

---

## Veritabanı

**250 gerçek kadro · 5.613 oyuncu · 52 ülke · 1950–2026 arası her Dünya Kupası.**

Her oyuncunun gerçek mevkileri (çoklu mevki desteğiyle), forma numarası, güç puanı ve "efsane" rozeti vardır. Pelé (99), Maradona, Cruyff, Messi... hepsi gerçekten o kadrolarda yer aldıkları yıl ve formayla karşına çıkar.

## Nasıl Oynanır?

1. **Hazırlık** — Modunu, dizilişini ve oyun stilini (defansif / dengeli / ofansif) seç. Diziliş **ve stil**, sahadaki 11 mevkinin yerleşimini gerçekten değiştirir (ör. ofansif 5-3-2'de bekler kanada çıkar).
2. **Zar at** 🎲 — Rastgele bir ülke + Dünya Kupası yılı gelir. Güçlü kadrolar zar havuzunda daha sık çıkar.
3. **Yıldızını seç** ⭐ — Kadrodan bir oyuncu seç ve sahada **gerçek mevkisine** yerleştir (sağ bek sol kanata oynayamaz!). Yerleştirdiğin oyuncuları sonradan boş uyumlu mevkilere taşıyabilir veya birbiriyle takas edebilirsin.
4. **Joker** 🃏 — Beğenmediğin kadroda iki seçenek:
   - 🌍 **Başka Takım** — aynı kupadan farklı bir ülke
   - 📅 **Başka Kupa** — aynı ülkenin farklı bir kupa kadrosu (SSCB→Rusya, Yugoslavya→Sırbistan, Çekoslovakya→Çekya devamlılığı dahil)
   - Çıkan kadroda hiç uygun oyuncu kalmadıysa değişiklik **bedavadır**.
5. **Simüle et** 🏆 — 3 grup maçı (4 takımlı gerçek puan tablosu) + Son 16, Çeyrek, Yarı Final, Final. Beraberliklerde vuruş vuruş penaltı serisi.

## Oyun Modları

| Mod | Açıklama |
|---|---|
| ⚽ **Klasik** | Güçler görünür · 3 joker |
| 🧠 **Almanak** | Güçler 11 tamamlanana dek gizli, sahada forma numarası bile gösterilmez · sadece 1 joker. Gerçek futbol tarihi bilgisi testi. |
| 🔥 **Hardcore** | Joker yok — ilk zar son zar. |
| 🏟️ **Kupa 2026** | Sadece şu an oynanan 2026 Dünya Kupası kadroları (10 takım). Güncel yıldızlarla kadro kur! |

## Simülasyon Modeli (orijinalle birebir)

- **Kadro reytingleri:** Genel = 11'in ortalaması. **Hücum/Defans** mevki ağırlıklarıyla ayrı hesaplanır (kanat oyuncusu hücuma 1.0, defansa 0 katkı verir; ön libero defansa 0.8 vb.).
- **Maç motoru:** Rakip güçleri sabittir — Grup: 68/72/76, Son 16: 79, Çeyrek: 83, Yarı: 87, Final: 91. Gol beklentisi `1.4 + (hücumun − rakip) × 0.08` (Poisson). Yani final neredeyse her zaman zorlu geçer.
- **Rakip kimlikleri:** Her maçta gerçek bir tarihi kadro, güç bandına göre eşleştirilir (ilk maçlar zayıf bantlardan, final en güçlülerden). **Seni eleyen takım her zaman tarihi bir dev olarak kaydedilir.**
- **Golcüler:** Gol atanlar mevki ağırlığı × güce göre seçilir, dakikaları üretilir. Kaleciler gol atamaz — **Rogério Ceni, Chilavert ve Higuita hariç** (gerçek hayattaki gibi). Normal kaleci sadece eleme maçının son golünde, umutsuzluk kafasıyla ağları havalandırabilir.
- **Penaltılar:** Her vuruş %78 isabet; seri vuruş vuruş gösterilir, gerekirse seri penaltılara uzar.
- **Rozetler:** 7'de 7 + averaj ≥ +18 → ★ **REKOR EZİCİ** · Şampiyonluk + 0 gol yeme → ★ **AŞILMAZ DUVAR**
- **Kupa kodu (seed):** Her turnuva 6 haneli bir koddan deterministik üretilir — aynı kadro + aynı kod = aynı sonuç.

## Diğer Özellikler

- 8 diziliş × 3 stil = 24 farklı saha yerleşimi (orijinal koordinatlarla)
- Sonuç kartı: skorlar, golcüler, penaltı serileri, rozetler, 11'in listesi; emoji'li paylaşım metni
- Kalıcı istatistikler (oyun / kupa / 7'de 7 / en iyi kadro)
- TR/EN dil desteği, nostaljik açık tema + koyu tema, tamamen mobil uyumlu
- Hesap yok, indirme yok, %100 ücretsiz

---

## English Summary

**7'de 7** ("7 of 7") is a free browser remake of the viral *7a0 — Sete a Zero* with extra modes. Draft from **250 real World Cup squads (5,613 players, 1950–2026)**, place stars in their authentic positions across 8 formations × 3 styles, use two wildcard types (another team / another cup), then simulate a full World Cup with the original's exact match model — including penalty shootouts, real historical opponents by strength band, scorer logic with the famous goal-scoring goalkeepers easter egg, and badges for perfect runs. Modes: Classic, Memory, Hardcore, and **WC 2026** (draft only from the ongoing 2026 World Cup squads).

## Geliştirme

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # üretim build'i (dist/)
npm run smoke    # motor duman testi + denge simülasyonu (2000 koşu)
npm run deploy   # GitHub Pages'e yayınla
```

**Teknolojiler:** Vite + React + TypeScript. Backend yok — tamamen statik.

### Proje Yapısı

```
public/data/squads.json   # 250 kadro, 5.613 oyuncu (uygulama açılışında yüklenir)
src/
  data/
    countries.ts          # 52 ülke: TR/EN ad + bayrak
    bands.ts              # kadro güç bantları (rakip eşleştirme için)
    formations.ts         # 8 diziliş × 3 stil koordinatları
    loader.ts             # squads.json yükleyici
  game/
    types.ts              # tipler + mod konfigürasyonu
    rng.ts                # seed'li deterministik RNG
    engine.ts             # draft: zar, joker eksenleri, mevki uygunluğu, taşıma/takas, reytingler
    sim.ts                # turnuva: maç modeli, grup tablosu, penaltılar, rakip kimlikleri, rozetler
  components/
    Setup.tsx             # mod / diziliş / stil
    Draft.tsx             # draft ekranı
    Pitch.tsx             # koordinatlı saha
    Reveal.tsx            # maç akışı + sonuç kartı
scripts/smoke.ts          # veri bütünlüğü + denge testi
```
