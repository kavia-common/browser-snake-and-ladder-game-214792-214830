/**
 * Snake & Ladder game engine utilities.
 * Kept framework-agnostic so UI stays simple.
 */

export const BOARD_SIZE = 100;

/**
 * Standard-ish snakes and ladders layout.
 * Keys are "from", values are "to".
 * (A move to `from` will immediately resolve to `to`.)
 */
export const DEFAULT_JUMPS = Object.freeze({
  // Ladders
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
  // Snakes
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78
});

/**
 * Converts a square number (1-100) to board grid coordinates for rendering.
 * Board is 10x10 and serpentine:
 * - Bottom row is 1..10 left->right
 * - Next row is 11..20 right->left
 * - ...
 *
 * Returned coordinates are 0-indexed from top-left.
 *
 * @param {number} square
 * @returns {{row: number, col: number}}
 */
export function squareToCoord(square) {
  const clamped = Math.max(1, Math.min(BOARD_SIZE, square));
  const idx = clamped - 1;
  const rowFromBottom = Math.floor(idx / 10); // 0..9
  const posInRow = idx % 10; // 0..9
  const isReversed = rowFromBottom % 2 === 1;

  const colFromLeft = isReversed ? 9 - posInRow : posInRow;
  const rowFromTop = 9 - rowFromBottom;

  return { row: rowFromTop, col: colFromLeft };
}

/**
 * Create a new game state.
 *
 * @param {number} playerCount 2-4
 * @param {{jumps?: Record<number, number>, seed?: number}} [options]
 * @returns {GameState}
 */
export function createGame(playerCount, options = {}) {
  const count = Math.max(2, Math.min(4, playerCount));
  const jumps = options.jumps ?? DEFAULT_JUMPS;

  return {
    playerCount: count,
    jumps,
    positions: Array.from({ length: count }, () => 0), // 0 means "off board"
    currentPlayer: 0,
    winner: null,
    lastRoll: null,
    isRolling: false
  };
}

/**
 * Roll a fair six-sided die.
 * @returns {number} 1..6
 */
export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Apply a dice roll to a given state and return the next state.
 * Rules:
 * - Players start at position 0.
 * - Must roll to enter? (Classic varies). Here: any roll from 0 moves to that square.
 * - Exact finish required: if a move would exceed 100, you don't move.
 * - If you land on a snake/ladder start, you jump immediately.
 * - Win when landing exactly on 100 after jump resolution.
 *
 * @param {GameState} state
 * @param {number} roll 1..6
 * @returns {{nextState: GameState, events: GameEvent[]}}
 */
export function applyRoll(state, roll) {
  if (state.winner !== null) {
    return { nextState: state, events: [] };
  }

  const events = [];
  const p = state.currentPlayer;
  const startPos = state.positions[p];
  const tentative = startPos + roll;

  events.push({
    type: "roll",
    playerIndex: p,
    roll,
    from: startPos,
    to: tentative
  });

  let newPos = startPos;

  if (tentative > BOARD_SIZE) {
    // Exact finish: do not move.
    events.push({
      type: "bust",
      playerIndex: p,
      roll,
      from: startPos,
      to: startPos
    });
  } else {
    newPos = tentative;

    const jumpTo = state.jumps[newPos];
    if (typeof jumpTo === "number") {
      const isLadder = jumpTo > newPos;
      events.push({
        type: isLadder ? "ladder" : "snake",
        playerIndex: p,
        from: newPos,
        to: jumpTo
      });
      newPos = jumpTo;
    }

    if (newPos === BOARD_SIZE) {
      events.push({ type: "win", playerIndex: p });
    }
  }

  const nextPositions = state.positions.slice();
  nextPositions[p] = newPos;

  const winner = newPos === BOARD_SIZE ? p : null;

  // Next player's turn unless someone won.
  const nextPlayer =
    winner !== null ? state.currentPlayer : (state.currentPlayer + 1) % state.playerCount;

  /** @type {GameState} */
  const nextState = {
    ...state,
    positions: nextPositions,
    currentPlayer: nextPlayer,
    winner,
    lastRoll: roll,
    isRolling: false
  };

  return { nextState, events };
}

/**
 * @typedef {{playerCount:number, jumps: Record<number, number>, positions:number[], currentPlayer:number, winner:(number|null), lastRoll:(number|null), isRolling:boolean}} GameState
 */

/**
 * @typedef {(
 *  {type:'roll', playerIndex:number, roll:number, from:number, to:number} |
 *  {type:'bust', playerIndex:number, roll:number, from:number, to:number} |
 *  {type:'ladder', playerIndex:number, from:number, to:number} |
 *  {type:'snake', playerIndex:number, from:number, to:number} |
 *  {type:'win', playerIndex:number}
 * )} GameEvent
 */
