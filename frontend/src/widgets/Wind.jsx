import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 
const lat = import.meta.env.VITE_LAT
const lon = import.meta.env.VITE_LON

function WindSpeed() {

  const [windSpeed, setWindSpeed] = useState(null);


  useEffect(() => {
    requestWindSpeed(); // Call the function when the component mounts
  }, []);

  const requestWindSpeed = async () => {
    const url = new URL("/api/windSpeed", SERVER_ADDRESS)
    url.searchParams.set("lat", lat)
    url.searchParams.set("lon", lon)

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
      console.error("Invalid JSON received from Wind speed endpoint", text)
      throw err
    }

    setWindSpeed(data.speed ?? data)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">Wind speed Reading</h2>
      <div className="text-gray-300 mb-4">
        {windSpeed !== undefined && windSpeed !== null ? (
          <p className="text-gray-100 font-semibold mb-4" >Current Wind speed Index: {windSpeed} kn</p>
        ) : (
          <p className="text-gray-300 mb-4">
            No current Wind speed value available—connect to the Wind speed monitoring endpoint to load data.
          </p>
        )}
      </div>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        onClick={async () => {
          await requestWindSpeed();
        }}>
        Connect to API
      </button>
    </div>
  )
}

export default WindSpeed
