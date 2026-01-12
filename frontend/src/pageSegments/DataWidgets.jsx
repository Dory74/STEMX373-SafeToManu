import React from 'react';
import TideHeight from '../widgets/TideHeight';
import WaterTemp from '../widgets/WaterTemp';
import Wind from '../widgets/Wind';
import UVReading from '../widgets/UVReading';
import WaterQuality from '../widgets/WaterQuality';

function DataWidgets() {
  return (
    <div className="h-full w-full bg-[#030712] text-white px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="w-full"><UVReading /></div>
          <div className="w-full"><TideHeight /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="w-full"><WaterTemp /></div>
          <div className="w-full"><Wind /></div>
          <div className="w-full sm:col-span-2 lg:col-span-1"><WaterQuality /></div>
        </div>
      </div>
    </div>
  );
}

export default DataWidgets;
