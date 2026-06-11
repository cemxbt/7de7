import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import {
  applyChoose, applyMove, autoCompleteGame, eligiblePositions, findSquad, isPlayerSelectable,
  moveTargets as getMoveTargets, poolStuck, ratings, reroll, rerollOptionsAvailable, roll,
  POS_ORDER,
} from '../game/engine';
import type { GameState, Player, Squad, DraftState } from '../game/types';
import type { Lang } from '../i18n';
import { POS_LABEL, t } from '../i18n';
import Pitch from './Pitch';

interface Props {
  lang: Lang;
  squads: Squad[];
  initialGame: GameState;
  onSimulate: (draft: DraftState, seed: string) => void;
  onBack: () => void;
  /** timed drafts (synced duels): seconds until the squad is auto-completed */
  timeLimit?: number;
}

export default function Draft({ lang, squads, initialGame, onSimulate, onBack, timeLimit }: Props) {
  const [game, setGame] = useState<GameState>(initialGame);
  const [selected, setSelected] = useState<Player | null>(null);
  const [moveFrom, setMoveFrom] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [diceFace, setDiceFace] = useState('🎲');
  const [left, setLeft] = useState(timeLimit ?? 0);
  const submittedRef = useRef(false);

  // timed draft countdown: when it hits zero, finish the squad automatically
  useEffect(() => {
    if (!timeLimit) return;
    const iv = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000);
    return () => clearInterval(iv);
  }, [timeLimit]);

  useEffect(() => {
    if (!timeLimit || left > 0 || submittedRef.current) return;
    submittedRef.current = true;
    const done = autoCompleteGame(game, squads);
    onSimulate(done.draft, done.seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, timeLimit]);

  const { draft, current } = game;
  const almanak = draft.mode === 'almanak';
  const filledCount = draft.filled.filter(Boolean).length;
  const complete = filledCount === 11;
  const hideStats = almanak && !complete;

  const currentSquad = useMemo(
    () => (current ? findSquad(squads, current.sel, current.copa) : undefined),
    [current, squads],
  );

  const stuck = poolStuck(draft, currentSquad);
  const rrAvail = rerollOptionsAvailable(game, squads);
  const { attack, defense, overall } = ratings(draft);

  const doRoll = () => {
    if (rolling || current || complete) return;
    setSelected(null);
    setMoveFrom(null);
    setRolling(true);
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    let ticks = 0;
    const iv = setInterval(() => {
      setDiceFace(faces[Math.floor(Math.random() * 6)]);
      ticks++;
      if (ticks >= 8) {
        clearInterval(iv);
        setGame(g => roll(g, squads));
        setRolling(false);
        setDiceFace('🎲');
      }
    }, 80);
  };

  const doReroll = (axis: 'team' | 'cup') => {
    if (!current) return;
    if (!stuck && draft.rerollsLeft <= 0) return;
    setSelected(null);
    setGame(g => reroll(g, squads, axis, stuck));
  };

  const onSlotClick = (idx: number) => {
    // placement
    if (selected && current && draft.filled[idx] === null && selected.pos.includes(draft.slots[idx].pos)) {
      const placed = { ...selected, sel: current.sel, copa: current.copa };
      setGame(g => ({ ...g, draft: applyChoose(g.draft, placed, idx), current: null }));
      setSelected(null);
      return;
    }
    // move / swap (only between rolls)
    if (!current) {
      if (moveFrom === null) {
        if (draft.filled[idx]) setMoveFrom(idx);
      } else if (idx === moveFrom) {
        setMoveFrom(null);
      } else if (getMoveTargets(draft, moveFrom).includes(idx)) {
        setGame(g => ({ ...g, draft: applyMove(g.draft, moveFrom, idx) }));
        setMoveFrom(null);
      } else {
        setMoveFrom(draft.filled[idx] ? idx : null);
      }
    }
  };

  const highlight = selected ? eligiblePositions(draft, selected) : [];
  const targets = moveFrom !== null ? getMoveTargets(draft, moveFrom) : [];

  const poolSorted = currentSquad
    ? [...currentSquad.squad].sort((a, b) =>
        (POS_ORDER[a.pos[0]] ?? 99) - (POS_ORDER[b.pos[0]] ?? 99) || b.f - a.f)
    : [];

  const country = current ? COUNTRIES[current.sel] : null;

  return (
    <main className="draft">
      <div className="draft-head">
        <button className="ghost" onClick={onBack}>← {t('back', lang)}</button>
        {timeLimit !== undefined && (
          <span className={`draft-timer ${left <= 30 ? 'low' : ''}`}>
            ⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
          </span>
        )}
        <div className="box-ratings-inline">
          <span className="rating-chip ovr" key={`o${overall}`}><b>{hideStats ? '?' : overall || '—'}</b> {t('overall', lang)}</span>
          <span className="rating-chip atk" key={`a${attack}`}><b>{hideStats ? '?' : attack || '—'}</b> {t('attack', lang)}</span>
          <span className="rating-chip def" key={`d${defense}`}><b>{hideStats ? '?' : defense || '—'}</b> {t('defense', lang)}</span>
          <span className="rating-chip cnt" key={`c${filledCount}`}><b>{filledCount}</b>/11</span>
        </div>
      </div>

      <div className="draft-grid">
        <div className="pitch-col">
          <Pitch
            lang={lang}
            draft={draft}
            highlight={highlight}
            moveFrom={moveFrom}
            moveTargets={targets}
            moveEnabled={!current && !rolling}
            onSlotClick={onSlotClick}
          />
          {!current && !complete && filledCount > 0 && (
            <p className="pitch-hint">
              {moveFrom !== null ? `↔ ${t('hintMoveActive', lang)}` : `✋ ${t('hintMove', lang)}`}
            </p>
          )}
          {selected && <p className="pitch-hint glow">👉 {t('chooseSlot', lang)}</p>}
        </div>

        <div className="draft-panel">
          {complete ? (
            <div className="sim-ready">
              <div className="sim-ready-icon">🏆</div>
              <p>{t('lineupComplete', lang)}</p>
              <button
                className="cta"
                onClick={() => {
                  if (submittedRef.current) return;
                  submittedRef.current = true;
                  onSimulate(draft, game.seed);
                }}
              >
                {t('simulate', lang)}
              </button>
            </div>
          ) : !current ? (
            <div className="roll-area">
              <p className="roll-idle">{t('rollIdle', lang)}</p>
              <button className={`dice-btn ${rolling ? 'rolling' : ''}`} onClick={doRoll} disabled={rolling}>
                <span className="dice-face">{diceFace}</span>
                <span>{rolling ? t('rolling', lang) : t('roll', lang)}</span>
              </button>
            </div>
          ) : (
            <div className="squad-panel" key={`${current.sel}:${current.copa}:${game.rerollNo}`}>
              <div className="squad-head">
                <span className="squad-flag">{country?.flag}</span>
                <div className="squad-title">
                  <b>{country ? country[lang] : current.sel} {current.copa}</b>
                  <small>{t('squadOf', lang)}</small>
                </div>
              </div>

              {(stuck || draft.rerollsLeft > 0) && (
                <div className={`reroll-box ${stuck ? 'stuck' : ''}`}>
                  <span className="reroll-label">
                    {stuck ? `⚠️ ${t('rerollStuck', lang)}` : `🃏 ${t('rerollLabel', lang, { n: draft.rerollsLeft })}`}
                  </span>
                  <div className="reroll-btns">
                    <button className="reroll-btn" disabled={!rrAvail.team} onClick={() => doReroll('team')}>
                      🌍 {t('rerollTeam', lang)}
                    </button>
                    <button className="reroll-btn" disabled={!rrAvail.cup} onClick={() => doReroll('cup')}>
                      📅 {t('rerollCup', lang)}
                    </button>
                  </div>
                </div>
              )}

              <p className="hint">{selected ? `👉 ${t('chooseSlot', lang)}` : `👆 ${t('choosePlayer', lang)}`}</p>

              <div className="player-list">
                {poolSorted.map(p => {
                  const selectable = isPlayerSelectable(draft, p);
                  return (
                    <button
                      key={p.id}
                      className={`player-row ${selected?.id === p.id ? 'sel' : ''} ${p.leg ? 'legend' : ''}`}
                      disabled={!selectable}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    >
                      <span className="player-no">{p.no || '–'}</span>
                      <span className="player-pos">
                        {p.pos.map(x => POS_LABEL[x][lang]).join(' · ')}
                      </span>
                      <span className="player-name">{p.leg && '⭐ '}{p.n}</span>
                      <span className="player-rating">{almanak ? '?' : p.f}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
