import type { DraftState } from '../game/types';
import type { Lang } from '../i18n';
import { POS_LABEL } from '../i18n';

interface Props {
  lang: Lang;
  draft: DraftState;
  highlight: string[]; // positions to glow (placement)
  moveFrom: number | null;
  moveTargets: number[];
  moveEnabled: boolean;
  onSlotClick: (idx: number) => void;
}

export default function Pitch({ lang, draft, highlight, moveFrom, moveTargets, moveEnabled, onSlotClick }: Props) {
  const almanak = draft.mode === 'almanak';
  return (
    <div className="pitch">
      <div className="pitch-lines" aria-hidden="true">
        <div className="center-circle" />
        <div className="center-dot" />
        <div className="halfway" />
        <div className="box top" />
        <div className="box-inner top" />
        <div className="box bottom" />
        <div className="box-inner bottom" />
      </div>
      {draft.slots.map((slot, i) => {
        const player = draft.filled[i];
        const pickable = !player && highlight.includes(slot.pos);
        const isMoveTarget = moveTargets.includes(i);
        const movable = moveEnabled && !!player;
        const clickable = pickable || isMoveTarget || movable;
        return (
          <button
            key={i}
            className={[
              'disc',
              player ? 'filled' : 'empty',
              pickable ? 'pickable' : '',
              isMoveTarget ? 'move-target' : '',
              i === moveFrom ? 'move-from' : '',
              player?.leg ? 'legend' : '',
            ].filter(Boolean).join(' ')}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            onClick={clickable ? () => onSlotClick(i) : undefined}
            disabled={!clickable}
          >
            <span className="disc-circle" key={player?.id ?? 'empty'}>
              {player ? (almanak ? POS_LABEL[slot.pos][lang] : player.no || '–') : POS_LABEL[slot.pos][lang]}
            </span>
            {player && <span className="disc-name" key={`n-${player.id}`}>{player.n}</span>}
          </button>
        );
      })}
    </div>
  );
}
