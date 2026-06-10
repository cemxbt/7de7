import { useEffect, useState } from 'react';
import type { FormationName } from './data/formations';
import { loadSquads } from './data/loader';
import { createGame } from './game/engine';
import { randomSeed } from './game/rng';
import { simulateCampaign, type CampaignResult } from './game/sim';
import type { DraftState, GameState, Mode, Squad, Style } from './game/types';
import type { Lang } from './i18n';
import { t } from './i18n';
import Setup from './components/Setup';
import Draft from './components/Draft';
import Reveal from './components/Reveal';
import Donate from './components/Donate';
import ProfileScreen from './components/ProfileScreen';
import { loadHistory, loadProfile, pushHistory, type HistoryEntry, type Profile } from './profile';

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

type Theme = 'light' | 'dark';

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('7de7-lang') as Lang) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('7de7-theme') as Theme) || 'light');
  const [screen, setScreen] = useState<'setup' | 'draft' | 'reveal' | 'profile'>('setup');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [squads, setSquads] = useState<Squad[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [mode, setMode] = useState<Mode>('classic');
  const [formation, setFormation] = useState<FormationName>('4-3-3');
  const [style, setStyle] = useState<Style>('balanced');

  const [donateOpen, setDonateOpen] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [finalDraft, setFinalDraft] = useState<DraftState | null>(null);
  const [stats, setStats] = useState<Stats>(loadStats);

  useEffect(() => {
    loadSquads().then(setSquads).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('7de7-theme', theme);
  }, [theme]);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('7de7-lang', l);
  };

  const startGame = () => {
    setGame(createGame(randomSeed(), formation, style, mode));
    setResult(null);
    setScreen('draft');
  };

  const startTournament = (draft: DraftState, seed: string) => {
    if (!squads) return;
    const res = simulateCampaign(draft, seed, squads);
    const next: Stats = {
      played: stats.played + 1,
      titles: stats.titles + (res.champion ? 1 : 0),
      perfect: stats.perfect + (res.perfect ? 1 : 0),
      best: Math.max(stats.best, res.overall),
    };
    setStats(next);
    localStorage.setItem('7de7-stats', JSON.stringify(next));
    setHistory(pushHistory(res, draft.mode, draft.formation));
    setFinalDraft(draft);
    setResult(res);
    setScreen('reveal');
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => setScreen('setup')}>
          <span className="logo-7">7</span>
          <span className="logo-de">{lang === 'tr' ? "'de" : 'in'}</span>
          <span className="logo-7">7</span>
        </button>
        <div className="topbar-controls">
          <button
            className={`profile-btn ${screen === 'profile' ? 'on' : ''}`}
            onClick={() => setScreen(screen === 'profile' ? 'setup' : 'profile')}
            aria-label={t('profile', lang)}
          >
            <span className="profile-btn-avatar">{profile.avatar}</span>
            {profile.name && <span className="profile-btn-name">{profile.name}</span>}
          </button>
          <div className="lang-switch">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => switchLang('en')}>EN</button>
            <button className={lang === 'tr' ? 'on' : ''} onClick={() => switchLang('tr')}>TR</button>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Dark theme' : 'Light theme'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {!squads && (
        <div className="load-screen">
          {loadError ? '⚠️' : '⚽'} {loadError ? 'Error' : t('loading', lang)}
        </div>
      )}

      {squads && screen === 'setup' && (
        <Setup
          lang={lang}
          mode={mode} setMode={setMode}
          formation={formation} setFormation={setFormation}
          style={style} setStyle={setStyle}
          stats={stats}
          onStart={startGame}
        />
      )}

      {squads && screen === 'draft' && game && (
        <Draft
          lang={lang}
          squads={squads}
          initialGame={game}
          onSimulate={startTournament}
          onBack={() => setScreen('setup')}
        />
      )}

      {squads && screen === 'profile' && (
        <ProfileScreen
          lang={lang}
          profile={profile}
          setProfile={setProfile}
          history={history}
          setHistory={setHistory}
          stats={stats}
          onBack={() => setScreen('setup')}
        />
      )}

      {squads && screen === 'reveal' && result && finalDraft && (
        <Reveal
          lang={lang}
          result={result}
          draft={finalDraft}
          onPlayAgain={() => setScreen('setup')}
          onDonate={() => setDonateOpen(true)}
        />
      )}

      <footer className="footer">
        <button className="donate-btn" onClick={() => setDonateOpen(true)}>
          ☕ {t('donate', lang)}
        </button>
        <span>7'de 7 — Dream World Cup · 1950–2026</span>
        <span className="made-by">
          made by <a href="https://github.com/cemxbt" target="_blank" rel="noopener noreferrer">cemxbt</a>
        </span>
      </footer>

      {donateOpen && <Donate lang={lang} onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
