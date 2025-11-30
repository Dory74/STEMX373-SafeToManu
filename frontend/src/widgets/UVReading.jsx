import { useState } from "react"
const rawServer = import.meta.env.VITE_API_URL || import.meta.env.API_URL
const SERVER_ADDRESS = rawServer?.startsWith('http') ? rawServer : `http://${rawServer}`

const lat = "-37.68272674985233"
const long = "176.17082423934843"

function UVReading() {

  const [uv, setUV] = useState(null);

  const requestUV = async () => {
    const url = new URL("/uv", SERVER_ADDRESS)
    url.searchParams.set("lat", lat)
    url.searchParams.set("long", long)

    const response = await fetch(url, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const data = await response.json();
    setUV(data.uv ?? data)
    console.log(uv)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">
      
      <h2 className="text-xl font-semibold mb-2">UV Reading</h2>
      <p className="text-gray-300 mb-4">
        {uv !== undefined && uv !== null ? (
        <p className="text-gray-100 font-semibold mb-4">Current UV Index: {uv}</p>
      ) : (
        <p className="text-gray-300 mb-4">
          No current UV value available—connect to the UV monitoring endpoint to load data.
        </p>
      )}
      </p>
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
