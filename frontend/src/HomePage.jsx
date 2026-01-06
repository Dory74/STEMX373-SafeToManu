import UVReading from './widgets/UVReading'




function App() {
  return (
    <div className="flex flex-col h-screen">
      {/* Segment 1 */}
      <div className="h-[15%] bg-red-500">
        Segment 1 (15%)
      </div>

      {/* Segment 2 */}
      <div className="h-[40%] bg-blue-500">
        Segment 2 (40%)
      </div>

      {/* Segment 3 */}
      <div className="h-[30%] bg-green-500">
        Segment 3 (30%)
      </div>

      {/* Segment 4 */}
      <div className="h-[15%] bg-yellow-500">
        Segment 4 (15%)
      </div>
    </div>
  )
}

export default App
