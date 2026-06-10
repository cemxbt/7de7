// Post-result panels for online battles (daily board + duel share/compare)
// and the Setup-screen online section.
import { useEffect, useState } from 'react';
import {
  compareResults, dailySeed, duelLink, fetchDailyBoard, fetchDuel, hasPlayedDaily,
  type ChallengeResult, type DailyRow, type Duel,
} from '../challenge';
import type { User } from '../online';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

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
  onDuelCreate: () => void;
  onDuelJoin: (duel: Duel) => void;
  onNeedLogin: () => void;
}

export function OnlineSection({ lang, user, initialCode, onDaily, onDuelCreate, onDuelJoin, onNeedLogin }: OnlineSectionProps) {
  const [code, setCode] = useState(initialCode);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);

  useEffect(() => {
    if (user) hasPlayedDaily(user.id).then(setPlayedToday).catch(() => { /* offline */ });
    else setPlayedToday(false);
  }, [user]);

  const guard = (fn: () => void) => () => {
    if (!user) { onNeedLogin(); return; }
    fn();
  };

  const join = async () => {
    if (!user) { onNeedLogin(); return; }
    setBusy(true);
    setErr(null);
    try {
      const duel = await fetchDuel(code);
      if (!duel) setErr(t('duelNotFound', lang));
      else if (duel.opponent) setErr(t('duelFull', lang));
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
      <div className="online-grid">
        <div className="online-box">
          <div className="ob-head">📅 <b>{t('dailyTitle', lang)}</b></div>
          <p className="ob-desc">{t('dailyDesc', lang)}</p>
          <button className="cta small-cta" onClick={guard(onDaily)} disabled={playedToday}>
            {playedToday ? t('dailyPlayed', lang) : `🎲 ${t('dailyPlay', lang)}`}
          </button>
        </div>
        <div className="online-box">
          <div className="ob-head">⚔️ <b>{t('duelTitle', lang)}</b></div>
          <p className="ob-desc">{t('duelDesc', lang)}</p>
          <button className="cta small-cta" onClick={guard(onDuelCreate)}>
            ⚔️ {t('duelCreate', lang)}
          </button>
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
    </section>
  );
}

// ---------- daily board (after playing) ----------

export function DailyBoardCard({ lang }: { lang: Lang }) {
  const [rows, setRows] = useState<DailyRow[] | null>(null);

  useEffect(() => {
    fetchDailyBoard().then(setRows).catch(() => setRows([]));
  }, []);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`);

  return (
    <div className="card online-result">
      <h2>📅 {t('dailyBoard', lang)} <small className="table-round">{dailySeed()}</small></h2>
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

// ---------- duel panels (after playing) ----------

export function DuelSharePanel({ lang, code }: { lang: Lang; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(duelLink(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="card online-result duel-share">
      <h2>⚔️ {t('duelTitle', lang)}</h2>
      <p className="ob-desc">{t('duelShare', lang)}</p>
      <div className="duel-code">{code}</div>
      <button className="ghost big" onClick={copy}>
        {copied ? `✓ ${t('copied', lang)}` : `🔗 ${t('copyLink', lang)}`}
      </button>
      <p className="ob-desc duel-wait">⏳ {t('duelWaiting', lang)}</p>
    </div>
  );
}

export function DuelComparePanel({ lang, duel, mine }: { lang: Lang; duel: Duel; mine: ChallengeResult }) {
  const theirs = duel.creator_result;
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
        {col(duel.creator_profile?.name || t('lbAnon', lang), duel.creator_profile?.avatar ?? '⚽', theirs, cmp < 0)}
      </div>
    </div>
  );
}
