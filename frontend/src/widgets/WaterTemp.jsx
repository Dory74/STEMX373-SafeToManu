function WaterTemp() {
  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Water Temp</h2>
      <p className="text-gray-300 mb-4">
        Placeholder to show surface water temperature from the temperature API.
      </p>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
        Connect to API
      </button>
    </div>
  )
}

export default WaterTemp
