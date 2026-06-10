export type Pos = 'GK' | 'RB' | 'LB' | 'CB' | 'RM' | 'LM' | 'DM' | 'CM' | 'AM' | 'RW' | 'LW' | 'ST';

export interface Player {
  id: string;
  n: string;
  pos: Pos[];
  no: number;
  f: number; // force 0-99
  leg?: boolean; // legend
}

export interface Squad {
  sel: string; // country code
  copa: number; // world cup year
  squad: Player[];
}

export type SquadKey = string; // "SEL:COPA"

export interface PlacedPlayer extends Player {
  sel: string;
  copa: number;
}

export type Mode = 'classic' | 'almanak' | 'hardcore' | 'wc2026';
export type Style = 'defensive' | 'balanced' | 'offensive';

export interface ModeConfig {
  rerolls: number;
  statsVisible: boolean;
  poolCopa: number | null; // restrict draft pool to a single cup
}

export const MODES: Record<Mode, ModeConfig> = {
  classic: { rerolls: 3, statsVisible: true, poolCopa: null },
  almanak: { rerolls: 1, statsVisible: false, poolCopa: null },
  hardcore: { rerolls: 0, statsVisible: true, poolCopa: null },
  wc2026: { rerolls: 3, statsVisible: true, poolCopa: 2026 },
};

export interface SlotState {
  pos: Pos;
  x: number;
  y: number;
}

export interface DraftState {
  formation: string;
  style: Style;
  mode: Mode;
  slots: SlotState[];
  filled: (PlacedPlayer | null)[];
  usedPlayerIds: string[];
  rerollsLeft: number;
}

export interface GameState {
  seed: string;
  rollIndex: number;
  rerollNo: number;
  draft: DraftState;
  current: { sel: string; copa: number } | null;
  recent: SquadKey[];
}

export interface Ratings {
  attack: number;
  defense: number;
  overall: number;
}
