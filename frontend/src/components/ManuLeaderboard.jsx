import { useState, useEffect, useRef } from 'react';

const SERVER_ADDRESS = import.meta.env.VITE_API_URL;

const COLORS = {
  midnight: "#02060f",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  label: "#8fb1d4",
  rowBg: "#0b1529",
};

function ManuLeaderboard({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const fetchLeaderboard = async () => {
    setStatus('loading');
    setError('');
    try {
      const url = new URL('/api/leaderboard', SERVER_ADDRESS);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data
            .filter((item) => typeof item.score === 'number')
            .sort((a, b) => b.score - a.score)
            .slice(0, 25) // Top 25
        : [];
      setEntries(normalized);
      setStatus('loaded');
    } catch (err) {
      setStatus('error');
      setError(err?.message || 'Unable to load leaderboard');
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (status !== 'loaded' || !scrollRef.current) return;

    const container = scrollRef.current;
    let scrollDirection = 1;
    let scrollPosition = 0;
    let isPaused = true;
    
    // Initial pause at top
    const initialPause = setTimeout(() => {
      isPaused = false;
    }, 3000);
    
    const scrollInterval = setInterval(() => {
      if (isPaused) return;
      
      const maxScroll = container.scrollHeight - container.clientHeight;
      
      if (maxScroll <= 0) return;
      
      scrollPosition += scrollDirection * 1;
      
      if (scrollPosition >= maxScroll) {
        scrollDirection = -1;
        scrollPosition = maxScroll;
      } else if (scrollPosition <= 0) {
        scrollDirection = 1;
        scrollPosition = 0;
        // Pause at top for 3 seconds
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
        }, 3000);
      }
      
      container.scrollTop = scrollPosition;
    }, 50);

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(initialPause);
    };
  }, [status, entries]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-xl animate-pulse" style={{ color: COLORS.mint }}>Loading...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <div className="text-red-400 text-sm text-center">{error}</div>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors hover:opacity-80"
          style={{ backgroundColor: COLORS.mint, color: COLORS.midnight }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-3 py-4">
      {/* Title */}
      <p 
        className="text-[11px] font-semibold tracking-[0.3em] uppercase text-center mb-3"
        style={{ color: COLORS.label }}
      >
        Leaderboard
      </p>

      {/* Leaderboard List */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto space-y-1.5"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {entries.length === 0 ? (
          <div className="text-center text-sm" style={{ color: COLORS.label }}>No entries yet</div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 rounded-xl transition-all border"
              style={{ 
                backgroundColor: COLORS.rowBg,
                borderColor: index === 0 ? COLORS.yellow : index < 3 ? COLORS.mint : COLORS.border
              }}
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-2">
                <span 
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{ 
                    backgroundColor: index === 0 ? COLORS.yellow : index < 3 ? COLORS.mint : COLORS.border,
                    color: index < 3 ? COLORS.midnight : COLORS.label
                  }}
                >
                  {index + 1}
                </span>
                <span className="text-white text-sm font-medium truncate max-w-[100px]">
                  {entry.username || '---'}
                </span>
              </div>

              {/* Score */}
              <span 
                className="px-2 py-0.5 rounded-full text-sm font-bold"
                style={{ 
                  backgroundColor: 'rgba(47, 255, 225, 0.15)',
                  color: COLORS.mint
                }}
              >
                {entry.score}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-80"
          style={{ 
            backgroundColor: COLORS.mint, 
            color: COLORS.midnight 
          }}
        >
          New Splash
        </button>
      )}
    </div>
  );
}

export default ManuLeaderboard;
