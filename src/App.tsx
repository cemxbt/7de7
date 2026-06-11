import { useEffect, useState } from 'react';
import type { FormationName } from './data/formations';
import { loadSquads } from './data/loader';
import { buildGodDraft, createGame } from './game/engine';
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
import { insertCampaign, supabase, syncLocalHistoryOnce, upsertCloudProfile, type User } from './online';
import {
  DRAFT_SECONDS, claimDuel, createDuel, createInviteDuel, dailySeed, duelPlaySeed,
  fillDuelResult, finalDraftState, findOpenDuel, joinDuel, submitDaily, submitDuelDraft,
  submitWeekly, toChallengeResult, weeklySeed,
  type ChallengeResult, type Duel, type DuelSide, type DuelTeam, type StealOutcome,
} from './challenge';
import { BoardCard, DuelCodeBar, DuelLivePanel } from './components/OnlinePanels';
import DuelSync from './components/DuelSync';

type DuelVariant = 'code' | 'quick' | 'invite';

type Challenge =
  | { kind: 'daily' }
  | { kind: 'weekly' }
  | { kind: 'duel'; side: DuelSide; id: string; code: string; seed: string; mode: Mode; variant: DuelVariant }
  | null;

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

// Secret cheat code: type it (no input field needed) on the main menu and the
// strongest possible XI for the selected formation appears instantly.
// Cheat runs never touch stats, history or anything online.
const SECRET_CODE = 'cemxbt';

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('7de7-lang') as Lang) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('7de7-theme') as Theme) || 'light');
  const [screen, setScreen] = useState<'setup' | 'draft' | 'duelsync' | 'reveal' | 'profile'>('setup');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [user, setUser] = useState<User | null>(null);
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

  const [challenge, setChallenge] = useState<Challenge>(null);
  const [myChallengeResult, setMyChallengeResult] = useState<ChallengeResult | null>(null);
  const [myTeam, setMyTeam] = useState<DuelTeam | null>(null); // my published duel draft
  const [cheat, setCheat] = useState(false); // god-mode run: never counted anywhere
  const [godFlash, setGodFlash] = useState(false);
  const urlDuelCode = new URLSearchParams(window.location.search).get('duel') ?? '';

  useEffect(() => {
    loadSquads().then(setSquads).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // first login: push pre-account local history & profile to the cloud
  useEffect(() => {
    if (!user) return;
    syncLocalHistoryOnce(user.id, loadHistory()).catch(() => { /* offline */ });
    upsertCloudProfile(user.id, loadProfile()).catch(() => { /* offline */ });
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('7de7-theme', theme);
  }, [theme]);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('7de7-lang', l);
  };

  const launch = (seed: string, m: Mode, ch: Challenge) => {
    setChallenge(ch);
    setMyChallengeResult(null);
    setMyTeam(null);
    setCheat(false);
    setGame(createGame(seed, formation, style, m));
    setResult(null);
    setScreen('draft');
  };

  // secret cheat: listen for the code being typed on the main menu
  useEffect(() => {
    if (screen !== 'setup' || !squads) return;
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET_CODE.length);
      if (buffer !== SECRET_CODE) return;
      buffer = '';
      const draft = buildGodDraft(squads, formation, style, mode);
      setChallenge(null);
      setMyChallengeResult(null);
      setMyTeam(null);
      setCheat(true);
      setGame({ seed: randomSeed(), rollIndex: 0, rerollNo: 0, draft, current: null, recent: [] });
      setResult(null);
      setGodFlash(true);
      setTimeout(() => setGodFlash(false), 2200);
      setScreen('draft');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, squads, formation, style, mode]);

  const startGame = () => launch(randomSeed(), mode, null);
  const startDaily = () => launch(dailySeed(), 'classic', { kind: 'daily' });
  const startWeekly = () => launch(weeklySeed(), 'hardcore', { kind: 'weekly' });
  // Creates the duel room first so the share code is visible from the very start.
  const startDuelCreate = async () => {
    if (!user) return;
    const seed = randomSeed();
    const { id, code } = await createDuel(user.id, seed, mode);
    launch(duelPlaySeed(seed, 'creator'), mode, { kind: 'duel', side: 'creator', id, code, seed, mode, variant: 'code' });
  };
  // Joining claims the seat right away so the duel is locked to the two of you.
  const startDuelJoin = async (duel: Duel) => {
    if (!user) return;
    if (!duel.opponent) await claimDuel(duel.id, user.id).catch(() => { /* already claimed */ });
    launch(duelPlaySeed(duel.seed, 'opponent'), duel.mode, {
      kind: 'duel', side: 'opponent', id: duel.id, code: duel.code, seed: duel.seed, mode: duel.mode, variant: 'code',
    });
  };
  // Quick match: claim someone waiting in the pool, or open a new spot yourself.
  const startQuickMatch = async () => {
    if (!user) return;
    const found = await findOpenDuel(user.id);
    if (found) {
      await startDuelJoin(found);
      return;
    }
    const seed = randomSeed();
    const { id, code } = await createDuel(user.id, seed, 'classic', true);
    launch(duelPlaySeed(seed, 'creator'), 'classic', { kind: 'duel', side: 'creator', id, code, seed, mode: 'classic', variant: 'quick' });
  };
  // Challenge a friend directly: the duel lands in their incoming invites.
  const startFriendInvite = async (friendId: string) => {
    if (!user) return;
    const seed = randomSeed();
    const { id, code } = await createInviteDuel(user.id, friendId, seed, mode);
    launch(duelPlaySeed(seed, 'creator'), mode, { kind: 'duel', side: 'creator', id, code, seed, mode, variant: 'invite' });
  };

  // Draft finished. Duels publish the squad and enter the synced steal phase;
  // everything else simulates the tournament right away.
  const startTournament = (draft: DraftState, seed: string) => {
    if (challenge?.kind === 'duel') {
      const team: DuelTeam = {
        formation: draft.formation,
        style: draft.style,
        team: draft.filled.filter((p): p is NonNullable<typeof p> => p !== null),
      };
      setMyTeam(team);
      submitDuelDraft(challenge.id, challenge.side, team).catch(() => { /* offline */ });
      setScreen('duelsync');
      return;
    }
    runTournament(draft, seed);
  };

  // After the steal phase: rebuild my draft with the final XI and play the cup.
  const continueDuel = (outcome: StealOutcome) => {
    if (!myTeam || challenge?.kind !== 'duel') return;
    const finalXI = challenge.side === 'creator' ? outcome.creatorFinal : outcome.opponentFinal;
    const draft = finalDraftState(myTeam, finalXI, challenge.mode);
    runTournament(draft, duelPlaySeed(challenge.seed, challenge.side));
  };

  const runTournament = (draft: DraftState, seed: string) => {
    if (!squads) return;
    const res = simulateCampaign(draft, seed, squads);
    // god-mode runs are just for fun: no stats, no history, no cloud
    if (!cheat) {
      const next: Stats = {
        played: stats.played + 1,
        titles: stats.titles + (res.champion ? 1 : 0),
        perfect: stats.perfect + (res.perfect ? 1 : 0),
        best: Math.max(stats.best, res.overall),
      };
      setStats(next);
      localStorage.setItem('7de7-stats', JSON.stringify(next));
      const list = pushHistory(res, draft.mode, draft.formation);
      setHistory(list);
      if (user && list[0]) insertCampaign(user.id, list[0]).catch(() => { /* offline */ });
    }

    if (challenge && user) {
      const cr = toChallengeResult(res, draft);
      setMyChallengeResult(cr);
      if (challenge.kind === 'daily') {
        submitDaily(user.id, cr).catch(() => { /* offline or already played */ });
      } else if (challenge.kind === 'weekly') {
        submitWeekly(user.id, cr).catch(() => { /* offline or already played */ });
      } else if (challenge.kind === 'duel' && challenge.side === 'creator') {
        fillDuelResult(challenge.id, cr).catch(() => { /* offline */ });
      } else if (challenge.kind === 'duel') {
        joinDuel(challenge.id, user.id, cr).catch(() => { /* offline or raced */ });
      }
    }

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
          user={user}
          urlDuelCode={urlDuelCode}
          onDaily={startDaily}
          onWeekly={startWeekly}
          onDuelCreate={startDuelCreate}
          onDuelJoin={startDuelJoin}
          onQuickMatch={startQuickMatch}
          onNeedLogin={() => setScreen('profile')}
        />
      )}

      {squads && (screen === 'draft' || screen === 'duelsync' || screen === 'reveal')
        && challenge?.kind === 'duel' && challenge.side === 'creator' && (
        <DuelCodeBar lang={lang} code={challenge.code} variant={challenge.variant} />
      )}

      {squads && screen === 'draft' && game && (
        <Draft
          lang={lang}
          squads={squads}
          initialGame={game}
          onSimulate={startTournament}
          onBack={() => setScreen('setup')}
          timeLimit={challenge?.kind === 'duel' ? DRAFT_SECONDS : undefined}
        />
      )}

      {squads && screen === 'duelsync' && challenge?.kind === 'duel' && myTeam && (
        <DuelSync
          lang={lang}
          code={challenge.code}
          side={challenge.side}
          myTeam={myTeam}
          onContinue={continueDuel}
          onAbort={() => { setChallenge(null); setScreen('setup'); }}
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
          user={user}
          onInviteFriend={startFriendInvite}
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
          footer={
            challenge?.kind === 'daily' && myChallengeResult ? <BoardCard lang={lang} board="daily" />
            : challenge?.kind === 'weekly' && myChallengeResult ? <BoardCard lang={lang} board="weekly" />
            : challenge?.kind === 'duel' ? (
              <DuelLivePanel
                lang={lang}
                code={challenge.code}
                viewer={challenge.side}
                variant={challenge.side === 'creator' ? challenge.variant : undefined}
                onRematch={startDuelCreate}
              />
            )
            : null
          }
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

      {godFlash && (
        <div className="god-flash" aria-hidden="true">
          <span>⚡ GOD MODE ⚡</span>
        </div>
      )}
    </div>
  );
}
