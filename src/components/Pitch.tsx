import type { Formation, Slot } from '../game/engine';
import type { Pos } from '../data/squads';

interface Props {
  formation: Formation;
  slots: Slot[];
  highlightPos?: Pos | null;
  hideRatings?: boolean;
  onSlotClick?: (slot: Slot) => void;
}

export default function Pitch({ formation, slots, highlightPos, hideRatings, onSlotClick }: Props) {
  return (
    <div className="pitch">
      <div className="pitch-lines" aria-hidden="true">
        <div className="center-circle" />
        <div className="halfway" />
        <div className="box top" />
        <div className="box bottom" />
      </div>
      {formation.rows.map((_row, ri) => (
        <div className="pitch-row" key={ri}>
          {slots.filter(s => s.row === ri).map(slot => {
            const canPlace = highlightPos != null && slot.pos === highlightPos && !slot.player;
            return (
              <button
                key={slot.id}
                className={`slot pos-${slot.pos} ${slot.player ? 'filled' : 'empty'} ${canPlace ? 'placeable' : ''}`}
                onClick={() => onSlotClick?.(slot)}
                disabled={!canPlace && !slot.player}
              >
                {slot.player ? (
                  <>
                    <span className="slot-flag">{slot.player.flag}</span>
                    {!hideRatings && <span className="slot-rating">{slot.player.r}</span>}
                    <span className="slot-name">{slot.player.n}</span>
                    <span className="slot-year">{slot.player.year}</span>
                  </>
                ) : (
                  <span className="slot-pos">{slot.pos}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
