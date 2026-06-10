import { useState } from 'react';
import { FORMATIONS, makeSlots, simulateTournament, teamStrength } from './game/engine';
import type { Mode, Style, Slot, TournamentResult } from './game/engine';
import type { Lang } from './i18n';
import { t } from './i18n';
import Setup from './components/Setup';
import Draft from './components/Draft';
import Tournament from './components/Tournament';

export interface Stats {
  played: number;
  titles: number;
  perfect: number;
  best: number;
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem('7de7-stats');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { played: 0, titles: 0, perfect: 0, best: 0 };
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('7de7-lang') as Lang) || 'tr');
  const [screen, setScreen] = useState<'setup' | 'draft' | 'sim'>('setup');
  const [mode, setMode] = useState<Mode>('classic');
  const [formationIdx, setFormationIdx] = useState(0);
  const [style, setStyle] = useState<Style>('balanced');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [result, setResult] = useState<TournamentResult | null>(null);
  const [stats, setStats] = useState<Stats>(loadStats);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('7de7-lang', l);
  };

  const startGame = () => {
    setSlots(makeSlots(FORMATIONS[formationIdx]));
    setResult(null);
    setScreen('draft');
  };

  const startTournament = (finalSlots: Slot[]) => {
    const res = simulateTournament(finalSlots, style);
    const next: Stats = {
      played: stats.played + 1,
      titles: stats.titles + (res.champion ? 1 : 0),
      perfect: stats.perfect + (res.perfect ? 1 : 0),
      best: Math.max(stats.best, Math.round(teamStrength(finalSlots))),
    };
    setStats(next);
    localStorage.setItem('7de7-stats', JSON.stringify(next));
    setSlots(finalSlots);
    setResult(res);
    setScreen('sim');
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => setScreen('setup')}>
          <span className="logo-7">7</span>
          <span className="logo-de">{lang === 'tr' ? "'de" : 'in'}</span>
          <span className="logo-7">7</span>
        </button>
        <div className="lang-switch">
          <button className={lang === 'tr' ? 'on' : ''} onClick={() => switchLang('tr')}>TR</button>
          <button className={lang === 'en' ? 'on' : ''} onClick={() => switchLang('en')}>EN</button>
        </div>
      </header>

      {screen === 'setup' && (
        <Setup
          lang={lang}
          mode={mode} setMode={setMode}
          formationIdx={formationIdx} setFormationIdx={setFormationIdx}
          style={style} setStyle={setStyle}
          stats={stats}
          onStart={startGame}
        />
      )}

      {screen === 'draft' && (
        <Draft
          lang={lang}
          mode={mode}
          formation={FORMATIONS[formationIdx]}
          initialSlots={slots}
          onSimulate={startTournament}
          onBack={() => setScreen('setup')}
        />
      )}

      {screen === 'sim' && result && (
        <Tournament
          lang={lang}
          result={result}
          slots={slots}
          mode={mode}
          formationName={FORMATIONS[formationIdx].name}
          styleName={t(style === 'balanced' ? 'styleBal' : style === 'offensive' ? 'styleOff' : 'styleDef', lang)}
          onPlayAgain={() => setScreen('setup')}
        />
      )}

      <footer className="footer">
        <span>7'de 7 — Dream World Cup · 1950–2022</span>
      </footer>
    </div>
  );
}
