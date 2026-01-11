import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 

function WaterQuality() {

  const [waterQuality, setWaterQuality] = useState(null);


  useEffect(() => {
    requestWaterQuality(); // Call the function when the component mounts
  }, []);

  const getWaterQualityStatus = (value) => {
    const waterQualityValue = parseFloat(value)
    if (Number.isNaN(waterQualityValue)) {
      return { color: "gray", label: "N/A" }
    }
    if (waterQualityValue === 1) {
      return { color: "green", label: "Super Clean" }
    }
    if (waterQualityValue === 2) {
      return { color: "yellow", label: "Dirty" }
    }
    return { color: "red", label: "Don't swim" }
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

  const waterQualityStatus =
    waterQuality !== undefined && waterQuality !== null
      ? getWaterQualityStatus(waterQuality)
      : null

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">

      <h2 className="text-xl font-semibold mb-2">Water Quality</h2>
      <div className="text-gray-300 mb-4">
        {waterQualityStatus ? (
          <p
            className="text-gray-100 font-semibold mb-4"
            style={{ color: waterQualityStatus.color }}
          >
            {waterQualityStatus.label}
          </p>
        ) : (
          <p className="text-gray-300 mb-4">
            N/A
          </p>
        )}
      </div>

    </div>
  )
}

export default WaterQuality
