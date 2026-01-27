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

      {/* Segment 2 - Instant Replay & Leaderboard (hidden when conditions are bad)
      {!isBadConditions && (
        <div className="h-[26vh] bg-[#02060f] px-3 sm:px-4">
          <SplashMeter />
        </div>
      )} */}

      {/* Segment 3 */}
      <div className="min-h-fit bg-[#02060f]">
        <DataWidgets />
      </div>

      {/* Segment 4 - Legal and Logos */}
      <div className="bg-[#030712] py-4">
        <LegalAndLogos />
      </div>
    </div>
  )
}

export default App
