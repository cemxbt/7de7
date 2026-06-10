// Synced duel flow after the draft is submitted:
// wait for rival's draft -> timed steal phase (protect 3 / steal 3 / give 3)
// -> wait for rival's picks -> animated resolution, then the tournament starts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import {
  STEAL_N, STEAL_SECONDS, defaultPicks, duelHeartbeat, fetchDuel, finalDraftState,
  resolveSteals, seenRecently, submitDuelSteal,
  type Duel, type DuelSide, type DuelTeam, type StealOutcome, type StealPicks,
} from '../challenge';
import { ratings } from '../game/engine';
import type { PlacedPlayer } from '../game/types';
import type { Lang } from '../i18n';
import { POS_LABEL, t } from '../i18n';

const avgOf = (xs: PlacedPlayer[]) =>
  xs.length ? Math.round(xs.reduce((a, p) => a + p.f, 0) / xs.length) : 0;

interface Props {
  lang: Lang;
  code: string;
  side: DuelSide;
  myTeam: DuelTeam;
  /** resolution finished: start my tournament with the final XI */
  onContinue: (outcome: StealOutcome, duel: Duel) => void;
  onAbort: () => void;
}

const flagOf = (p: PlacedPlayer) => COUNTRIES[p.sel]?.flag ?? '';

function PlayerChip({ p, lang, mark, risk, onClick, disabled }: {
  p: PlacedPlayer;
  lang: Lang;
  mark?: string;
  risk?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className={`steal-chip ${mark ? 'marked' : ''} ${risk && !mark ? 'risk' : ''}`} onClick={onClick} disabled={disabled || !onClick}>
      {mark && <span className="steal-mark">{mark}</span>}
      {risk && !mark && <span className="steal-mark">⚠️</span>}
      <span className="steal-pos">{POS_LABEL[p.pos[0]][lang]}</span>
      <span className="steal-name">{p.leg && '⭐'}{p.n}</span>
      <span className="steal-meta">{flagOf(p)} {p.f}</span>
    </button>
  );
}

type StealTab = 'ban' | 'steal' | 'give';

