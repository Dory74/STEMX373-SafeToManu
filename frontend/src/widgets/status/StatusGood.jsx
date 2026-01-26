import React from 'react';

const COLORS = {
  mint: "#2fffe1",
  mintDark: "#18d6bb",
  midnight: "#02060f",
  cyan: "#67fff0",
}

function StatusGood({ message }) {
  return (
    <div
      className="relative h-full overflow-hidden flex items-center justify-center text-center"
      style={{
        // Generated gradeient background
        background: `radial-gradient(circle at 20% 20%, ${COLORS.cyan}15, transparent 40%),
          radial-gradient(circle at 80% 30%, ${COLORS.mintDark}12, transparent 45%),
          repeating-linear-gradient(135deg, ${COLORS.mint} 0 16px, ${COLORS.mintDark} 16px 32px)`,
        color: COLORS.midnight,
      }}
    >

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 pb-12 pt-10 sm:pb-16 lg:pb-20">
        {/* check mark circle */}
        <div
          className="flex items-center justify-center rounded-full w-16 h-16 sm:w-20 sm:h-20"
          style={{
            backgroundColor: COLORS.midnight,
          }}
        >
          <span className="text-3xl sm:text-4xl text-white">✓</span>
        </div>
        {/* title */}
        {/* tracking class used for letter spacing */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none hero-condensed"
          style={{ color: COLORS.midnight }}
        >
          GOOD TO MANU
        </h1>
        {/* subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold hero-condensed">
          {message || "Waves clean • Sun shining • Conditions green"}
        </p>
      </div>


    </div>
  );
}

export default StatusGood;
