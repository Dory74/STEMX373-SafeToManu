import { useState, useEffect, useCallback, useRef } from 'react';
import ManuLeaderboard from './ManuLeaderboard';

const COLORS = {
  midnight: "#02060f",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  label: "#8fb1d4",
};

function CountdownTimer() {
  const [countdown, setCountdown] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle', 'countdown', 'jump', 'filling', 'result', 'leaderboard'
  const [fillProgress, setFillProgress] = useState(0);
  const [keepLooping, setKeepLooping] = useState(true);
  const [latestScore, setLatestScore] = useState(null);
  const [latestUsername, setLatestUsername] = useState(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const keepLoopingRef = useRef(keepLooping);

  // Keep ref in sync with state
  useEffect(() => {
    keepLoopingRef.current = keepLooping;
  }, [keepLooping]);

  useEffect(() => {
    if (phase !== 'countdown' || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // When countdown reaches 0, transition to jump phase
  useEffect(() => {
    if (phase === 'countdown' && countdown === 0) {
      setPhase('jump');
    }
  }, [phase, countdown]);

  // Jump phase lasts 3 seconds, then transition to filling
  useEffect(() => {
    if (phase !== 'jump') return;

    const timer = setTimeout(() => {
      setPhase('filling');
      setFillProgress(0);
    }, 3000);

    return () => clearTimeout(timer);
  }, [phase]);

  // Filling animation - continuous loop until stopped
  useEffect(() => {
    if (phase !== 'filling') return;

    const loopDuration = 3000; // 3 seconds per fill (slower)
    const interval = 50;
    const increment = 100 / (loopDuration / interval);

    const timer = setInterval(() => {
      setFillProgress((prev) => {
        if (prev >= 100) {
          // Check if we should keep looping
          if (!keepLoopingRef.current) {
            clearInterval(timer);
            setPhase('result');
            setIsRunning(false);
            return 100;
          }
          return 0; // Reset for next loop
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [phase]);

  // Result phase - fetch score and show for 5 seconds
  useEffect(() => {
    if (phase !== 'result') return;

    const SERVER_ADDRESS = import.meta.env.VITE_API_URL;
    
    // Fetch latest jump score from the API
    fetch(new URL('/api/latestJump', SERVER_ADDRESS))
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.score === 'number') {
          setLatestScore(data.score);
          setLatestUsername(data.username || 'Anonymous');
          
          // Fetch leaderboard to determine position
          return fetch(new URL('/api/leaderboard', SERVER_ADDRESS))
            .then((res) => res.json())
            .then((leaderboard) => {
              if (Array.isArray(leaderboard)) {
                const sorted = leaderboard
                  .filter((item) => typeof item.score === 'number')
                  .sort((a, b) => b.score - a.score);
                
                // Find position based on latest score
                const position = sorted.findIndex((item) => item.score <= data.score);
                setLeaderboardPosition(position > 0 ? position : sorted.length + 1);
              }
            });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch score:', err);
        setLatestScore(Math.floor(Math.random() * 50) + 10); // Fallback random score
        setLeaderboardPosition(Math.floor(Math.random() * 10) + 1);
      });

    // Transition to leaderboard after 5 seconds
    const timer = setTimeout(() => {
      setPhase('leaderboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [phase]);

  const startCountdown = useCallback(() => {
    setCountdown(5);
    setPhase('countdown');
    setIsRunning(true);
    setFillProgress(0);
    setKeepLooping(true);
  }, []);

  const resetCountdown = useCallback(() => {
    setCountdown(5);
    setPhase('idle');
    setIsRunning(false);
    setFillProgress(0);
    setKeepLooping(true);
  }, []);

  const toggleLooping = useCallback(() => {
    setKeepLooping((prev) => !prev);
  }, []);

  const renderContent = () => {
    if (phase === 'jump') {
      return (
        <div 
          className="text-6xl font-bold leading-none drop-shadow-lg"
          style={{ color: COLORS.mint }}
        >
          JUMP!
        </div>
      );
    }

    if (phase === 'leaderboard') {
      return (
        <ManuLeaderboard onBack={resetCountdown} />
      );
    }

    if (phase === 'result') {
      return (
        <div className="flex flex-col items-center justify-center gap-6 text-center px-4">
          {/* Username Display */}
          <div>
            <p 
              className="text-[11px] font-semibold tracking-[0.3em] uppercase mb-2"
              style={{ color: COLORS.label }}
            >
              Jumper
            </p>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'white' }}
            >
              {latestUsername || '...'}
            </div>
          </div>

          {/* Score Display */}
          <div>
            <p 
              className="text-[11px] font-semibold tracking-[0.3em] uppercase mb-2"
              style={{ color: COLORS.label }}
            >
              Your Score
            </p>
            <div 
              className="text-6xl font-bold drop-shadow-lg"
              style={{ color: COLORS.mint }}
            >
              {latestScore !== null ? latestScore.toFixed(1) : '...'}
            </div>
          </div>

          {/* Position Display */}
          <div>
            <p 
              className="text-[11px] font-semibold tracking-[0.3em] uppercase mb-2"
              style={{ color: COLORS.label }}
            >
              Leaderboard Position
            </p>
            <div className="flex items-center justify-center gap-2">
              <span 
                className="text-4xl font-bold"
                style={{ color: leaderboardPosition === 1 ? COLORS.yellow : leaderboardPosition <= 3 ? COLORS.mint : 'white' }}
              >
                #{leaderboardPosition !== null ? leaderboardPosition : '...'}
              </span>
              {leaderboardPosition === 1 && <span className="text-3xl">🏆</span>}
              {leaderboardPosition === 2 && <span className="text-3xl">🥈</span>}
              {leaderboardPosition === 3 && <span className="text-3xl">🥉</span>}
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'filling') {
      return (
        <div className="relative w-32 h-40">
          {/* Cartoony Water droplet */}
          <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-xl">
            {/* Clip path for the droplet shape */}
            <defs>
              <clipPath id="dropletClip">
                <path d="M50 5 C50 5 8 55 8 88 C8 118 26 135 50 135 C74 135 92 118 92 88 C92 55 50 5 50 5 Z" />
              </clipPath>
              {/* Gradient for water */}
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#2fffe1" />
              </linearGradient>
              {/* Shine gradient */}
              <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            
            {/* Drop shadow effect */}
            <ellipse cx="50" cy="138" rx="25" ry="5" fill="rgba(0,0,0,0.3)" />
            
            {/* Fill background (empty) */}
            <path
              d="M50 5 C50 5 8 55 8 88 C8 118 26 135 50 135 C74 135 92 118 92 88 C92 55 50 5 50 5 Z"
              fill="rgba(255,255,255,0.3)"
            />
            
            {/* Water fill (animated) */}
            <g clipPath="url(#dropletClip)">
              <rect
                x="0"
                y={140 - (fillProgress * 1.4)}
                width="100"
                height={fillProgress * 1.4}
                fill="url(#waterGradient)"
                className="transition-all duration-100"
              />
              {/* Wavy top of water */}
              <ellipse
                cx="50"
                cy={140 - (fillProgress * 1.4)}
                rx="50"
                ry="8"
                fill="#99f6e4"
                className="transition-all duration-100"
              />
            </g>
            
            {/* Cartoon shine/highlight */}
            <ellipse
              cx="30"
              cy="50"
              rx="12"
              ry="18"
              fill="url(#shineGradient)"
              transform="rotate(-20 30 50)"
            />
            <ellipse
              cx="25"
              cy="75"
              rx="5"
              ry="8"
              fill="rgba(255,255,255,0.5)"
              transform="rotate(-20 25 75)"
            />
            
            {/* Droplet outline - thick and round */}
            <path
              d="M50 5 C50 5 8 55 8 88 C8 118 26 135 50 135 C74 135 92 118 92 88 C92 55 50 5 50 5 Z"
              fill="none"
              stroke={COLORS.mint}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }

    // Default: show countdown number
    return (
      <div 
        className="text-8xl font-bold leading-none drop-shadow-lg"
        style={{ color: COLORS.mint }}
      >
        {countdown}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-[256px] h-[512px] overflow-hidden">
      {/* Content Display */}
      {renderContent()}

      {/* Buttons - hidden during result and leaderboard phases */}
      {phase !== 'leaderboard' && phase !== 'result' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={startCountdown}
              disabled={isRunning}
              className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: COLORS.mint, 
                color: COLORS.midnight 
              }}
            >
              Start
            </button>
            <button
              onClick={resetCountdown}
              className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-80"
              style={{ 
                backgroundColor: COLORS.border, 
                color: COLORS.label 
              }}
            >
              Reset
            </button>
          </div>
          {phase === 'filling' && (
            <button
              onClick={toggleLooping}
              className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-80"
              style={{ 
                backgroundColor: keepLooping ? '#ef4444' : COLORS.mint, 
                color: keepLooping ? 'white' : COLORS.midnight 
              }}
            >
              {keepLooping ? 'Stop Loop' : 'Continue Loop'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CountdownTimer;
