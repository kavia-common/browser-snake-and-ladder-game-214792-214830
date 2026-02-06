import React, { useMemo } from "react";
import { BOARD_SIZE, squareToCoord } from "../game/engine";
import "./Board.css";

const TOKEN_LETTERS = ["A", "B", "C", "D"];

/**
 * Board component renders a 10x10 grid and player tokens.
 *
 * @param {{
 *  positions: number[],
 *  jumps: Record<number, number>,
 *  activePlayerIndex: number,
 *  winnerIndex: (number|null)
 * }} props
 */
export default function Board({ positions, jumps, activePlayerIndex, winnerIndex }) {
  const cells = useMemo(() => {
    // Create 10 rows (top->bottom), 10 cols each.
    // We'll compute square number for each coord by brute forcing 1..100.
    const coordToSquare = new Map();
    for (let s = 1; s <= BOARD_SIZE; s += 1) {
      const { row, col } = squareToCoord(s);
      coordToSquare.set(`${row},${col}`, s);
    }

    const out = [];
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        const square = coordToSquare.get(`${row},${col}`);
        out.push({ row, col, square });
      }
    }
    return out;
  }, []);

  const playersAtSquare = useMemo(() => {
    /** @type {Record<number, number[]>} */
    const map = {};
    positions.forEach((pos, idx) => {
      if (pos <= 0) return;
      if (!map[pos]) map[pos] = [];
      map[pos].push(idx);
    });
    return map;
  }, [positions]);

  const jumpStarts = useMemo(() => {
    return new Set(Object.keys(jumps).map((k) => Number(k)));
  }, [jumps]);

  return (
    <section className="board" aria-label="Snake and ladder board">
      <div className="boardGrid" role="grid" aria-rowcount={10} aria-colcount={10}>
        {cells.map((cell) => {
          const square = cell.square;
          const occupants = playersAtSquare[square] ?? [];
          const jumpTo = jumps[square];
          const isJumpStart = jumpStarts.has(square);
          const isLadder = typeof jumpTo === "number" && jumpTo > square;
          const isSnake = typeof jumpTo === "number" && jumpTo < square;

          return (
            <div
              key={`${cell.row}-${cell.col}`}
              className={[
                "cell",
                square % 2 === 0 ? "cellAlt" : "",
                square === 1 ? "cellStart" : "",
                square === 100 ? "cellFinish" : "",
                isJumpStart ? "cellJump" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              role="gridcell"
              aria-label={`Square ${square}`}
            >
              <div className="cellHeader">
                <span className="cellNumber">{square}</span>
                {isLadder && <span className="cellBadge cellBadgeLadder">L</span>}
                {isSnake && <span className="cellBadge cellBadgeSnake">S</span>}
              </div>

              <div className="cellTokens" aria-hidden="true">
                {occupants.map((pIdx) => {
                  const isActive = pIdx === activePlayerIndex && winnerIndex === null;
                  const isWinner = pIdx === winnerIndex;

                  return (
                    <span
                      key={pIdx}
                      className={[
                        "token",
                        `tokenP${pIdx}`,
                        isActive ? "tokenActive" : "",
                        isWinner ? "tokenWinner" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={`Player ${pIdx + 1}`}
                    >
                      {TOKEN_LETTERS[pIdx] ?? "?"}
                    </span>
                  );
                })}
              </div>

              {isJumpStart && (
                <div className="cellFooter" aria-hidden="true">
                  <span className={isLadder ? "jumpHintLadder" : "jumpHintSnake"}>
                    → {jumpTo}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="boardLegend" aria-label="Legend">
        <div className="legendItem">
          <span className="legendChip legendChipLadder">L</span> Ladder
        </div>
        <div className="legendItem">
          <span className="legendChip legendChipSnake">S</span> Snake
        </div>
        <div className="legendItem">
          <span className="legendChip legendChipFinish">100</span> Exact finish to win
        </div>
      </div>
    </section>
  );
}
