// Post-result panels for online battles (daily board + duel share/showdown)
// and the Setup-screen online section.
import { useEffect, useState } from 'react';
import {
  compareResults, dailySeed, duelLink, duelShowdown, duelVerdict,
  fetchDailyBoard, fetchDuel, fetchIncomingInvites, fetchMyDuels, fetchWeeklyBoard,
  hasPlayedDaily, hasPlayedWeekly, weeklySeed,
  type ChallengeResult, type DailyRow, type Duel,
} from '../challenge';
import type { User } from '../online';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';
import DuelShowdown from './DuelShowdown';

const STAGE_KEY: Record<string, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

const stageLabel = (stage: string, lang: Lang) =>
  stage === 'CHAMP' ? `🏆 ${t('champion', lang)}` : t(STAGE_KEY[stage] ?? 'stageG1', lang);

// ---------- setup section ----------

interface OnlineSectionProps {
  lang: Lang;
  user: User | null;
  initialCode: string;
  onDaily: () => void;
  onWeekly: () => void;
  onDuelCreate: () => Promise<void>;
  onDuelJoin: (duel: Duel) => void;
  onQuickMatch: () => Promise<void>;
  onNeedLogin: () => void;
}

export function OnlineSection({ lang, user, initialCode, onDaily, onWeekly, onDuelCreate, onDuelJoin, onQuickMatch, onNeedLogin }: OnlineSectionProps) {
  const [code, setCode] = useState(initialCode);
  const [err, setErr] = useState<string | null>(null);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [quickErr, setQuickErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [matching, setMatching] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);
  const [playedWeek, setPlayedWeek] = useState(false);
  const [invites, setInvites] = useState<Duel[]>([]);

  useEffect(() => {
    if (user) {
      hasPlayedDaily(user.id).then(setPlayedToday).catch(() => { /* offline */ });
      hasPlayedWeekly(user.id).then(setPlayedWeek).catch(() => { /* offline */ });
      fetchIncomingInvites(user.id).then(setInvites).catch(() => { /* offline */ });
    } else {
      setPlayedToday(false);
      setPlayedWeek(false);
      setInvites([]);
    }
  }, [user]);

  const guard = (fn: () => void) => () => {
    if (!user) { onNeedLogin(); return; }
    fn();
  };

  const create = async () => {
    if (!user) { onNeedLogin(); return; }
    setCreating(true);
    setCreateErr(null);
    try {
      await onDuelCreate();
    } catch {
      setCreateErr(t('duelCreateErr', lang));
    } finally {
      setCreating(false);
    }
  };

  const quick = async () => {
    if (!user) { onNeedLogin(); return; }
    setMatching(true);
    setQuickErr(null);
    try {
      await onQuickMatch();
    } catch {
      setQuickErr(t('duelCreateErr', lang));
    } finally {
      setMatching(false);
    }
  };

  const join = async () => {
    if (!user) { onNeedLogin(); return; }
    setBusy(true);
    setErr(null);
    try {
      const duel = await fetchDuel(code);
      if (!duel) setErr(t('duelNotFound', lang));
      else if (duel.opponent && duel.opponent !== user.id) setErr(t('duelFull', lang));
      else if (duel.creator === user.id) setErr(t('duelOwn', lang));
      else onDuelJoin(duel);
    } catch {
      setErr(t('duelNotFound', lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card online-card">
      <h2>{t('onlineTitle', lang)}</h2>

      {invites.length > 0 && (
        <div className="invite-list">
          {invites.map(d => (
            <div key={d.id} className="invite-row">
              <span className="invite-text">
                ⚔️ <b>{d.creator_profile?.avatar ?? '⚽'} {d.creator_profile?.name || t('lbAnon', lang)}</b> {t('inviteFrom', lang)}
              </span>
              <button className="cta small-cta" onClick={() => onDuelJoin(d)}>▶ {t('invitePlay', lang)}</button>
            </div>
          ))}
        </div>
      )}

      <div className="online-grid">
        <div className="online-box quick-box">
          <div className="ob-head">🎯 <b>{t('quickTitle', lang)}</b></div>
          <p className="ob-desc">{t('quickDesc', lang)}</p>
          <button className="cta small-cta" onClick={quick} disabled={matching}>
            {matching ? `🔎 ${t('quickSearchingBtn', lang)}` : `🎯 ${t('quickPlay', lang)}`}
          </button>
          {quickErr && <p className="ob-err">{quickErr}</p>}
        </div>
        <div className="online-box">
          <div className="ob-head">📅 <b>{t('dailyTitle', lang)}</b></div>
          <p className="ob-desc">{t('dailyDesc', lang)}</p>
          <button className="cta small-cta" onClick={guard(onDaily)} disabled={playedToday}>
            {playedToday ? t('dailyPlayed', lang) : `🎲 ${t('dailyPlay', lang)}`}
          </button>
        </div>
        <div className="online-box">
          <div className="ob-head">🏅 <b>{t('weeklyTitle', lang)}</b></div>
          <p className="ob-desc">{t('weeklyDesc', lang)}</p>
          <button className="cta small-cta" onClick={guard(onWeekly)} disabled={playedWeek}>
            {playedWeek ? t('weeklyPlayed', lang) : `🔥 ${t('weeklyPlay', lang)}`}
          </button>
        </div>
        <div className="online-box">
          <div className="ob-head">⚔️ <b>{t('duelTitle', lang)}</b></div>
          <p className="ob-desc">{t('duelDesc', lang)}</p>
          <button className="cta small-cta" onClick={create} disabled={creating}>
            {creating ? '…' : <>⚔️ {t('duelCreate', lang)}</>}
          </button>
          {createErr && <p className="ob-err">{createErr}</p>}
          <div className="duel-join-row">
            <input
              type="text"
              maxLength={6}
              placeholder={t('duelCodePh', lang)}
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setErr(null); }}
            />
            <button className="ghost small" onClick={join} disabled={busy || code.trim().length < 6}>
              {busy ? '…' : t('duelJoin', lang)}
            </button>
          </div>
          {err && <p className="ob-err">{err}</p>}
        </div>
      </div>
      {!user && <p className="ob-login-note">🔒 {t('needLogin', lang)}</p>}
      {user && <MyDuels lang={lang} user={user} />}
    </section>
  );
}

// ---------- daily / weekly standings (after playing) ----------

export function BoardCard({ lang, board }: { lang: Lang; board: 'daily' | 'weekly' }) {
  const [rows, setRows] = useState<DailyRow[] | null>(null);

  useEffect(() => {
    (board === 'daily' ? fetchDailyBoard() : fetchWeeklyBoard()).then(setRows).catch(() => setRows([]));
  }, [board]);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`);

  return (
    <div className="card online-result">
      <h2>
        {board === 'daily' ? '📅' : '🏅'} {t(board === 'daily' ? 'dailyBoard' : 'weeklyBoard', lang)}{' '}
        <small className="table-round">{board === 'daily' ? dailySeed() : weeklySeed()}</small>
      </h2>
      {rows === null ? (
        <p className="history-empty">…</p>
      ) : rows.length === 0 ? (
        <p className="history-empty">{t('lbEmpty', lang)}</p>
      ) : (
        <div className="lb-list">
          {rows.map((r, i) => (
            <div key={i} className={`lb-row ${i < 3 ? 'top' : ''}`}>
              <span className="lb-rank">{medal(i)}</span>
              <span className="lb-avatar">{r.profiles?.avatar ?? '⚽'}</span>
              <span className="lb-name">{r.profiles?.name || t('lbAnon', lang)}</span>
              <span className="lb-stats">
                {r.perfect ? '💎' : r.champion ? '🏆' : ''} {stageLabel(r.stage, lang)}
                <small>{r.wins}G · {r.gd > 0 ? '+' : ''}{r.gd} · {r.overall} OVR</small>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- duel panels ----------

export type DuelVariant = 'code' | 'quick' | 'invite';

/** Slim bar shown above the draft/result while playing a duel you created. */
export function DuelCodeBar({ lang, code, variant = 'code' }: { lang: Lang; code: string; variant?: DuelVariant }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(duelLink(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (variant === 'quick') {
    return (
      <div className="duel-bar">
        <span className="duel-bar-label">🎯 {t('quickTitle', lang)}</span>
        <span className="duel-bar-label"><span className="live-dot" /> {t('quickBar', lang)}</span>
      </div>
    );
  }

  if (variant === 'invite') {
    return (
      <div className="duel-bar">
        <span className="duel-bar-label">⚔️ {t('inviteSentBar', lang)}</span>
      </div>
    );
  }

  return (
    <div className="duel-bar">
      <span className="duel-bar-label">⚔️ {t('duelCodeLbl', lang)}</span>
      <button className="duel-bar-code" onClick={copy} title={t('copyLink', lang)}>
        {code} {copied ? '✓' : '📋'}
      </button>
    </div>
  );
}

/** Legacy duels (no squad snapshot) fall back to a plain stat comparison. */
function FallbackCompare({ lang, duel, viewer }: { lang: Lang; duel: Duel; viewer: 'creator' | 'opponent' }) {
  const mine = viewer === 'creator' ? duel.creator_result : duel.opponent_result;
  const theirs = viewer === 'creator' ? duel.opponent_result : duel.creator_result;
  if (!mine || !theirs) return null;
  const theirProfile = viewer === 'creator' ? duel.opponent_profile : duel.creator_profile;
  const cmp = compareResults(mine, theirs);
  const verdict = cmp > 0 ? t('duelWin', lang) : cmp < 0 ? t('duelLose', lang) : t('duelDraw', lang);

  const col = (label: string, avatar: string, r: ChallengeResult, winner: boolean) => (
    <div className={`duel-col ${winner ? 'winner' : ''}`}>
      <span className="duel-avatar">{avatar}</span>
      <b className="duel-name">{label}</b>
      <span className="duel-stage">{stageLabel(r.stage, lang)}</span>
      <span className="duel-line">{r.wins}W · {r.gd > 0 ? '+' : ''}{r.gd} · {r.gf} ⚽</span>
      <span className="duel-line">{r.formation} · {r.overall} OVR</span>
    </div>
  );

  return (
    <div className={`card online-result duel-compare ${cmp > 0 ? 'won' : cmp < 0 ? 'lost' : ''}`}>
      <h2>⚔️ {t('duelTitle', lang)} · {duel.code}</h2>
      <div className={`duel-verdict ${cmp > 0 ? 'win' : cmp < 0 ? 'lose' : ''}`}>{verdict}</div>
      <div className="duel-cols">
        {col(t('duelYou', lang), '⭐', mine, cmp > 0)}
        <span className="duel-vs">{t('vs', lang)}</span>
        {col(theirProfile?.name || t('lbAnon', lang), theirProfile?.avatar ?? '⚽', theirs, cmp < 0)}
      </div>
    </div>
  );
}

/**
 * Post-game duel panel: polls the duel until both sides have played,
 * then settles it with an animated showdown match between the two XIs.
 */
export function DuelLivePanel({ lang, code, viewer, variant = 'code', onRematch }: {
  lang: Lang;
  code: string;
  viewer: 'creator' | 'opponent';
  variant?: DuelVariant;
  onRematch?: () => void;
}) {
  const [duel, setDuel] = useState<Duel | null>(null);
  const [copied, setCopied] = useState(false);
  const ready = !!(duel?.creator_result && duel?.opponent_result);

  useEffect(() => {
    if (ready) return;
    let alive = true;
    const load = () => fetchDuel(code).then(d => { if (alive && d) setDuel(d); }).catch(() => { /* offline */ });
    load();
    const timer = setInterval(load, 7000);
    return () => { alive = false; clearInterval(timer); };
  }, [code, ready]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(duelLink(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (ready && duel) {
    const match = duelShowdown(duel);
    if (match) {
      return (
        <div className="card online-result duel-arena">
          <h2>⚔️ {t('showdownTitle', lang)}</h2>
          <p className="ob-desc sd-desc">{t('showdownDesc', lang)}</p>
          <DuelShowdown lang={lang} duel={duel} match={match} viewer={viewer} onRematch={onRematch} />
        </div>
      );
    }
    return <FallbackCompare lang={lang} duel={duel} viewer={viewer} />;
  }

  // still waiting for the other side
  const rivalFound = !!duel?.opponent; // quick match: someone claimed the spot and is playing now
  const rivalName = `${duel?.opponent_profile?.avatar ?? '⚽'} ${duel?.opponent_profile?.name || t('lbAnon', lang)}`;
  return (
    <div className="card online-result duel-share">
      <h2>{variant === 'quick' ? '🎯' : '⚔️'} {t(variant === 'quick' ? 'quickTitle' : 'duelTitle', lang)} · {code}</h2>
      {viewer === 'creator' && variant === 'quick' ? (
        rivalFound ? (
          <p className="ob-desc quick-found">✅ {t('quickFound', lang)} <b>{rivalName}</b> — {t('quickPlaying', lang)}</p>
        ) : (
          <p className="ob-desc">{t('quickSearching', lang)}</p>
        )
      ) : viewer === 'creator' && variant === 'invite' ? (
        <p className="ob-desc quick-found">📨 {t('inviteSentTo', lang)} <b>{rivalName}</b></p>
      ) : viewer === 'creator' ? (
        <>
          <p className="ob-desc">{t('duelShare', lang)}</p>
          <div className="duel-code">{code}</div>
          <button className="ghost big" onClick={copy}>
            {copied ? `✓ ${t('copied', lang)}` : `🔗 ${t('copyLink', lang)}`}
          </button>
        </>
      ) : (
        <p className="ob-desc">{t('duelWaitCreator', lang)}</p>
      )}
      <p className="ob-desc duel-wait">
        <span className="live-dot" /> {t('duelLiveWait', lang)}
      </p>
    </div>
  );
}

// ---------- my duels (setup screen) ----------

export function MyDuels({ lang, user }: { lang: Lang; user: User }) {
  const [duels, setDuels] = useState<Duel[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyDuels(user.id).then(setDuels).catch(() => setDuels([]));
  }, [user.id]);

  if (!duels || duels.length === 0) return null;

  let w = 0, l = 0;
  const rows = duels.map(d => {
    const viewer: 'creator' | 'opponent' = d.creator === user.id ? 'creator' : 'opponent';
    const v = duelVerdict(d);
    const mineWins = v === null ? null : (viewer === 'creator' ? v > 0 : v < 0) ? true : v === 0 ? null : false;
    if (mineWins === true) w++;
    else if (mineWins === false) l++;
    return { d, viewer, mineWins };
  });

  return (
    <div className="my-duels">
      <div className="md-head">
        <b>📜 {t('myDuels', lang)}</b>
        <span className="md-record">{w}W – {l}L</span>
      </div>
      {rows.map(({ d, viewer, mineWins }) => {
        const rival = viewer === 'creator' ? d.opponent_profile : d.creator_profile;
        const finished = mineWins !== null || (!!d.creator_result && !!d.opponent_result);
        const open = openId === d.id;
        const match = open ? duelShowdown(d) : null;
        return (
          <div key={d.id} className="md-item">
            <button
              className={`md-row ${mineWins === true ? 'won' : mineWins === false ? 'lost' : ''}`}
              onClick={() => finished && setOpenId(open ? null : d.id)}
            >
              <span className="md-code">{d.code}</span>
              <span className="md-vs">
                {t('vs', lang)} {rival ? `${rival.avatar} ${rival.name || t('lbAnon', lang)}` : '…'}
              </span>
              <span className="md-status">
                {mineWins === true ? `🏆 ${t('duelWonChip', lang)}`
                  : mineWins === false ? `💔 ${t('duelLostChip', lang)}`
                  : finished ? `🤝 ${t('duelDraw', lang)}`
                  : `⏳ ${t('duelPending', lang)}`}
              </span>
            </button>
            {open && match && (
              <DuelShowdown lang={lang} duel={d} match={match} viewer={viewer} animate={false} />
            )}
            {open && !match && <FallbackCompare lang={lang} duel={d} viewer={viewer} />}
          </div>
        );
      })}
    </div>
  );
}
