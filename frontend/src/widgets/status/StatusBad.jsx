import React from 'react';

const COLORS = {
  danger: "#ff4d67",
  dangerDark: "#cc2244",
  midnight: "#02060f",
  dangerLight: "#ff8099",
}

function StatusBad({ message }) {
  return (
    <div
      className="relative h-full overflow-hidden flex items-center justify-center text-center"
      style={{
        // Generated gradient background with red/danger tones
        background: `radial-gradient(circle at 20% 20%, ${COLORS.dangerLight}15, transparent 40%),
          radial-gradient(circle at 80% 30%, ${COLORS.dangerDark}12, transparent 45%),
          repeating-linear-gradient(135deg, ${COLORS.danger} 0 16px, ${COLORS.dangerDark} 16px 32px)`,
        color: "#ffffff",
      }}
    >

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 pb-12 pt-10 sm:pb-16 lg:pb-20">
        {/* danger icon circle */}
        <div
          className="flex items-center justify-center rounded-full w-20 h-20 sm:w-24 sm:h-24"
          style={{
            backgroundColor: COLORS.midnight,
          }}
        >
          <span className="text-4xl sm:text-5xl text-white">✕</span>
        </div>
        {/* title */}
        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight uppercase leading-none hero-condensed"
          style={{ color: "#ffffff" }}
        >
          DO NOT SWIM
        </h1>
        {/* subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold hero-condensed max-w-2xl">
          {message || "High contaminants detected • Swimming not advised • Check with local authorities"}
        </p>
        {/* additional warning */}
        <div 
          className="mt-4 px-6 py-3 rounded-xl border-2"
          style={{ borderColor: "#ffffff", backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <p className="text-lg sm:text-xl font-bold uppercase tracking-wider">
            ⚠ Public Health Warning In Effect ⚠
          </p>
        </div>
      </div>

    </div>
  );
}

export default StatusBad;
