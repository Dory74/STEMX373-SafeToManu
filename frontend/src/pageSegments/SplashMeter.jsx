import React from 'react';
import InstantReplay from '../widgets/InstantReplay';
import SplashLeaderboard from '../widgets/SplashLeaderboard';
// !!!!!!!!!!!!!!!!!! Depreciated with the change to a two panel design, use this and corrosponding widgets at your own risk !!!!!!!!!!!!!!!!! //
const COLORS = {
  midnight: "#02060f",
  border: "#0f1b2f",
  mint: "#2fffe1",
}

function SplashMeter() {
  return (
    <div
    // top left to bottom right gradient
      className="h-full w-full rounded-[28px] border-[3px] px-4 sm:px-6 py-4 sm:py-6"
      style={{
        background: `linear-gradient(135deg, ${COLORS.midnight}, #06122a 55%)`,
        borderColor: COLORS.border,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-6 h-full">
        <div className="h-full">
          <InstantReplay />
        </div>
        <div className="h-full">
          <SplashLeaderboard />
        </div>
      </div>
    </div>
  );
}

export default SplashMeter;
