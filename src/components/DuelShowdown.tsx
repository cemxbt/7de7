// Animated head-to-head match that settles a duel: creator's XI vs opponent's XI.
import { useEffect, useRef, useState } from 'react';
import { duelForm, type Duel } from '../challenge';
import type { MatchEvent, ShowdownMatch } from '../game/sim';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

const EV_ICON: Record<MatchEvent['type'], string> = {
  goal: '⚽', pengoal: '⚽', penmiss: '🚫', yellow: '🟨', red: '🟥',
  post: '💥', save: '🧤', miss: '😱',
};

const EV_KEY: Partial<Record<MatchEvent['type'], StringKey>> = {
  pengoal: 'evPenGoal', penmiss: 'evPenMiss', red: 'evRedNote',
  post: 'evPost', save: 'evSave', miss: 'evMiss',
};

const isGoal = (e: MatchEvent) => e.type === 'goal' || e.type === 'pengoal';

function evText(e: MatchEvent, lang: Lang): string {
  const key = EV_KEY[e.type];
  if (!key) return e.player;
  return e.type === 'pengoal' ? `${e.player} ${t(key, lang)}` : `${e.player} — ${t(key, lang)}`;
}

interface Props {
  lang: Lang;
  duel: Duel;
  match: ShowdownMatch;
  /** which side of the duel the viewer is on */
  viewer: 'creator' | 'opponent';
  /** false = jump straight to the final result (e.g. when browsing old duels) */
  animate?: boolean;
  onRematch?: () => void;
}