function StealPicker({ lang, mine, theirs, rivalName, myName, onSubmit }: {
  lang: Lang;
  mine: PlacedPlayer[];
  theirs: PlacedPlayer[];
  rivalName: string;
  myName: string;
  onSubmit: (picks: StealPicks) => void;
}) {
  const [tab, setTab] = useState<StealTab>('ban');
  const [picks, setPicks] = useState<StealPicks>({ ban: [], steal: [], give: [] });
  const [left, setLeft] = useState(STEAL_SECONDS);
  const sentRef = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const submit = (p: StealPicks) => {
    if (sentRef.current) return;
    sentRef.current = true;
    onSubmit(p);
  };

  // timeout: fill whatever is missing with sensible defaults
  useEffect(() => {
    if (left > 0 || sentRef.current) return;
    const def = defaultPicks(mine, theirs);
    const fill = (cur: string[], pool: string[], avoid: string[] = []) => {
      const next = [...cur];
      for (const id of pool) {
        if (next.length >= STEAL_N) break;
        if (!next.includes(id) && !avoid.includes(id)) next.push(id);
      }
      return next;
    };
    const ban = fill(picks.ban, def.ban, picks.give);
    submit({
      ban,
      steal: fill(picks.steal, def.steal),
      give: fill(picks.give, [...def.give, ...mine.map(p => p.id)], ban),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const toggle = (key: StealTab, id: string) => {
    setPicks(prev => {
      const cur = prev[key];
      if (cur.includes(id)) return { ...prev, [key]: cur.filter(x => x !== id) };
      if (cur.length >= STEAL_N) return prev;
      // ban and give must stay disjoint
      if (key === 'ban' && prev.give.includes(id)) return prev;
      if (key === 'give' && prev.ban.includes(id)) return prev;
      return { ...prev, [key]: [...cur, id] };
    });
  };

  const ready = picks.ban.length === STEAL_N && picks.steal.length === STEAL_N && picks.give.length === STEAL_N;
  const ownTab = tab !== 'steal';
  const list = ownTab ? mine : theirs;

  const markOf = (id: string): string | undefined => {
    if (ownTab && picks.ban.includes(id)) return '🛡';
    if (ownTab && picks.give.includes(id)) return '🎁';
    if (!ownTab && picks.steal.includes(id)) return '🎯';
    return undefined;
  };

  // while protecting: flag my best unprotected players — these are easy prey
  const atRisk = useMemo(() => {
    if (tab !== 'ban') return new Set<string>();
    const exposed = mine.filter(p => !picks.ban.includes(p.id));
    return new Set(exposed.sort((a, b) => b.f - a.f).slice(0, STEAL_N).map(p => p.id));
  }, [tab, mine, picks.ban]);

  const tabs: { id: StealTab; icon: string; label: string; count: number }[] = [
    { id: 'ban', icon: '🛡', label: t('stealBan', lang), count: picks.ban.length },
    { id: 'steal', icon: '🎯', label: t('stealPick', lang), count: picks.steal.length },
    { id: 'give', icon: '🎁', label: t('stealGive', lang), count: picks.give.length },
  ];

  return (
    <div className="steal-board">
      <div className="steal-head">
        <h2>🕵️ {t('stealTitle', lang)}</h2>
        <span className={`draft-timer ${left <= 15 ? 'low' : ''}`}>⏱ 0:{String(left).padStart(2, '0')}</span>
      </div>
      <div className="steal-vs">
        <span className="steal-vs-side me">{myName} <b>{avgOf(mine)}</b></span>
        <span className="steal-vs-x">{t('vs', lang)}</span>
        <span className="steal-vs-side them"><b>{avgOf(theirs)}</b> {rivalName}</span>
      </div>
      <p className="ob-desc steal-desc">{t('stealDesc', lang)}</p>

      <div className="steal-tabs">
        {tabs.map(x => (
          <button key={x.id} className={`steal-tab ${tab === x.id ? 'on' : ''} ${x.count === STEAL_N ? 'full' : ''}`} onClick={() => setTab(x.id)}>
            {x.icon} {x.label} <b>{x.count}/{STEAL_N}</b>
          </button>
        ))}
      </div>

      <p className="steal-hint">
        {tab === 'ban' ? t('stealBanHint', lang) : tab === 'steal' ? `${t('stealPickHint', lang)} (${rivalName})` : t('stealGiveHint', lang)}
      </p>

      <div className="steal-list">
        {list.map(p => (
          <PlayerChip
            key={p.id}
            p={p}
            lang={lang}
            mark={markOf(p.id)}
            risk={atRisk.has(p.id)}
            onClick={() => toggle(tab, p.id)}
            disabled={
              (tab === 'ban' && picks.give.includes(p.id)) ||
              (tab === 'give' && picks.ban.includes(p.id))
            }
          />
        ))}
      </div>
      {tab === 'ban' && <p className="steal-hint risk-note">⚠️ = {t('stealAtRisk', lang)}</p>}

      <button className="cta steal-submit" disabled={!ready} onClick={() => submit(picks)}>
        {ready ? `✅ ${t('stealSubmit', lang)}` : t('stealNeedAll', lang)}
      </button>
    </div>
  );
}

function ResolutionView({ lang, outcome, side, myTeam, rivalName, onContinue }: {
  lang: Lang;
  outcome: StealOutcome;
  side: DuelSide;
  myTeam: DuelTeam;
  rivalName: string;
  onContinue: () => void;
}) {
  const myResults = side === 'creator' ? outcome.creatorResults : outcome.opponentResults;
  const theirResults = side === 'creator' ? outcome.opponentResults : outcome.creatorResults;
  const myFinal = side === 'creator' ? outcome.creatorFinal : outcome.opponentFinal;
  const lines = [
    ...myResults.map(r => ({ mine: true, r })),
    ...theirResults.map(r => ({ mine: false, r })),
  ];
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) return;
    const timer = setTimeout(() => setShown(s => s + 1), 800);
    return () => clearTimeout(timer);
  }, [shown, lines.length]);

  const done = shown >= lines.length;

  // before/after squad strength once the dust settles
  const summary = useMemo(() => {
    const before = ratings(finalDraftState(myTeam, myTeam.team, 'classic'));
    const after = ratings(finalDraftState(myTeam, myFinal, 'classic'));
    const incoming = new Set(myResults.flatMap(r => (r.got ? [r.got.id] : [])));
    return { before, after, incoming };
  }, [myTeam, myFinal, myResults]);

  const delta = summary.after.overall - summary.before.overall;

  return (
    <div className="steal-board">
      <h2>⚡ {t('stealResolved', lang)}</h2>
      <div className="steal-res-list">
        {lines.slice(0, shown).map(({ mine, r }, i) => (
          <div key={i} className={`steal-res ${mine ? 'mine' : 'theirs'} ${r.blocked ? 'blocked' : ''}`}>
            {mine ? '🫵' : '👤'} <b>{mine ? t('duelYou', lang) : rivalName}</b>{' '}
            {r.blocked ? (
              <>
                🎯 {r.wanted.n} — 🛡 {t('stealBlocked', lang)}
                {r.got ? <> → 🎁 <b>{r.got.n}</b></> : null}
              </>
            ) : (
              <>🎯 <b>{r.got?.n}</b> {t('stealTaken', lang)}</>
            )}
          </div>
        ))}
      </div>

      {done && (
        <>
          <div className="steal-final">
            <div className="steal-final-head">
              <b>📋 {t('stealNewSquad', lang)}</b>
              <span className={`steal-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
                {summary.before.overall} → <b>{summary.after.overall}</b> OVR
                {delta !== 0 && <i>{delta > 0 ? ` (+${delta})` : ` (${delta})`}</i>}
              </span>
            </div>
            <div className="steal-final-list">
              {myFinal.map(p => (
                <span key={p.id} className={`steal-final-chip ${summary.incoming.has(p.id) ? 'new' : ''}`}>
                  {summary.incoming.has(p.id) && '✨'}{flagOf(p)} {p.n} <b>{p.f}</b>
                </span>
              ))}
            </div>
          </div>
          <button className="cta steal-submit" onClick={onContinue}>
            🏟 {t('stealContinue', lang)}
          </button>
        </>
      )}
    </div>
  );
}

export default function DuelSync({ lang, code, side, myTeam, onContinue, onAbort }: Props) {
  const [duel, setDuel] = useState<Duel | null>(null);
  const [mySteal, setMySteal] = useState<StealPicks | null>(null);
  const duelIdRef = useRef<string | null>(null);

  const theirDraft = side === 'creator' ? duel?.opponent_draft : duel?.creator_draft;
  const theirSteal = side === 'creator' ? duel?.opponent_steal : duel?.creator_steal;
  const sentSteal = mySteal ?? (side === 'creator' ? duel?.creator_steal : duel?.opponent_steal) ?? null;
  const theirSeen = side === 'creator' ? duel?.opponent_seen : duel?.creator_seen;
  const rivalProfile = side === 'creator' ? duel?.opponent_profile : duel?.creator_profile;
  const rivalName = `${rivalProfile?.avatar ?? '⚽'} ${rivalProfile?.name || t('lbAnon', lang)}`;
  const online = seenRecently(theirSeen);

  // poll + heartbeat while the sync flow is alive
  useEffect(() => {
    let alive = true;
    const load = () => fetchDuel(code).then(d => { if (alive && d) setDuel(d); }).catch(() => { /* offline */ });
    load();
    const pollIv = setInterval(load, 4000);
    const beat = () => { if (duelIdRef.current) duelHeartbeat(duelIdRef.current, side).catch(() => { /* offline */ }); };
    const beatIv = setInterval(beat, 10_000);
    return () => { alive = false; clearInterval(pollIv); clearInterval(beatIv); };
  }, [code, side]);

  useEffect(() => {
    if (duel?.id && duelIdRef.current !== duel.id) {
      duelIdRef.current = duel.id;
      duelHeartbeat(duel.id, side).catch(() => { /* offline */ });
    }
  }, [duel?.id, side]);

  const outcome = useMemo(() => {
    const cd = duel?.creator_draft, od = duel?.opponent_draft;
    const cs = duel?.creator_steal, os = duel?.opponent_steal;
    if (!cd || !od || !cs || !os) return null;
    return resolveSteals(cd, od, cs, os);
  }, [duel]);

  const sendSteal = (picks: StealPicks) => {
    setMySteal(picks);
    if (duel?.id) submitDuelSteal(duel.id, side, picks).catch(() => { /* retried via poll? keep optimistic */ });
  };

  const presence = (
    <p className="ob-desc duel-wait">
      <span className={`live-dot ${online ? '' : 'off'}`} />{' '}
      {rivalName} — {online ? t('rivalOnline', lang) : t('rivalOffline', lang)}
    </p>
  );

  // phase 3: both steals in -> resolution
  if (outcome && duel) {
    return (
      <main className="duelsync">
        <ResolutionView
          lang={lang}
          outcome={outcome}
          side={side}
          myTeam={myTeam}
          rivalName={rivalName}
          onContinue={() => onContinue(outcome, duel)}
        />
      </main>
    );
  }

  // phase 2: both drafts in -> steal picking (or waiting for rival's picks)
  if (theirDraft) {
    if (!sentSteal) {
      return (
        <main className="duelsync">
          <StealPicker
            lang={lang}
            mine={myTeam.team}
            theirs={theirDraft.team}
            rivalName={rivalName}
            myName={t('duelYou', lang)}
            onSubmit={sendSteal}
          />
        </main>
      );
    }
    return (
      <main className="duelsync">
        <div className="steal-board wait-board">
          <h2>🕵️ {t('stealTitle', lang)}</h2>
          <p className="ob-desc">✅ {t('stealSent', lang)}</p>
          {!theirSteal && <p className="ob-desc">⏳ {t('stealWaitRival', lang)}</p>}
          {presence}
        </div>
      </main>
    );
  }

  // phase 1: waiting for the rival's draft
  return (
    <main className="duelsync">
      <div className="steal-board wait-board">
        <h2>⚔️ {t('duelTitle', lang)} · {code}</h2>
        <p className="ob-desc">✅ {t('draftSent', lang)}</p>
        <p className="ob-desc">⏳ {t('draftWaitRival', lang)}</p>
        {duel?.opponent || side === 'opponent' ? presence : (
          <p className="ob-desc duel-wait"><span className="live-dot" /> {t('duelLiveWait', lang)}</p>
        )}
        <button className="ghost small" onClick={onAbort}>← {t('back', lang)}</button>
      </div>
    </main>
  );
}
