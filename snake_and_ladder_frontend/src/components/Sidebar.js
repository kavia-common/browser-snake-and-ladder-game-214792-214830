import React from "react";
import "./Sidebar.css";

const PLAYER_COLORS = ["Blue", "Green", "Gold", "Pink"];

/**
 * @param {{
 *  phase: 'setup'|'playing'|'finished',
 *  playerCount: number,
 *  onChangePlayerCount: (n: number) => void,
 *  onStart: () => void,
 *  onReset: () => void,
 *  onRoll: () => void,
 *  positions: number[],
 *  currentPlayerIndex: number,
 *  winnerIndex: (number|null),
 *  lastRoll: (number|null),
 *  log: {id:string, text:string}[]
 * }} props
 */
export default function Sidebar({
  phase,
  playerCount,
  onChangePlayerCount,
  onStart,
  onReset,
  onRoll,
  positions,
  currentPlayerIndex,
  winnerIndex,
  lastRoll,
  log
}) {
  return (
    <aside className="sidebar" aria-label="Game sidebar">
      <div className="panel">
        <h1 className="title">SNAKE & LADDER</h1>
        <p className="subtitle">Retro browser edition</p>

        <div className="divider" />

        <div className="section">
          <h2 className="sectionTitle">Setup</h2>
          <label className="field">
            <span className="fieldLabel">Players</span>
            <select
              className="select"
              value={playerCount}
              onChange={(e) => onChangePlayerCount(Number(e.target.value))}
              disabled={phase !== "setup"}
              aria-label="Select number of players"
            >
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
              <option value={4}>4 players</option>
            </select>
          </label>

          <div className="buttonRow">
            <button className="btn btnPrimary" onClick={onStart} disabled={phase !== "setup"}>
              Start game
            </button>
            <button className="btn" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className="section">
          <h2 className="sectionTitle">Turn</h2>
          {phase === "setup" && <p className="hint">Start the game to roll the dice.</p>}

          {phase !== "setup" && winnerIndex === null && (
            <>
              <p className="statusLine">
                Current:{" "}
                <span className={`pill pillP${currentPlayerIndex}`}>
                  Player {currentPlayerIndex + 1} ({PLAYER_COLORS[currentPlayerIndex]})
                </span>
              </p>

              <p className="statusLine">
                Last roll:{" "}
                <span className="mono">{lastRoll === null ? "—" : String(lastRoll)}</span>
              </p>

              <button className="btn btnPrimary btnLarge" onClick={onRoll} disabled={phase !== "playing"}>
                Roll dice
              </button>

              <p className="hint">Exact 100 required to win.</p>
            </>
          )}

          {winnerIndex !== null && (
            <>
              <p className="statusLine">
                Winner:{" "}
                <span className={`pill pillP${winnerIndex}`}>
                  Player {winnerIndex + 1} ({PLAYER_COLORS[winnerIndex]})
                </span>
              </p>
              <button className="btn btnPrimary btnLarge" onClick={onReset}>
                Play again
              </button>
            </>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="sectionTitle">Players</h2>
        <ul className="playersList" aria-label="Player positions">
          {positions.map((pos, idx) => (
            <li key={idx} className="playerRow">
              <span className={`dot dotP${idx}`} aria-hidden="true" />
              <span className="playerName">
                Player {idx + 1} <span className="muted">({PLAYER_COLORS[idx]})</span>
              </span>
              <span className="playerPos mono">{pos === 0 ? "Start" : pos}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel panelLog">
        <h2 className="sectionTitle">Game log</h2>
        <div className="log" role="log" aria-live="polite">
          {log.length === 0 ? (
            <div className="logEmpty">No moves yet.</div>
          ) : (
            log.map((entry) => (
              <div key={entry.id} className="logLine">
                {entry.text}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
