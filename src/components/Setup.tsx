import { FORMATIONS, FORMATION_NAMES, type FormationName } from '../data/formations';
import type { Mode, Style } from '../game/types';
import type { Lang, StringKey } from '../i18n';
import { POS_LABEL, t } from '../i18n';
import type { Stats } from '../App';
import type { Duel } from '../challenge';
import type { User } from '../online';
import { OnlineSection } from './OnlinePanels';

interface Props {
  lang: Lang;
  mode: Mode;
  setMode: (m: Mode) => void;
  formation: FormationName;
  setFormation: (f: FormationName) => void;
  style: Style;
  setStyle: (s: Style) => void;
  stats: Stats;
  onStart: () => void;
  user: User | null;
  urlDuelCode: string;
  onDaily: () => void;
  onWeekly: () => void;
  onDuelCreate: () => Promise<void>;
  onDuelJoin: (duel: Duel) => void;
  onQuickMatch: () => Promise<void>;
  onNeedLogin: () => void;
  onHowTo: () => void;
}

const MODES: { id: Mode; icon: string; nameKey: StringKey; descKey: StringKey }[] = [
  { id: 'classic', icon: '⚽', nameKey: 'modeClassic', descKey: 'modeClassicDesc' },
  { id: 'almanak', icon: '🧠', nameKey: 'modeAlmanak', descKey: 'modeAlmanakDesc' },
  { id: 'hardcore', icon: '🔥', nameKey: 'modeHardcore', descKey: 'modeHardcoreDesc' },
  { id: 'wc2026', icon: '🏟️', nameKey: 'mode2026', descKey: 'mode2026Desc' },
];

const STYLES: { id: Style; icon: string; key: StringKey }[] = [
  { id: 'defensive', icon: '🛡️', key: 'styleDef' },
  { id: 'balanced', icon: '⚖️', key: 'styleBal' },
  { id: 'offensive', icon: '⚡', key: 'styleOff' },
];

export default function Setup({
  lang, mode, setMode, formation, setFormation, style, setStyle, stats, onStart,
  user, urlDuelCode, onDaily, onWeekly, onDuelCreate, onDuelJoin, onQuickMatch, onNeedLogin, onHowTo,
}: Props) {
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
        <button className="ghost small howto-link" onClick={onHowTo}>
          📖 {t('howFull', lang)}
        </button>
      </section>

      <section className="card">
        <h2>{t('mode', lang)}</h2>
        <div className="mode-grid">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-card ${mode === m.id ? 'sel' : ''} ${m.id === 'wc2026' ? 'mode-2026' : ''}`}
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
          {FORMATION_NAMES.map(f => (
            <button
              key={f}
              className={`pill ${formation === f ? 'sel' : ''}`}
              onClick={() => setFormation(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mini-pitch" aria-hidden="true">
          <div className="mini-lines">
            <div className="mini-circle" />
            <div className="mini-halfway" />
            <div className="mini-box top" />
            <div className="mini-box bottom" />
          </div>
          {FORMATIONS[formation][style].map((s, i) => (
            <span
              key={`${formation}-${style}-${i}`}
              className={`mini-dot ${s.pos === 'GK' ? 'gk' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {POS_LABEL[s.pos][lang]}
            </span>
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

      <OnlineSection
        lang={lang}
        user={user}
        initialCode={urlDuelCode}
        onDaily={onDaily}
        onWeekly={onWeekly}
        onDuelCreate={onDuelCreate}
        onDuelJoin={onDuelJoin}
        onQuickMatch={onQuickMatch}
        onNeedLogin={onNeedLogin}
        onHowTo={onHowTo}
      />

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
