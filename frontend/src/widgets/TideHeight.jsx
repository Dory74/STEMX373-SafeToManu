function TideHeight() {
  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Tide Height</h2>
      <p className="text-gray-300 mb-4">
        Placeholder for tide height readings fetched from the tides API.
      </p>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
        Connect to API
      </button>
    </div>
  )
}

export default TideHeight
