import React from 'react';
import TideHeight from '../widgets/TideHeight';
import WaterTemp from '../widgets/WaterTemp';
import Wind from '../widgets/Wind';
import UVReading from '../widgets/UVReading';
import WaterQuality from '../widgets/WaterQuality';

function DataWidgets() {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-4 p-2">
      <div className="col-span-1 row-span-1"><WaterQuality /></div>
      <div className="col-span-1 row-span-1"><WaterTemp /></div>
      <div className="col-span-1 row-span-1"><UVReading /></div>
      <div className="col-span-2 row-span-1"><TideHeight /></div>
      <div className="col-span-1 row-span-1"><Wind /></div>
    </div>

  );
}

export default DataWidgets;
