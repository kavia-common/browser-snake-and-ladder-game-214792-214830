import React, { useMemo, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import { applyRoll, createGame, DEFAULT_JUMPS, rollDie } from "./game/engine";

/**
 * Format events into human-readable log lines.
 * @param {import('./game/engine').GameEvent[]} events
 * @returns {string[]}
 */
function formatEvents(events) {
  const lines = [];
  for (const e of events) {
    if (e.type === "roll") {
      lines.push(`P${e.playerIndex + 1} rolled ${e.roll} (${e.from} → ${Math.min(e.to, 100)})`);
    } else if (e.type === "bust") {
      lines.push(`Exact finish rule: P${e.playerIndex + 1} stays at ${e.from}`);
    } else if (e.type === "ladder") {
      lines.push(`Ladder! P${e.playerIndex + 1} climbs ${e.from} → ${e.to}`);
    } else if (e.type === "snake") {
      lines.push(`Snake! P${e.playerIndex + 1} slides ${e.from} → ${e.to}`);
    } else if (e.type === "win") {
      lines.push(`P${e.playerIndex + 1} wins by landing exactly on 100!`);
    }
  }
  return lines;
}

// PUBLIC_INTERFACE
function App() {
  /** 'setup' | 'playing' | 'finished' */
  const [phase, setPhase] = useState("setup");
  const [playerCount, setPlayerCount] = useState(2);

  const [game, setGame] = useState(() => createGame(2, { jumps: DEFAULT_JUMPS }));
  const [log, setLog] = useState([]);

  const winnerIndex = game.winner;

  const appTitle = useMemo(() => {
    return winnerIndex !== null ? `Winner: Player ${winnerIndex + 1}` : "Snake & Ladder";
  }, [winnerIndex]);

  // PUBLIC_INTERFACE
  function handleChangePlayerCount(n) {
    const next = Math.max(2, Math.min(4, n));
    setPlayerCount(next);
    setGame(createGame(next, { jumps: DEFAULT_JUMPS }));
    setLog([]);
    setPhase("setup");
  }

  // PUBLIC_INTERFACE
  function handleStart() {
    setGame(createGame(playerCount, { jumps: DEFAULT_JUMPS }));
    setLog([{ id: cryptoId(), text: `Game started with ${playerCount} players.` }]);
    setPhase("playing");
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setGame(createGame(playerCount, { jumps: DEFAULT_JUMPS }));
    setLog([]);
    setPhase("setup");
  }

  // PUBLIC_INTERFACE
  function handleRoll() {
    if (phase !== "playing") return;
    if (game.winner !== null) return;

    const roll = rollDie();
    const { nextState, events } = applyRoll(game, roll);

    setGame(nextState);
    const lines = formatEvents(events);

    setLog((prev) => [
      ...prev,
      ...lines.map((text) => ({ id: cryptoId(), text }))
    ]);

    if (nextState.winner !== null) {
      setPhase("finished");
    }
  }

  return (
    <div className="appShell">
      <div className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            SL
          </div>
          <div className="brandText">
            <div className="brandTitle">{appTitle}</div>
            <div className="brandMeta">2–4 players • turn-based • retro board</div>
          </div>
        </div>

        <div className="topHint">
          Tip: Land on a square with <span className="chip chipL">L</span> or{" "}
          <span className="chip chipS">S</span> to jump instantly.
        </div>
      </div>

      <main className="layout">
        <Board
          positions={game.positions}
          jumps={game.jumps}
          activePlayerIndex={game.currentPlayer}
          winnerIndex={game.winner}
        />
        <Sidebar
          phase={phase}
          playerCount={playerCount}
          onChangePlayerCount={handleChangePlayerCount}
          onStart={handleStart}
          onReset={handleReset}
          onRoll={handleRoll}
          positions={game.positions}
          currentPlayerIndex={game.currentPlayer}
          winnerIndex={game.winner}
          lastRoll={game.lastRoll}
          log={log}
        />
      </main>

      <footer className="footer">
        <span className="footerMono">Rules:</span> exact finish • instant snake/ladder resolution •
        next player after every roll.
      </footer>
    </div>
  );
}

/**
 * Create stable IDs for log entries. Uses crypto.randomUUID when available.
 * @returns {string}
 */
function cryptoId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default App;
