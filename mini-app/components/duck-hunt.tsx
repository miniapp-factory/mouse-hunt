"use client";

import { useEffect, useRef, useState } from "react";

interface Duck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hit: boolean;
}

export default function DuckHunt() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ducks, setDucks] = useState<Duck[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(10);
  const [bang, setBang] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });

  // Initialize ducks
  useEffect(() => {
    const initDucks: Duck[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // percent
      y: Math.random() * 40 + 10, // percent
      vx: (Math.random() - 0.5) * 2, // percent per tick
      vy: (Math.random() - 0.5) * 2,
      hit: false,
    }));
    setDucks(initDucks);
  }, []);

  // Move ducks
  useEffect(() => {
    const interval = setInterval(() => {
      setDucks((prev) =>
        prev.map((d) => {
          if (d.hit) return d;
          let nx = d.x + d.vx;
          let ny = d.y + d.vy;
          // Bounce off edges
          if (nx < 0 || nx > 100) d.vx *= -1;
          if (ny < 0 || ny > 50) d.vy *= -1;
          return { ...d, x: nx, y: ny };
        })
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (attempts <= 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Show bang
    setBang({ x: clickX, y: clickY, show: true });
    setTimeout(() => setBang({ ...bang, show: false }), 200);

    // Check ducks
    setDucks((prev) =>
      prev.map((d) => {
        if (d.hit) return d;
        const dx = d.x - clickX;
        const dy = d.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          setScore((s) => s + 1);
          return { ...d, hit: true, y: 75 }; // move to bottom
        }
        return d;
      })
    );
    setAttempts((a) => a - 1);
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(10);
    setDucks([]);
    // Reinitialize ducks
    const initDucks: Duck[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      hit: false,
    }));
    setDucks(initDucks);
  };

  const allHit = ducks.every((d) => d.hit);
  const gameOver = attempts <= 0 || allHit;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-b from-blue-400 to-green-400"
      onClick={handleClick}
    >
      {ducks.map((d) => (
        <div
          key={d.id}
          className="absolute text-4xl"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: d.hit ? 0.5 : 1,
          }}
        >
          🦆
        </div>
      ))}
      {bang.show && (
        <div
          className="absolute text-4xl"
          style={{
            left: `${bang.x}%`,
            top: `${bang.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          💥
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-2xl">
        Score: {score} | Attempts: {attempts}
      </div>
      {gameOver && (
        <button
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded"
          onClick={resetGame}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
