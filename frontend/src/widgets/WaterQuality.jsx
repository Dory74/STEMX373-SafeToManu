import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 

function WaterQuality() {

  const [waterQuality, setWaterQuality] = useState(null);


  useEffect(() => {
    requestWaterQuality(); // Call the function when the component mounts
  }, []);

  const getWaterQualityColor = (value) => {
    const waterQualityValue = parseFloat(value)
    if (Number.isNaN(waterQualityValue)) {
      return "gray"
    }
    if (waterQualityValue == 1) {
      return "green"
    }
    if (waterQualityValue == 2){
      return "yellow"
    }
    return "red"
    

  }

  const requestWaterQuality = async () => {
    const url = new URL("/api/enterococci", SERVER_ADDRESS)


    const response = await fetch(url, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    let data
    try {
      data = await response.json()
    } catch (err) {
      const text = await response.text()
      console.error("Invalid JSON received from Water Quality endpoint", text)
      throw err
    }

    setWaterQuality(data.safteyLevel ?? data)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">Water Quality Reading</h2>
      <div className="text-gray-300 mb-4">
        {waterQuality !== undefined && waterQuality !== null ? (
          <p className="text-gray-100 font-semibold mb-4" style={{color: getWaterQualityColor(waterQuality)}}>Current Water Quality Index: {waterQuality}</p>
        ) : (
          <p className="text-gray-300 mb-4">
            No current Water Quality value available—connect to the Water Quality monitoring endpoint to load data.
          </p>
        )}
      </div>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        onClick={async () => {
          await requestWaterQuality();
        }}>
        Connect to API
      </button>
    </div>
  )
}

export default WaterQuality
