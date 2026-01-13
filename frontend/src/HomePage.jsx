import StatusGood from './pageSegments/StatusGood.jsx'
import SplashMeter from './pageSegments/SplashMeter.jsx'
import DataWidgets from './pageSegments/DataWidgets.jsx'
import LegalAndLogos from './pageSegments/LegalAndLogos.jsx'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Segment 1 */}
      <div className="relative h-[15vh]">
        <StatusGood />
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full max-h-[100px] leading-0">
          <svg viewBox="0 0 1440 100" className="w-full h-40px">
            <path 
              fill="#02060f" 
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Segment 2 */}
      <div className="h-[40vh] bg-[#02060f] px-3 sm:px-4">
        <SplashMeter />
      </div>

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
