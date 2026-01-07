import React from 'react';
import InstantReplay from '../widgets/InstantReplay';
import SplashLeaderboard from '../widgets/SplashLeaderboard';

function SplashMeter() {
  return (
    <div className='flex w-full'>
      <div className='flex-4 p-2'>
        <InstantReplay />
      </div>
      <div className='flex-1 p-2'>
        <SplashLeaderboard />
      </div>
    </div>
  );
}

export default SplashMeter;
