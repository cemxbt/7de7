import { useState } from 'react';
import { rollSquad, teamStrength } from '../game/engine';
import type { Formation, Mode, Slot } from '../game/engine';
import type { Player, Pos, Squad } from '../data/squads';
import type { Lang } from '../i18n';
import { t } from '../i18n';
import Pitch from './Pitch';

interface Props {
  lang: Lang;
  mode: Mode;
  formation: Formation;
  initialSlots: Slot[];
  onSimulate: (slots: Slot[]) => void;
  onBack: () => void;
}

const POS_ORDER: Pos[] = ['GK', 'DF', 'MF', 'FW'];
const POS_LABEL: Record<Pos, { tr: string; en: string }> = {
  GK: { tr: 'Kaleci', en: 'Goalkeeper' },
  DF: { tr: 'Defans', en: 'Defence' },
  MF: { tr: 'Orta Saha', en: 'Midfield' },
  FW: { tr: 'Forvet', en: 'Attack' },
};

export default function Draft({ lang, mode, formation, initialSlots, onSimulate, onBack }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [usedIdx] = useState<Set<number>>(() => new Set());
  const [current, setCurrent] = useState<Squad | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);
  const [skips, setSkips] = useState(mode === 'hardcore' ? 0 : 3);
  const [rolling, setRolling] = useState(false);
  const [diceFace, setDiceFace] = useState('🎲');

  const filledCount = slots.filter(s => s.player).length;
  const done = filledCount === 11;
  const hideRatings = mode === 'memory';

  const hasEmptySlot = (pos: Pos) => slots.some(s => s.pos === pos && !s.player);

  const doRoll = (spendSkip: boolean) => {
    if (rolling) return;
    if (spendSkip) {
      if (skips <= 0) return;
      setSkips(skips - 1);
    }
    setSelected(null);
    setRolling(true);
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    let ticks = 0;
    const iv = setInterval(() => {
      setDiceFace(faces[Math.floor(Math.random() * 6)]);
      ticks++;
      if (ticks >= 8) {
        clearInterval(iv);
        const { squad, idx } = rollSquad(usedIdx);
        usedIdx.add(idx);
        setCurrent(squad);
        setRolling(false);
        setDiceFace('🎲');
      }
    }, 90);
  };

  const placeOnSlot = (slot: Slot) => {
    if (!selected || slot.player || slot.pos !== selected.p || !current) return;
    const next = slots.map(s =>
      s.id === slot.id
        ? { ...s, player: { ...selected, squad: current.c, flag: current.f, year: current.y } }
        : s
    );
    setSlots(next);
    setSelected(null);
    setCurrent(null);
  };

  const strength = teamStrength(slots);

  return (
    <main className="draft">
      <div className="draft-head">
        <button className="ghost" onClick={onBack}>← {t('back', lang)}</button>
        <div className="draft-progress">
          <b>{filledCount}/11</b> {t('draftProgress', lang)}
          {!hideRatings && filledCount > 0 && (
            <span className="power-badge">{t('teamPower', lang)}: <b>{strength.toFixed(1)}</b></span>
          )}
        </div>
      </div>

      <div className="draft-grid">
        <Pitch
          formation={formation}
          slots={slots}
          highlightPos={selected?.p ?? null}
          hideRatings={hideRatings}
          onSlotClick={placeOnSlot}
        />

        <div className="draft-panel">
          {done ? (
            <div className="sim-ready">
              <div className="sim-ready-icon">🏆</div>
              <button className="cta" onClick={() => onSimulate(slots)}>
                {t('simulate', lang)}
              </button>
            </div>
          ) : !current ? (
            <div className="roll-area">
              <button className={`dice-btn ${rolling ? 'rolling' : ''}`} onClick={() => doRoll(false)} disabled={rolling}>
                <span className="dice-face">{diceFace}</span>
                <span>{rolling ? t('rolling', lang) : t('roll', lang)}</span>
              </button>
            </div>
          ) : (
            <div className="squad-panel">
              <div className="squad-head">
                <span className="squad-flag">{current.f}</span>
                <div>
                  <b>{lang === 'tr' ? current.tr : current.c} {current.y}</b>
                  <small>{t('squadOf', lang)}</small>
                </div>
                {skips > 0 && (
                  <button className="skip-btn" onClick={() => doRoll(true)}>
                    ⏭ {t('skip', lang)} <b>({skips})</b>
                  </button>
                )}
              </div>
              <p className="hint">
                {selected ? `👉 ${t('pickSlot', lang)}` : `👆 ${t('pickPlayer', lang)}`}
              </p>
              <div className="player-list">
                {POS_ORDER.map(pos => {
                  const group = current.players.filter(p => p.p === pos);
                  if (group.length === 0) return null;
                  return (
                    <div key={pos} className="pos-group">
                      <div className="pos-title">{POS_LABEL[pos][lang]}</div>
                      {group.sort((a, b) => b.r - a.r).map(p => {
                        const placeable = hasEmptySlot(p.p);
                        return (
                          <button
                            key={p.n}
                            className={`player-row ${selected === p ? 'sel' : ''}`}
                            disabled={!placeable}
                            onClick={() => setSelected(selected === p ? null : p)}
                          >
                            <span className={`pos-tag pos-${p.p}`}>{p.p}</span>
                            <span className="player-name">{p.n}</span>
                            <span className="player-rating">{hideRatings ? '?' : p.r}</span>
                          </button>
                        );
                      })}
                    </div>
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
