import { FORMATIONS } from '../game/engine';
import type { Mode, Style } from '../game/engine';
import type { Lang } from '../i18n';
import { t } from '../i18n';
import type { Stats } from '../App';

interface Props {
  lang: Lang;
  mode: Mode;
  setMode: (m: Mode) => void;
  formationIdx: number;
  setFormationIdx: (i: number) => void;
  style: Style;
  setStyle: (s: Style) => void;
  stats: Stats;
  onStart: () => void;
}

const MODES: { id: Mode; icon: string; nameKey: 'modeClassic' | 'modeMemory' | 'modeHardcore'; descKey: 'modeClassicDesc' | 'modeMemoryDesc' | 'modeHardcoreDesc' }[] = [
  { id: 'classic', icon: '⚽', nameKey: 'modeClassic', descKey: 'modeClassicDesc' },
  { id: 'memory', icon: '🧠', nameKey: 'modeMemory', descKey: 'modeMemoryDesc' },
  { id: 'hardcore', icon: '🔥', nameKey: 'modeHardcore', descKey: 'modeHardcoreDesc' },
];

const STYLES: { id: Style; icon: string; key: 'styleDef' | 'styleBal' | 'styleOff' }[] = [
  { id: 'defensive', icon: '🛡️', key: 'styleDef' },
  { id: 'balanced', icon: '⚖️', key: 'styleBal' },
  { id: 'offensive', icon: '⚡', key: 'styleOff' },
];

export default function Setup({ lang, mode, setMode, formationIdx, setFormationIdx, style, setStyle, stats, onStart }: Props) {
  return (
    <main className="setup">
      <div className="hero">
        <h1>
          <span className="hero-score">7<small>–</small>0</span>
        </h1>
        <p className="tagline">{t('tagline', lang)}</p>
      </div>

      <section className="card">
        <h2>{t('howTitle', lang)}</h2>
        <ol className="how">
          <li><span className="how-num">1</span>🎲 {t('how1', lang)}</li>
          <li><span className="how-num">2</span>⭐ {t('how2', lang)}</li>
          <li><span className="how-num">3</span>🏆 {t('how3', lang)}</li>
        </ol>
      </section>

      <section className="card">
        <h2>{t('mode', lang)}</h2>
        <div className="mode-grid">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-card ${mode === m.id ? 'sel' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-name">{t(m.nameKey, lang)}</span>
              <span className="mode-desc">{t(m.descKey, lang)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{t('formation', lang)}</h2>
        <div className="pill-row">
          {FORMATIONS.map((f, i) => (
            <button
              key={f.name}
              className={`pill ${formationIdx === i ? 'sel' : ''}`}
              onClick={() => setFormationIdx(i)}
            >
              {f.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{t('style', lang)}</h2>
        <div className="pill-row">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`pill wide ${style === s.id ? 'sel' : ''}`}
              onClick={() => setStyle(s.id)}
            >
              {s.icon} {t(s.key, lang)}
            </button>
          ))}
        </div>
      </section>

      <button className="cta" onClick={onStart}>
        🎲 {t('start', lang)}
      </button>

      {stats.played > 0 && (
        <section className="card stats">
          <h2>{t('stats', lang)}</h2>
          <div className="stat-grid">
            <div><b>{stats.played}</b><span>{t('statPlayed', lang)}</span></div>
            <div><b>🏆 {stats.titles}</b><span>{t('statTitles', lang)}</span></div>
            <div><b>💎 {stats.perfect}</b><span>{t('statPerfect', lang)}</span></div>
            <div><b>{stats.best}</b><span>{t('statBest', lang)}</span></div>
          </div>
        </section>
      )}
    </main>
  );
}