export default function DuelShowdown({ lang, duel, match, viewer, animate = true, onRematch }: Props) {
  const events = match.events;
  const pens = match.pens;
  const [minute, setMinute] = useState(animate ? 0 : 91);
  const [phase, setPhase] = useState<'play' | 'pens' | 'over'>(animate ? 'play' : 'over');
  const [kicks, setKicks] = useState(0);
  const skipRef = useRef(false);

  const aKicks = pens ? [...pens.me, ...(pens.sd?.me ?? [])] : [];
  const bKicks = pens ? [...pens.them, ...(pens.sd?.them ?? [])] : [];
  const totalKicks = aKicks.length + bKicks.length;

  useEffect(() => {
    if (phase === 'play') {
      if (minute > 90) {
        const timer = setTimeout(() => setPhase(pens ? 'pens' : 'over'), 900);
        return () => clearTimeout(timer);
      }
      const cur = events.filter(e => e.min === minute);
      const base = cur.some(isGoal) ? 1250 : cur.length > 0 ? 700 : minute === 45 ? 900 : 65;
      const timer = setTimeout(() => setMinute(m => m + 1), base);
      return () => clearTimeout(timer);
    }
    if (phase === 'pens') {
      if (kicks >= totalKicks) {
        const timer = setTimeout(() => setPhase('over'), 900);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setKicks(k => k + 1), 650);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, minute, kicks]);

  const skip = () => {
    skipRef.current = true;
    setMinute(91);
    setKicks(totalKicks);
    setPhase('over');
  };

  const shownMin = phase === 'play' ? Math.min(minute, 90) : 91;
  const shown = events.filter(e => e.min <= shownMin);
  const ga = shown.filter(e => isGoal(e) && !e.opp).length; // creator goals
  const gb = shown.filter(e => isGoal(e) && e.opp).length; // opponent goals
  const goalNow = phase === 'play' && minute <= 90 && events.find(e => e.min === minute && isGoal(e));

  const creatorName = duel.creator_profile?.name || t('lbAnon', lang);
  const opponentName = duel.opponent_profile?.name || t('lbAnon', lang);
  const nameA = viewer === 'creator' ? `⭐ ${t('duelYou', lang)}` : `${duel.creator_profile?.avatar ?? '⚽'} ${creatorName}`;
  const nameB = viewer === 'opponent' ? `⭐ ${t('duelYou', lang)}` : `${duel.opponent_profile?.avatar ?? '⚽'} ${opponentName}`;

  const visA = Math.min(aKicks.length, Math.ceil(kicks / 2));
  const visB = Math.min(bKicks.length, Math.floor(kicks / 2));
  const penA = aKicks.slice(0, visA).reduce((a, b) => a + b, 0);
  const penB = bKicks.slice(0, visB).reduce((a, b) => a + b, 0);

  const over = phase === 'over';
  const iWin = over ? (viewer === 'creator' ? match.aWins : !match.aWins) : null;

  const clock = phase === 'play'
    ? (minute > 90 ? t('fulltime', lang) : `${Math.min(minute, 90)}'`)
    : phase === 'pens' ? t('pensTitle', lang) : t('fulltime', lang);

  // feed: newest first, with HT/FT markers
  const feed: { key: string; cls: string; text: string }[] = [];
  if (shownMin > 90) feed.push({ key: 'ft', cls: 'marker', text: `⏱ ${t('fulltime', lang)} ${ga}–${gb}` });
  [...shown].reverse().forEach(e => {
    if (shownMin > 45 && e.min <= 45 && !feed.some(x => x.key === 'ht')) {
      feed.push({ key: 'ht', cls: 'marker', text: `⏱ ${t('halftime', lang)}` });
    }
    const mySide = (viewer === 'creator') !== e.opp; // is this event by the viewer's team?
    feed.push({
      key: `${e.min}-${e.type}-${e.player}-${+e.opp}`,
      cls: `${mySide ? 'me' : 'opp'} ${isGoal(e) ? 'is-goal' : ''} ${e.type === 'red' ? 'is-red' : ''}`,
      text: `${e.min}' ${EV_ICON[e.type]} ${evText(e, lang)}`,
    });
  });
  if (shownMin > 45 && !feed.some(x => x.key === 'ht')) feed.push({ key: 'ht', cls: 'marker', text: `⏱ ${t('halftime', lang)}` });
  if (shownMin >= 1) feed.push({ key: 'ko', cls: 'marker', text: `⏱ ${t('kickoff', lang)}` });

  return (
    <div className={`live-match showdown ${over ? (iWin ? 'sd-won' : 'sd-lost') : ''}`}>
      {goalNow && (
        <div className={`goal-banner ${(viewer === 'creator') !== goalNow.opp ? '' : 'opp'}`} key={`${goalNow.min}-${goalNow.player}`}>
          {(viewer === 'creator') !== goalNow.opp ? `⚽ ${t('goalBanner', lang)}` : `🥅 ${goalNow.player}`}
        </div>
      )}
      <div className="lm-stage">⚔️ {t('showdownTitle', lang)} · {duel.code}</div>
      <div className="lm-board">
        <span className={`lm-team ${viewer === 'creator' ? 'me' : 'opp'}`}>{nameA}</span>
        <span className="lm-score" key={`${ga}-${gb}`}>{ga}<i>–</i>{gb}</span>
        <span className={`lm-team ${viewer === 'opponent' ? 'me' : 'opp'}`}>{nameB}</span>
      </div>
      <div className="sd-forms">
        <span>
          {duel.creator_result?.formation} · {duel.creator_result?.overall} OVR
          {duel.creator_result && duelForm(duel.creator_result) > 0 && (
            <i className="sd-form-chip">🔥 +{duelForm(duel.creator_result)}</i>
          )}
        </span>
        <span>
          {duel.opponent_result?.formation} · {duel.opponent_result?.overall} OVR
          {duel.opponent_result && duelForm(duel.opponent_result) > 0 && (
            <i className="sd-form-chip">🔥 +{duelForm(duel.opponent_result)}</i>
          )}
        </span>
      </div>
      <div className="sd-form-note">🔥 = {t('formNote', lang)}</div>
      <div className="lm-clockrow">
        <span className={`lm-clock ${phase !== 'play' || minute > 90 ? 'done' : ''}`}>{clock}</span>
      </div>
      <div className="lm-progress"><div style={{ width: `${Math.min(100, (shownMin / 90) * 100)}%` }} /></div>

      {(phase === 'pens' || (over && pens)) && pens && (
        <div className="lm-pens">
          <div className="lm-pen-row">
            <span className="lm-pen-team">{viewer === 'creator' ? '⭐' : duel.creator_profile?.avatar ?? '⚽'}</span>
            <span className="lm-pen-dots">
              {aKicks.map((k, i) => (
                <span key={i} className={`pen-dot ${i < (over ? aKicks.length : visA) ? (k ? 'ok' : 'no') : ''}`} />
              ))}
            </span>
            <b>{over ? aKicks.reduce((a, b) => a + b, 0) : penA}</b>
          </div>
          <div className="lm-pen-row">
            <span className="lm-pen-team">{viewer === 'opponent' ? '⭐' : duel.opponent_profile?.avatar ?? '⚽'}</span>
            <span className="lm-pen-dots">
              {bKicks.map((k, i) => (
                <span key={i} className={`pen-dot ${i < (over ? bKicks.length : visB) ? (k ? 'ok' : 'no') : ''}`} />
              ))}
            </span>
            <b>{over ? bKicks.reduce((a, b) => a + b, 0) : penB}</b>
          </div>
        </div>
      )}

      {over && (
        <div className={`duel-verdict ${iWin ? 'win' : 'lose'}`}>
          {iWin ? `🏆 ${t('duelWin', lang)}` : `💔 ${t('duelLose', lang)}`}
          {pens && <small className="sd-pen-note"> · {t('pen', lang)} {pens.score}</small>}
        </div>
      )}

      <div className="lm-feed">
        {feed.map(item => (
          <div key={item.key} className={`lm-ev ${item.cls}`}>{item.text}</div>
        ))}
      </div>

      <div className="lm-controls">
        {!over && <button className="ghost small" onClick={skip}>{t('skipMatch', lang)} →</button>}
        {over && onRematch && (
          <button className="cta small-cta" onClick={onRematch}>🔁 {t('rematch', lang)}</button>
        )}
      </div>
    </div>
  );
}
