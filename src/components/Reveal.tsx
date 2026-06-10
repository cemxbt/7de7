import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import type { CampaignResult, Fixture, MatchEvent, Stage } from '../game/sim';
import type { DraftState, PlacedPlayer } from '../game/types';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  result: CampaignResult;
  draft: DraftState;
  onPlayAgain: () => void;
  onDonate: () => void;
  footer?: React.ReactNode;
}

const STAGE_KEY: Record<Stage, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

const countAgg = (names: string[]): string => {
  const m = new Map<string, number>();
  names.forEach(n => m.set(n, (m.get(n) ?? 0) + 1));
  return [...m].map(([n, c]) => (c > 1 ? `${n} (${c})` : n)).join(', ');
};

// ---------- group draw ceremony ----------

function GroupDraw({ group, lang, onDone }: {
  group: { sel: string; copa: number }[];
  lang: Lang;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(0); // 0..4 rows
  const rows = [null, ...group]; // null = you

  useEffect(() => {
    if (revealed >= rows.length) return;
    const timer = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 600 : 850);
    return () => clearTimeout(timer);
  }, [revealed, rows.length]);

  const done = revealed >= rows.length;

  return (
    <div className="group-draw">
      <div className="gd-title">🎱 {t('drawTitle', lang)}</div>
      <div className="gd-sub">{t('yourGroup', lang)}</div>
      <div className="gd-rows">
        {rows.map((r, i) => {
          const shown = i < revealed;
          const c = r ? COUNTRIES[r.sel] : null;
          return (
            <div key={i} className={`gd-row ${shown ? 'shown' : ''} ${r === null ? 'me' : ''}`}>
              <span className="gd-ball">{shown ? '⚪' : '🔵'}</span>
              <span className="gd-name">
                {shown ? (r === null ? `⭐ ${t('yourTeam', lang)}` : `${c?.flag ?? ''} ${c ? c[lang] : r.sel} ${r.copa}`) : '· · ·'}
              </span>
            </div>
          );
        })}
      </div>
      {done && (
        <button className="cta gd-start" onClick={onDone}>⚽ {t('startMatches', lang)}</button>
      )}
    </div>
  );
}

// ---------- confetti ----------

const CONFETTI_COLORS = ['#e8b923', '#3aa655', '#d33', '#3a7bd5', '#e87f23', '#9b59b6'];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 2.2,
      dur: 2.6 + Math.random() * 2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * 360,
    })), []);
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- live match ----------

const EV_ICON: Record<MatchEvent['type'], string> = {
  goal: '⚽', pengoal: '⚽', penmiss: '🚫', yellow: '🟨', red: '🟥',
  post: '💥', save: '🧤', miss: '😱',
};

function evText(e: MatchEvent, lang: Lang): string {
  switch (e.type) {
    case 'pengoal': return `${e.player} ${t('evPenGoal', lang)}`;
    case 'penmiss': return `${e.player} — ${t('evPenMiss', lang)}`;
    case 'red': return `${e.player} — ${t('evRedNote', lang)}`;
    case 'post': return `${e.player} — ${t('evPost', lang)}`;
    case 'save': return `${e.player} — ${t('evSave', lang)}`;
    case 'miss': return `${e.player} — ${t('evMiss', lang)}`;
    default: return e.player;
  }
}

const isGoal = (e: MatchEvent) => e.type === 'goal' || e.type === 'pengoal';

export type Speed = 'slow' | 'normal' | 'fast';
const SPEED_MULT: Record<Speed, number> = { slow: 1.9, normal: 1, fast: 0.3 };

interface LiveProps {
  f: Fixture;
  lang: Lang;
  onDone: () => void;
  speed: Speed;
  onSpeed: (s: Speed) => void;
  auto: boolean;
  onStopAuto: () => void;
}

function SpeedSeg({ speed, onSpeed, lang }: { speed: Speed; onSpeed: (s: Speed) => void; lang: Lang }) {
  const opts: { v: Speed; icon: string; key: StringKey }[] = [
    { v: 'slow', icon: '🐢', key: 'speedSlow' },
    { v: 'normal', icon: '▶', key: 'speedNormal' },
    { v: 'fast', icon: '⚡', key: 'speedFast' },
  ];
  return (
    <div className="speed-seg" role="group">
      {opts.map(o => (
        <button
          key={o.v}
          className={speed === o.v ? 'active' : ''}
          onClick={() => onSpeed(o.v)}
          title={t(o.key, lang)}
        >
          {o.icon} <span className="speed-lbl">{t(o.key, lang)}</span>
        </button>
      ))}
    </div>
  );
}

