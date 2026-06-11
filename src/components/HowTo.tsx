// In-game guide: how drafting, the tournament, scoring and the online
// modes work. Content lives here (not i18n.ts) since it's a document.
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Section {
  icon: string;
  title: { tr: string; en: string };
  items: { tr: string; en: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: '🎲',
    title: { tr: 'Temel Oynanış', en: 'The Basics' },
    items: [
      {
        tr: 'Zar at: karşına rastgele bir ülke + Dünya Kupası yılı kadrosu çıkar (1950–2026).',
        en: 'Roll the dice: you get a random country + World Cup year squad (1950–2026).',
      },
      {
        tr: 'Kadrodan tek bir oyuncu seç ve sahada parlayan, mevkisine uygun noktaya yerleştir.',
        en: 'Pick exactly one player from that squad and place them on a glowing, position-compatible spot.',
      },
      {
        tr: 'Aynı kadro bir daha gelmez; aynı oyuncu farklı yıllardan da olsa ikinci kez seçilemez.',
        en: 'The same squad never comes twice; the same player can never be picked again, even from another year.',
      },
      {
        tr: '🃏 Joker: beğenmediğin kadroyu "Başka Takım" (aynı yıl, farklı ülke) veya "Başka Kupa" (aynı ülke, farklı yıl) ile değiştir. Hakkın moda göre sınırlı.',
        en: '🃏 Wildcards: swap an unwanted squad via "Another Team" (same year, new country) or "Another Cup" (same country, new year). Limited per mode.',
      },
      {
        tr: 'Turlar arasında yerleştirdiğin oyuncuları uygun mevkiler arasında taşıyabilir veya takas edebilirsin.',
        en: 'Between rolls you can move or swap placed players across compatible positions.',
      },
      {
        tr: '11 oyuncu tamamlanınca turnuva başlar.',
        en: 'Once all 11 slots are filled, the tournament begins.',
      },
    ],
  },
  {
    icon: '🎮',
    title: { tr: 'Modlar', en: 'Modes' },
    items: [
      { tr: '⚽ Klasik: 3 joker, reytingler açık.', en: '⚽ Classic: 3 wildcards, ratings visible.' },
      { tr: '🧠 Almanak: reytingler gizli, 1 joker — futbol hafızan konuşur.', en: '🧠 Almanac: ratings hidden, 1 wildcard — your football memory decides.' },
      { tr: '🔥 Hardcore: joker yok, gelen kadroyla yetin.', en: '🔥 Hardcore: no wildcards, play what you are dealt.' },
      { tr: '🏟️ 2026 Kupası: yalnız 48 adet 2026 Dünya Kupası kadrosu — rakipler dahil.', en: '🏟️ 2026 Cup: only the 48 World Cup 2026 squads — opponents included.' },
    ],
  },
  {
    icon: '🏆',
    title: { tr: 'Turnuva ve Reyting', en: 'Tournament & Ratings' },
    items: [
      {
        tr: 'Kura çekilir: 4 takımlı grupta 3 maç oynarsın, ilk 2 çıkar; sonra Son 16\'dan finale eleme usulü.',
        en: 'Groups are drawn: 3 matches in a group of 4, top 2 advance; then knockouts from the Round of 16 to the final.',
      },
      {
        tr: 'Takım gücün üç sayıdır: Genel, Hücum, Defans — oyuncuların reytinglerinden, mevki uyumundan ve taktiğinden hesaplanır.',
        en: 'Your team strength is three numbers: Overall, Attack, Defense — computed from player ratings, positional fit and your tactic.',
      },
      {
        tr: 'Maçlar bu güçlere göre simüle edilir: güçlü ve dengeli kadro = daha çok gol, daha az yenilen gol.',
        en: 'Matches are simulated from those strengths: a strong, balanced XI scores more and concedes less.',
      },
      {
        tr: '🏆 Şampiyon: kupayı kaldırırsın. 💎 Mükemmel: 7 maçın 7\'sini de kazanırsın — oyunun adı buradan gelir.',
        en: '🏆 Champion: you lift the cup. 💎 Perfect: win all 7 of 7 matches — that\'s where the name comes from.',
      },
    ],
  },
  {
    icon: '🌍',
    title: { tr: 'Online Puanlama', en: 'Online Scoring' },
    items: [
      {
        tr: '📅 Günlük Maç: herkes aynı gün aynı kadro evrenini oynar, günde tek hak.',
        en: '📅 Daily Match: everyone plays the same squad universe that day, one attempt per day.',
      },
      {
        tr: '🏅 Haftalık Lig: haftada tek hak, hardcore kuralları (joker yok).',
        en: '🏅 Weekly League: one attempt per week, hardcore rules (no wildcards).',
      },
      {
        tr: 'Sıralama ölçütleri (öncelik sırasıyla): ulaşılan tur → galibiyet sayısı → averaj → atılan gol → takım reytingi.',
        en: 'Ranking criteria (in priority order): stage reached → wins → goal difference → goals scored → team rating.',
      },
      {
        tr: '🌐 Genel liderlik tablosu: toplam şampiyonluk, mükemmel turnuva sayısı ve en iyi reytinge göre sıralanır.',
        en: '🌐 The global leaderboard ranks by total titles, perfect tournaments and best team rating.',
      },
    ],
  },
  {
    icon: '⚔️',
    title: { tr: 'Düello', en: 'Duels' },
    items: [
      {
        tr: 'Üç yol: kod paylaş, 🎯 Hızlı Maç ile anında eşleş veya arkadaşına direkt davet gönder.',
        en: 'Three ways in: share a code, get matched instantly via 🎯 Quick Match, or send a friend a direct invite.',
      },
      {
        tr: 'İki taraf farklı kadrolar çeker — kazandıran şans değil, kadro kurma becerisidir.',
        en: 'The two sides roll different squads — drafting skill wins, not luck.',
      },
      {
        tr: '⏱ Kadro kurma sürelidir (4 dk); süre biterse kadron otomatik tamamlanır. Rakibinin ilerleyişini canlı izlersin.',
        en: '⏱ Drafting is timed (4 min); if time runs out your squad is auto-completed. You watch your rival\'s progress live.',
      },
      {
        tr: '🕵️ Çalma fazı (60 sn): 3 oyuncunu koru 🛡, rakipten 3 oyuncu çal 🎯, karşılığında 3 oyuncu öner 🎁. Korunan bir oyuncuyu seçersen yerine rakibin önerdiklerinden biri gelir.',
        en: '🕵️ Steal phase (60s): protect 3 of yours 🛡, steal 3 from the rival 🎯, offer 3 in return 🎁. Pick a protected player and you receive one of their offers instead.',
      },
      {
        tr: 'Sonra herkes kendi Dünya Kupası\'nı oynar: galibiyetler, goller ve şampiyonluk 🔥 form bonusu kazandırır (en fazla +4 hücum/defans).',
        en: 'Then each side plays their own World Cup: wins, goals and the title earn a 🔥 form bonus (up to +4 attack/defense).',
      },
      {
        tr: 'Kazananı, iki ilk 11 arasında oynanan canlı hesaplaşma maçı belirler — beraberlikte penaltılar.',
        en: 'The winner is decided by a live showdown match between the two XIs — penalties if it\'s level.',
      },
    ],
  },
];

export default function HowTo({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="howto-modal" onClick={e => e.stopPropagation()}>
        <div className="donate-head">
          <h2>📖 {t('howToTitle', lang)}</h2>
          <button className="donate-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="howto-body">
          {SECTIONS.map(s => (
            <section key={s.title.en} className="howto-section">
              <h3>{s.icon} {s.title[lang]}</h3>
              <ul>
                {s.items.map((it, i) => <li key={i}>{it[lang]}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
