import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL

function WaterTemp() {

  const [WaterTemp, setWaterTemp] = useState(null);
  

  useEffect(() => {
    requestWaterTemp(); // Call the function when the component mounts
  }, []);


  const requestWaterTemp = async () => {
    const url = new URL("/api/waterTemp", SERVER_ADDRESS)

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
      console.error("Invalid JSON received from water temprature endpoint", text)
      throw err
    }

    setWaterTemp(data.temp ?? data)

  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">Water Temprature</h2>
      <div className="text-gray-300 mb-4">
        {WaterTemp !== undefined && WaterTemp !== null ? (
          <p className="text-gray-100 font-semibold mb-4">{WaterTemp}&deg; C</p>
        ) : (
          <p className="text-gray-300 mb-4">
            N/A
          </p>
        )}
      </div>

    </div>
  )
}

export default WaterTemp
