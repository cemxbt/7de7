# 7'de 7 — Dream World Cup ⚽

Zarı at, tarihin efsane Dünya Kupası kadrolarından rüya takımını kur, turnuvayı simüle et. Hedef: **7 maçın 7'sini de kazanmak!**

🎮 **Canlı oyna:** https://cemxbt.github.io/7de7/

> Viral oyun [7a0 — Sete a Zero](https://7a0.com.br)'dan ilham alınmıştır; sıfırdan, ek modlar ve özelliklerle geliştirilmiş bir versiyondur.

---

## Nasıl Oynanır?

1. **Hazırlık** — Oyun modunu, dizilişini (4-3-3, 4-4-2, 3-5-2...) ve oyun stilini (defansif / dengeli / ofansif) seç.
2. **Zar at** 🎲 — Karşına rastgele bir ülke ve Dünya Kupası yılı çıkar (örn. *Brezilya 1970*).
3. **Yıldızını seç** ⭐ — O kadroda gerçekten yer almış oyunculardan birini seç ve sahadaki uygun pozisyona yerleştir.
4. **Tekrarla** — 11 oyuncunu tamamlayana kadar zar atmaya devam et. Beğenmediğin kadroyu **3 pas hakkınla** geçebilirsin.
5. **Simüle et** 🏆 — Takımın 3 grup maçı + Son 16, Çeyrek Final, Yarı Final ve Final oynar. Beraberliklerde penaltılar devreye girer.

Şampiyon olmak güzel; ama gerçek hedef tüm maçları 90 dakikada kazanıp **💎 Kusursuz 7'de 7** yapmak.

## Oyun Modları

| Mod | Açıklama |
|---|---|
| ⚽ **Klasik** | Oyuncu güçleri görünür, 3 pas hakkı. Yeni başlayanlar için ideal. |
| 🧠 **Almanak** | Güçler draft boyunca gizli — futbol tarihine ve hafızana güven! Güçler turnuva başında açıklanır. |
| 🔥 **Hardcore** | Pas hakkı yok. İlk zar son zar; çıkan kadroyla yaşamak zorundasın. |

## Özellikler

- **60 tarihi kadro, 880+ gerçek oyuncu** — 1950 Uruguay'dan 2022 Arjantin'e, Brezilya 1970'ten Türkiye 2002'ye.
- **8 diziliş** — 4-3-3, 4-4-2, 4-2-3-1, 4-2-4, 3-5-2, 5-3-2, 4-5-1, 3-4-3.
- **3 oyun stili** — Simülasyonda gol beklentisini gerçekten etkiler.
- **Gerçekçi turnuva simülasyonu** — Poisson dağılımlı skorlar, grup puan tablosu, penaltı serileri, golcüler ve dakikaları.
- **Sonuç kartı & paylaşım** — Maç maç sonuçlarını emoji'li metin olarak panoya kopyala, arkadaşlarına meydan oku.
- **Kalıcı istatistikler** — Oynanan oyun, kupa, 7'de 7 ve en iyi kadro gücü tarayıcında saklanır.
- **TR / EN dil desteği**, tamamen mobil uyumlu, hesap gerektirmez, %100 ücretsiz.

## Simülasyon Nasıl Çalışır?

- Kadro gücün = sahadaki 11 oyuncunun ortalama reytingi.
- Her maçta iki takımın gol beklentisi (xG), güç farkı + oyun stiline göre hesaplanır ve Poisson dağılımından skor üretilir.
- Grup aşamasında 4 takımlı gerçek bir puan tablosu oynanır (rakipler kendi aralarında da maç yapar); ilk 2 üst tura çıkar.
- Eleme turlarında rakipler giderek güçlenir; finalde seni büyük ihtimalle bir efsane bekler.
- ~2000 simülasyonluk testlere göre: 88+ güçte bir kadro ~%30 şampiyonluk şansına sahipken, kusursuz 7'de 7 oranı ~%2'dir. Yani her şampiyonluk gerçekten kazanılmıştır.

---

## English Summary

**7'de 7** ("7 of 7") is a free browser game inspired by the viral *7a0 — Sete a Zero*. Roll the dice to get a random national team from a historical World Cup, draft one player who was actually in that squad, fill your XI, and simulate a full World Cup (3 group matches + 4 knockout rounds). Win all 7 for a perfect run. Includes Classic, Memory (ratings hidden) and Hardcore (no skips) modes, 8 formations, 3 play styles, shareable result cards, persistent stats and TR/EN languages.

## Geliştirme

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # üretim build'i (dist/)
npx tsx scripts/smoke.ts  # motor duman testi + denge simülasyonu
```

**Teknolojiler:** Vite + React + TypeScript. Backend yok — tamamen statik, GitHub Pages'te barınıyor.

### Proje Yapısı

```
src/
  data/squads.ts        # 60 kadro, 880+ oyuncu veritabanı
  game/engine.ts        # diziliş, draft, maç & turnuva simülasyonu
  i18n.ts               # TR/EN metinler
  components/
    Setup.tsx           # mod / diziliş / stil seçimi
    Draft.tsx           # zar + kadro paneli
    Pitch.tsx           # saha ve mevki yerleşimi
    Tournament.tsx      # maç akışı + sonuç kartı
scripts/smoke.ts        # denge ve veri bütünlüğü testi
```

### Kadro Eklemek

`src/data/squads.ts` dosyasına yeni bir `Squad` nesnesi ekleyin. Her kadroda en az 1 GK, 3 DF, 3 MF, 2 FW bulunmalı (duman testi bunu doğrular). Reytingler 50–99 aralığındadır.
