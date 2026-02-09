import Banner from './pageSegments/Banner.jsx'
import SplashMeter from './pageSegments/SplashMeter.jsx'
import DataWidgets from './pageSegments/DataWidgets.jsx'
import LegalAndLogos from './pageSegments/LegalAndLogos.jsx'
import { useWarningLevel } from './context/WarningLevelContext.jsx'

function App() {
  const { warningData } = useWarningLevel();
  const isBadConditions = warningData.level === 3;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Segment 1 - Status Banner (expanded when conditions are bad) */}
      <div className={`relative ${isBadConditions ? 'h-[40vh]' : 'h-[14vh]'} transition-all duration-500`}>
        <Banner />
      </div>

      {/* Segment 2 - Data Widgets */}
      <div className="min-h-fit bg-[#02060f]">
        <DataWidgets />
      </div>

      {/* Segment 3 - Legal and Logos */}
      <div className="bg-[#030712] py-4">
        <LegalAndLogos />
      </div>
    </div>
  )
}

export default App
