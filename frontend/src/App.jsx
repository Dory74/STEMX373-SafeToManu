import UVReading from './widgets/UVReading'
import TideHeight from './widgets/TideHeight'
import TideSpeed from './widgets/TideSpeed'
import WaterTemp from './widgets/WaterTemp'
import WaterQuality from './widgets/WaterQuality'
import Wind from './widgets/Wind'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className=" mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Marine Widgets</h1>
          <p className="mt-2 text-gray-300">
            Hook these cards up to your endpoints when the APIs are ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <UVReading />
          <TideHeight />
          <TideSpeed />
          <WaterTemp />
          <WaterQuality />
          <Wind />
        </div>
      </div>
    </div>
  )
}

export default App