function LiveMatch({ f, lang, onDone, speed, onSpeed, auto, onStopAuto }: LiveProps) {
  const events = f.events ?? [];
  const pens = f.pens;
  const [minute, setMinute] = useState(0);
  const [phase, setPhase] = useState<'play' | 'pens' | 'over'>('play');
  const [kicks, setKicks] = useState(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const meKicks = pens ? [...pens.me, ...(pens.sd?.me ?? [])] : [];
  const themKicks = pens ? [...pens.them, ...(pens.sd?.them ?? [])] : [];
  const totalKicks = meKicks.length + themKicks.length;

  useEffect(() => {
    const wait = (base: number) => Math.max(16, base * SPEED_MULT[speedRef.current]);
    if (phase === 'play') {
      if (minute >= 90) {
        const timer = setTimeout(() => setPhase(pens ? 'pens' : 'over'), wait(1000));
        return () => clearTimeout(timer);
      }
      const cur = events.filter(e => e.min === minute);
      const base = cur.some(isGoal) ? 1300 : cur.length > 0 ? 750 : minute === 45 ? 1000 : 78;
      const timer = setTimeout(() => setMinute(m => m + 1), wait(base));
      return () => clearTimeout(timer);
    }
    if (phase === 'pens') {
      if (kicks >= totalKicks) {
        const timer = setTimeout(() => setPhase('over'), wait(1100));
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setKicks(k => k + 1), wait(700));
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(onDone, wait(650));
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, minute, kicks]);

  const shown = events.filter(e => e.min <= minute);
  const gf = shown.filter(e => isGoal(e) && !e.opp).length;
  const ga = shown.filter(e => isGoal(e) && e.opp).length;
  const goalNow = phase === 'play' && minute < 90 && events.find(e => e.min === minute && isGoal(e));

  const c = COUNTRIES[f.oppSel];
  const oppLabel = `${c?.flag ?? ''} ${c ? c[lang] : f.oppSel} ${f.oppCopa}`;

  const visMe = Math.min(meKicks.length, Math.ceil(kicks / 2));
  const visThem = Math.min(themKicks.length, Math.floor(kicks / 2));
  const penMe = meKicks.slice(0, visMe).reduce((a, b) => a + b, 0);
  const penThem = themKicks.slice(0, visThem).reduce((a, b) => a + b, 0);

  const clock = phase === 'play'
    ? (minute >= 90 ? t('fulltime', lang) : `${minute}'`)
    : phase === 'pens' ? t('pensTitle', lang) : t('fulltime', lang);

  // feed: newest first, with HT marker
  const feed: { key: string; cls: string; text: string }[] = [];
  if (minute >= 90) feed.push({ key: 'ft', cls: 'marker', text: `⏱ ${t('fulltime', lang)} ${gf}–${ga}` });
  [...shown].reverse().forEach(e => {
    if (minute > 45 && e.min <= 45 && !feed.some(x => x.key === 'ht')) {
      // insert HT marker before first ≤45' event in the reversed list
      feed.push({ key: 'ht', cls: 'marker', text: `⏱ ${t('halftime', lang)}` });
    }
    feed.push({
      key: `${e.min}-${e.type}-${e.player}-${+e.opp}`,
      cls: `${e.opp ? 'opp' : 'me'} ${isGoal(e) ? 'is-goal' : ''} ${e.type === 'red' ? 'is-red' : ''}`,
      text: `${e.min}' ${EV_ICON[e.type]} ${evText(e, lang)}`,
    });
  });
  if (minute > 45 && !feed.some(x => x.key === 'ht')) feed.push({ key: 'ht', cls: 'marker', text: `⏱ ${t('halftime', lang)}` });
  if (minute >= 1) feed.push({ key: 'ko', cls: 'marker', text: `⏱ ${t('kickoff', lang)}` });

  return (
    <div className="live-match">
      {goalNow && (
        <div className={`goal-banner ${goalNow.opp ? 'opp' : ''}`} key={`${goalNow.min}-${goalNow.player}`}>
          {goalNow.opp ? `🥅 ${goalNow.player}` : `⚽ ${t('goalBanner', lang)}`}
        </div>
      )}
      <div className="lm-stage">{t(STAGE_KEY[f.stage], lang)}</div>
      <div className="lm-board">
        <span className="lm-team me">⭐ {t('yourTeam', lang)}</span>
        <span className="lm-score" key={`${gf}-${ga}`}>{gf}<i>–</i>{ga}</span>
        <span className="lm-team opp">{oppLabel}</span>
      </div>
      <div className="lm-clockrow">
        <span className={`lm-clock ${phase !== 'play' || minute >= 90 ? 'done' : ''}`}>{clock}</span>
      </div>
      <div className="lm-progress"><div style={{ width: `${Math.min(100, (minute / 90) * 100)}%` }} /></div>

      {phase !== 'play' && pens && (
        <div className="lm-pens">
          <div className="lm-pen-row">
            <span className="lm-pen-team">⭐</span>
            <span className="lm-pen-dots">
              {meKicks.map((k, i) => (
                <span key={i} className={`pen-dot ${i < visMe ? (k ? 'ok' : 'no') : ''}`} />
              ))}
            </span>
            <b>{penMe}</b>
          </div>
          <div className="lm-pen-row">
            <span className="lm-pen-team">{c?.flag ?? '·'}</span>
            <span className="lm-pen-dots">
              {themKicks.map((k, i) => (
                <span key={i} className={`pen-dot ${i < visThem ? (k ? 'ok' : 'no') : ''}`} />
              ))}
            </span>
            <b>{penThem}</b>
          </div>
        </div>
      )}

      <div className="lm-feed">
        {feed.map(item => (
          <div key={item.key} className={`lm-ev ${item.cls}`}>{item.text}</div>
        ))}
      </div>

      <div className="lm-controls">
        <SpeedSeg speed={speed} onSpeed={onSpeed} lang={lang} />
        <button className="ghost small" onClick={onDone}>{t('skipMatch', lang)} →</button>
        {auto && <button className="ghost small" onClick={onStopAuto}>⏸ {t('stopAuto', lang)}</button>}
      </div>
    </div>
  );
}

// ---------- fixture summary card ----------

function FixtureCard({ f, lang, final }: { f: Fixture; lang: Lang; final: boolean }) {
  const c = COUNTRIES[f.oppSel];
  const won = f.group ? f.outcome === 'W' : f.advanced;
  const lost = f.group ? f.outcome === 'L' : !f.advanced;
  const mark = final && f.advanced ? '🏆' : won ? '✓' : lost ? '✕' : '–';
  const reds = (f.events ?? []).filter(e => e.type === 'red');
  const yellows = (f.events ?? []).filter(e => e.type === 'yellow');
  const penMisses = (f.events ?? []).filter(e => e.type === 'penmiss');
  return (
    <div className={`fixture ${won ? 'won' : lost ? 'lost' : 'drew'} ${final ? 'is-final' : ''}`}>
      <div className="fx-top">
        <span className="fx-stage">{t(STAGE_KEY[f.stage], lang)}</span>
        <span className="fx-mark">{mark}</span>
      </div>
      <div className="fx-row">
        <span className="fx-you">⭐ {t('yourTeam', lang)}</span>
        <span className="fx-score">{f.gf} – {f.ga}</span>
        <span className="fx-opp">{c?.flag} {c ? c[lang] : f.oppSel} {f.oppCopa}</span>
      </div>
      {f.pens && (
        <div className="fx-pens">
          🥅 {t('pen', lang)} <b>{f.pens.score}</b>
          <span className="fx-kicks">
            {f.pens.me.map(k => (k ? '🟢' : '🔴'))}{f.pens.sd && f.pens.sd.me.map(k => (k ? '🟢' : '🔴'))}
            {' / '}
            {f.pens.them.map(k => (k ? '🟢' : '🔴'))}{f.pens.sd && f.pens.sd.them.map(k => (k ? '🟢' : '🔴'))}
          </span>
        </div>
      )}
      {(f.scorers.length > 0 || f.conceded.length > 0) && (
        <div className="fx-scorers">
          {f.scorers.length > 0 && <span>⚽ {t('scored', lang)} {countAgg(f.scorers)}</span>}
          {f.conceded.length > 0 && <span className="fx-conceded">🥅 {t('concededLbl', lang)} {countAgg(f.conceded)}</span>}
        </div>
      )}
      {(reds.length > 0 || penMisses.length > 0 || yellows.length > 0) && (
        <div className="fx-extras">
          {penMisses.map((e, i) => <span key={`p${i}`}>🚫 {e.player}</span>)}
          {reds.map((e, i) => <span key={`r${i}`}>🟥 {e.player}</span>)}
          {yellows.length > 0 && <span>🟨 ×{yellows.length}</span>}
        </div>
      )}
      {f.other && (() => {
        const a = COUNTRIES[f.other!.aSel];
        const b = COUNTRIES[f.other!.bSel];
        return (
          <div className="fx-other">
            ⚔ {t('otherMatch', lang)}: {a?.flag} {a ? a[lang] : f.other.aSel} <b>{f.other.ga}–{f.other.gb}</b> {b?.flag} {b ? b[lang] : f.other.bSel}
          </div>
        );
      })()}
    </div>
  );
}

// ---------- reveal ----------

const loadSpeed = (): Speed => {
  const s = localStorage.getItem('7de7-speed');
  return s === 'slow' || s === 'fast' ? s : 'normal';
};

export default function Reveal({ lang, result, draft, onPlayAgain, onDonate, footer }: Props) {
  const [drawDone, setDrawDone] = useState(false);
  const [step, setStep] = useState(0); // completed fixtures
  const [live, setLive] = useState(false); // kicks off after the group draw
  const [auto, setAuto] = useState(false);
  const [speed, setSpeedState] = useState<Speed>(loadSpeed);
  const [copied, setCopied] = useState(false);
  const total = result.campaign.length;
  const finished = step >= total;
  const playing = !finished && live;
  const visible = result.campaign.slice(0, step);
  const latestTable = [...visible].reverse().find(f => f.groupTable);
  const inKnockout = visible.some(f => !f.group) || (playing && !result.campaign[step].group);

  const xi = draft.filled.filter((p): p is PlacedPlayer => p !== null);

  const setSpeed = (s: Speed) => {
    setSpeedState(s);
    localStorage.setItem('7de7-speed', s);
  };

  const matchDone = () => {
    setLive(false);
    setStep(s => s + 1);
  };

  // auto mode: kick off the next match after a short breather
  useEffect(() => {
    if (!auto || live || finished) return;
    const timer = setTimeout(() => setLive(true), 900);
    return () => clearTimeout(timer);
  }, [auto, live, finished]);

  const topScorer = useMemo(() => {
    const counts = new Map<string, number>();
    result.campaign.forEach(f => f.scorers.forEach(s => counts.set(s, (counts.get(s) ?? 0) + 1)));
    let best: [string, number] | null = null;
    counts.forEach((n, name) => { if (!best || n > best[1]) best = [name, n]; });
    return best as [string, number] | null;
  }, [result]);

  const shareText = () => {
    const lines: string[] = [];
    lines.push(`${t('title', lang)} ⚽ ${draft.formation} · ${t('seedLbl', lang, { seed: result.seed })}`);
    result.campaign.forEach(f => {
      const c = COUNTRIES[f.oppSel];
      const won = f.group ? f.outcome === 'W' : f.advanced;
      const icon = won ? '✅' : f.outcome === 'D' && f.group ? '➖' : '❌';
      const pen = f.pens ? ` (${t('pen', lang)} ${f.pens.score})` : '';
      lines.push(`${icon} ${f.gf}-${f.ga}${pen} ${c?.flag ?? ''} ${c ? c[lang] : f.oppSel} ${f.oppCopa}`);
    });
    if (result.perfect) lines.push(`💎 ${t('perfect', lang)} · ${t('overall', lang)} ${result.overall}`);
    else if (result.champion) lines.push(`🏆 ${t('champion', lang)} ${result.record} · ${t('overall', lang)} ${result.overall}`);
    else lines.push(`☠️ ${t('eliminated', lang)} ${result.record}`);
    if (result.badge) lines.push(`★ ${t(result.badge === 'CRUSHER' ? 'badgeCrusher' : 'badgeWall', lang)}`);
    lines.push(window.location.href);
    return lines.join('\n');
  };

  const doShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <main className="reveal">
      {!drawDone && (
        <GroupDraw
          group={result.group}
          lang={lang}
          onDone={() => { setDrawDone(true); setLive(true); }}
        />
      )}

      <div className="fixture-list">
        {visible.map((f, i) => (
          <FixtureCard key={i} f={f} lang={lang} final={f.stage === 'F'} />
        ))}
      </div>

      {playing && (
        <LiveMatch
          key={step}
          f={result.campaign[step]}
          lang={lang}
          onDone={matchDone}
          speed={speed}
          onSpeed={setSpeed}
          auto={auto}
          onStopAuto={() => setAuto(false)}
        />
      )}

      {latestTable?.groupTable && (!inKnockout || finished) && (
        <div className="card table-card">
          <h2>{t('groupTable', lang)} {!finished && <small className="table-round">{t(STAGE_KEY[latestTable.stage], lang)}</small>}</h2>
          <table className="standings">
            <thead>
              <tr><th></th><th>P</th><th>+/-</th><th>⚽</th></tr>
            </thead>
            <tbody>
              {latestTable.groupTable.map((r, i) => {
                const c = r.sel ? COUNTRIES[r.sel] : null;
                return (
                  <tr key={i} className={`${r.me ? 'you-row' : ''} ${i < 2 ? 'q-row' : ''}`}>
                    <td>{r.me ? `⭐ ${t('yourTeam', lang)}` : `${c?.flag ?? ''} ${c ? c[lang] : r.sel} ${r.copa}`}</td>
                    <td>{r.pts}</td>
                    <td>{r.gd > 0 ? '+' : ''}{r.gd}</td>
                    <td>{r.gf}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawDone && !finished && !playing && !auto && (
        <div className="sim-controls">
          <button className="cta" onClick={() => setLive(true)}>
            {t('next', lang)} →
          </button>
          {step + 1 < total && (
            <button className="ghost" onClick={() => { setAuto(true); setLive(true); }}>▶▶ {t('autoSim', lang)}</button>
          )}
          {step + 1 < total && (
            <button className="ghost" onClick={() => { setStep(total); setLive(false); setAuto(false); }}>⏩ {t('skipAll', lang)}</button>
          )}
        </div>
      )}

      {!finished && !playing && auto && (
        <div className="sim-controls">
          <div className="auto-wait">
            <span className="auto-dot" /><span className="auto-dot" /><span className="auto-dot" />
          </div>
        </div>
      )}

      {finished && (
        <div className={`result-card ${result.champion ? 'gold' : ''}`}>
          {result.champion && <Confetti />}
          <div className="rc-seed">{t('seedLbl', lang, { seed: result.seed })}</div>

          {result.perfect ? (
            <>
              <div className="result-icon">💎🏆</div>
              <h1 className="result-title">{t('perfect', lang)}</h1>
            </>
          ) : result.champion ? (
            <>
              <div className="result-icon">🏆</div>
              <h1 className="result-title">{t('champion', lang)}</h1>
            </>
          ) : (
            <>
              <div className="result-icon">☠️</div>
              <h1 className="result-title">{t('eliminated', lang)}</h1>
            </>
          )}

          <div className="rc-record">{result.record}</div>

          {result.badge && (
            <div className="rc-badge">★ {t(result.badge === 'CRUSHER' ? 'badgeCrusher' : 'badgeWall', lang)} ★</div>
          )}

          <div className="result-stats">
            <div><b>{result.gf}</b><span>{t('gf', lang)}</span></div>
            <div><b>{result.ga}</b><span>{t('ga', lang)}</span></div>
            <div><b>{result.overall}</b><span>{t('overall', lang)}</span></div>
            <div><b>{result.wins}</b><span>{result.perfect ? t('unbeaten', lang) : t('wins', lang)}</span></div>
            {topScorer && <div><b>{topScorer[0]} ({topScorer[1]})</b><span>{t('topScorer', lang)}</span></div>}
          </div>

          <div className="rc-lineup">
            {xi.map((p, i) => {
              const c = COUNTRIES[p.sel];
              return (
                <span key={i} className={`rc-chip ${p.leg ? 'legend' : ''}`}>
                  <span className="rc-chip-no">{p.no || '–'}</span>
                  <span className="rc-chip-name">{p.n}</span>
                  <span className="rc-chip-org">{c?.flag} {p.copa}</span>
                </span>
              );
            })}
          </div>

          <div className="result-actions">
            <button className="cta" onClick={onPlayAgain}>🔁 {t('playAgain', lang)}</button>
            <button className="ghost big" onClick={doShare}>
              {copied ? `✓ ${t('copied', lang)}` : `📋 ${t('share', lang)}`}
            </button>
          </div>

          <button className="donate-reminder" onClick={onDonate}>
            {t('donateReminder', lang)}
          </button>
        </div>
      )}

      {finished && footer}
    </main>
  );
}
