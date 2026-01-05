import UVReading from './dev_widgets/UVReading'
import TideHeight from './dev_widgets/TideHeight'
import TideSpeed from './dev_widgets/TideSpeed'
import WaterTemp from './dev_widgets/WaterTemp'
import WaterQuality from './dev_widgets/WaterQuality'
import Wind from './dev_widgets/Wind'
import Leaderboard from './dev_widgets/Leaderboard'
import InstantReplay from './dev_widgets/InstantReplay'



function App() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className=" mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Manu Widgets</h1>
          <p className="mt-2 text-gray-300">
            Planning document to test funcitonality of all widgets <br></br><strong>This is not the final desing</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <UVReading />
          <TideHeight />
          {/* <TideSpeed /> */}
          <WaterTemp />
          <WaterQuality />
          <Wind />
          <Leaderboard />
          <InstantReplay />
        </div>
      </div>
    </div>
  )
}

export default App
