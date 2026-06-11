import { DraftSlot, Formation, FormationSlot, Player, Position } from '../types/game';

export function getFormationSlots(formation: Formation): FormationSlot[] {
  switch (formation) {
    case '4-3-3':
      return [
        { position: 'GK', slotIndex: 0, x: 50, y: 88 },
        { position: 'LB', slotIndex: 1, x: 18, y: 72 },
        { position: 'CB', slotIndex: 2, x: 36, y: 70 },
        { position: 'CB', slotIndex: 3, x: 64, y: 70 },
        { position: 'RB', slotIndex: 4, x: 82, y: 72 },
        { position: 'CM', slotIndex: 5, x: 22, y: 48 },
        { position: 'CM', slotIndex: 6, x: 50, y: 45 },
        { position: 'CM', slotIndex: 7, x: 78, y: 48 },
        { position: 'LW', slotIndex: 8, x: 15, y: 18 },
        { position: 'ST', slotIndex: 9, x: 50, y: 12 },
        { position: 'RW', slotIndex: 10, x: 85, y: 18 },
      ];
    case '4-4-2':
      return [
        { position: 'GK', slotIndex: 0, x: 50, y: 88 },
        { position: 'LB', slotIndex: 1, x: 18, y: 72 },
        { position: 'CB', slotIndex: 2, x: 36, y: 70 },
        { position: 'CB', slotIndex: 3, x: 64, y: 70 },
        { position: 'RB', slotIndex: 4, x: 82, y: 72 },
        { position: 'LM', slotIndex: 5, x: 15, y: 48 },
        { position: 'CM', slotIndex: 6, x: 36, y: 45 },
        { position: 'CM', slotIndex: 7, x: 64, y: 45 },
        { position: 'RM', slotIndex: 8, x: 85, y: 48 },
        { position: 'ST', slotIndex: 9, x: 34, y: 12 },
        { position: 'ST', slotIndex: 10, x: 66, y: 12 },
      ];
    case '4-2-3-1':
      return [
        { position: 'GK', slotIndex: 0, x: 50, y: 88 },
        { position: 'LB', slotIndex: 1, x: 18, y: 72 },
        { position: 'CB', slotIndex: 2, x: 36, y: 70 },
        { position: 'CB', slotIndex: 3, x: 64, y: 70 },
        { position: 'RB', slotIndex: 4, x: 82, y: 72 },
        { position: 'CDM', slotIndex: 5, x: 36, y: 58 },
        { position: 'CDM', slotIndex: 6, x: 64, y: 58 },
        { position: 'LW', slotIndex: 7, x: 15, y: 35 },
        { position: 'CAM', slotIndex: 8, x: 50, y: 32 },
        { position: 'RW', slotIndex: 9, x: 85, y: 35 },
        { position: 'ST', slotIndex: 10, x: 50, y: 12 },
      ];
    case '3-5-2':
      return [
        { position: 'GK', slotIndex: 0, x: 50, y: 88 },
        { position: 'CB', slotIndex: 1, x: 25, y: 70 },
        { position: 'CB', slotIndex: 2, x: 50, y: 68 },
        { position: 'CB', slotIndex: 3, x: 75, y: 70 },
        { position: 'LM', slotIndex: 4, x: 10, y: 50 },
        { position: 'CM', slotIndex: 5, x: 28, y: 46 },
        { position: 'CM', slotIndex: 6, x: 50, y: 44 },
        { position: 'CM', slotIndex: 7, x: 72, y: 46 },
        { position: 'RM', slotIndex: 8, x: 90, y: 50 },
        { position: 'ST', slotIndex: 9, x: 34, y: 12 },
        { position: 'ST', slotIndex: 10, x: 66, y: 12 },
      ];
  }
}

// Natural fills: what slot positions a player can fill from their PRIMARY position alone.
// Intentionally strict — ST cannot fill LW/RW without explicit altPositions.
const naturalFills: Record<Position, Position[]> = {
  GK:  ['GK'],
  CB:  ['CB'],
  RB:  ['RB'],
  LB:  ['LB'],
  CDM: ['CDM', 'CM'],
  CM:  ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM'],
  RM:  ['RM', 'RW'],
  LM:  ['LM', 'LW'],
  RW:  ['RW', 'RM'],
  LW:  ['LW', 'LM'],
  ST:  ['ST'],
};

export function canPlayerFillSlot(
  playerPosition: Position,
  altPositions: Position[],
  slotPosition: Position
): boolean {
  if (naturalFills[playerPosition]?.includes(slotPosition)) return true;
  if (altPositions.includes(slotPosition)) return true;
  for (const alt of altPositions) {
    if (naturalFills[alt]?.includes(slotPosition)) return true;
  }
  return false;
}

/** All free (empty) slots where this player can be placed. */
export function getCompatibleFreeSlots(player: Player, draftSlots: DraftSlot[]): DraftSlot[] {
  return draftSlots.filter(
    (ds) =>
      ds.player === null &&
      canPlayerFillSlot(player.position, player.altPositions, ds.slot.position)
  );
}

/** Can this player be placed anywhere in the current unfilled formation? */
export function canPickPlayer(player: Player, draftSlots: DraftSlot[]): boolean {
  return getCompatibleFreeSlots(player, draftSlots).length > 0;
}

export function getPositionLabel(position: Position): string {
  const labels: Record<Position, string> = {
    GK: 'GL', CB: 'ZAG', RB: 'LD', LB: 'LE',
    CDM: 'VOL', CM: 'MC', CAM: 'MEI',
    RM: 'MD', LM: 'ME', RW: 'PD', LW: 'PE', ST: 'CA',
  };
  return labels[position] ?? position;
}

export function getPositionColor(position: Position): string {
  if (position === 'GK') return 'bg-yellow-600 text-white';
  if (['CB', 'RB', 'LB'].includes(position)) return 'bg-blue-700 text-white';
  if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(position)) return 'bg-green-700 text-white';
  return 'bg-red-700 text-white';
}
