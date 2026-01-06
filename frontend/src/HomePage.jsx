import StatusGood from './pageSegments/StatusGood.jsx'
import SplashMeter from './pageSegments/SplashMeter.jsx'
import DataWidgets from './pageSegments/DataWidgets.jsx'
import LegalAndLogos from './pageSegments/LegalAndLogos.jsx'



function App() {
  return (
    <div className="flex flex-col h-screen">
      {/* Segment 1 */}
      <div className="h-[15%] bg-red-500">
        {<StatusGood />}
      </div>

      {/* Segment 2 */}
      <div className="h-[40%] bg-blue-500">
        {<SplashMeter />}
      </div>

      {/* Segment 3 */}
      <div className="h-[30%] bg-green-500">
        {<DataWidgets />}
      </div>

      {/* Segment 4 */}
      <div className="h-[15%] bg-yellow-500">
        {<LegalAndLogos />}
      </div>
    </div>
  )
}

export default App
