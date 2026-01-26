import React from 'react';

const COLORS = {
  amber: "#ffd447",
  amberDark: "#e6b800",
  midnight: "#02060f",
  gold: "#ffeb80",
}

function StatusModerate({ message }) {
  return (
    <div
      className="relative h-full overflow-hidden flex items-center justify-center text-center"
      style={{
        // Generated gradient background with yellow/amber tones
        background: `radial-gradient(circle at 20% 20%, ${COLORS.gold}15, transparent 40%),
          radial-gradient(circle at 80% 30%, ${COLORS.amberDark}12, transparent 45%),
          repeating-linear-gradient(135deg, ${COLORS.amber} 0 16px, ${COLORS.amberDark} 16px 32px)`,
        color: COLORS.midnight,
      }}
    >

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 pb-12 pt-10 sm:pb-16 lg:pb-20">
        {/* warning icon circle */}
        <div
          className="flex items-center justify-center rounded-full w-16 h-16 sm:w-20 sm:h-20"
          style={{
            backgroundColor: COLORS.midnight,
          }}
        >
          <span className="text-3xl sm:text-4xl text-white">⚠</span>
        </div>
        {/* title */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none hero-condensed"
          style={{ color: COLORS.midnight }}
        >
          SWIM WITH DISCRETION
        </h1>
        {/* subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold hero-condensed">
          {message || "Elevated levels detected • Use caution • Check signage"}
        </p>
      </div>

    </div>
  );
}

export default StatusModerate;
