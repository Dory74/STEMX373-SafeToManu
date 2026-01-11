import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 

function TideHeight() {

  const [tideHeight, setTideHeight] = useState(null);
  

  useEffect(() => {
    requestTideHeight(); // Call the function when the component mounts
  }, []);


  const requestTideHeight = async () => {
    const url = new URL("/api/tideHeight", SERVER_ADDRESS)

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
      console.error("Invalid JSON received from tide height endpoint", text)
      throw err
    }

    setTideHeight(data.height ?? data)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">Tide Height</h2>
      <div className="text-gray-300 mb-4">
        {tideHeight !== undefined && tideHeight !== null ? (
          <p className="text-gray-100 font-semibold mb-4">Current tide height: {tideHeight}m</p>
        ) : (
          <p className="text-gray-300 mb-4">
            N/A
          </p>
        )}
      </div>
      
    </div>
  )
}

export default TideHeight
