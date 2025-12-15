import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 

function UVReading() {

  const [uv, setUV] = useState(null);


  useEffect(() => {
    requestUV(); // Call the function when the component mounts
  }, []);

  const getUvColor = (value) => {
    const uvValue = parseFloat(value)
    if (Number.isNaN(uvValue)) {
      return "gray"
    }
    if (uvValue > 10) {
      return "purple"
    }
    if (uvValue >= 7){
      return "red"
    }
    if (uvValue >= 5){
      return "orange"
    }
    if (uvValue >= 2){
      return "yellow"
    }
    return "green"
  }

  const requestUV = async () => {
    const url = new URL("/api/uv", SERVER_ADDRESS)
    

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
      console.error("Invalid JSON received from UV endpoint", text)
      throw err
    }

    setUV(data.uv ?? data)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">UV Reading</h2>
      <div className="text-gray-300 mb-4">
        {uv !== undefined && uv !== null ? (
          <p className="text-gray-100 font-semibold mb-4" style={{color: getUvColor(uv)}}>Current UV Index: {uv}</p>
        ) : (
          <p className="text-gray-300 mb-4">
            No current UV value available—connect to the UV monitoring endpoint to load data.
          </p>
        )}
      </div>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        onClick={async () => {
          await requestUV();
        }}>
        Connect to API
      </button>
    </div>
  )
}

export default UVReading
