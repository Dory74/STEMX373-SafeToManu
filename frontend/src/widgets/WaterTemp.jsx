import { useState, useEffect } from "react"
import { useDevOverride } from "../context/DevOverrideContext"
import DevSlider from "../components/DevSlider"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL
const COLORS = {
  surface: "#060b17",
  border: "#0f1b2f",
  label: "#8fb1d4",
  mint: "#2fffe1",
}
const TEMP_RANGE = { min: 0, max: 35 }

function WaterTemp() {
  const [apiWaterTemp, setApiWaterTemp] = useState(null)
  
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.waterTemp
  const waterTemp = override.enabled ? override.value : apiWaterTemp

  useEffect(() => {
    requestWaterTemp()
  }, [])

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
      console.error("Invalid JSON received from water temperature endpoint", text)
      throw err
    }

    setApiWaterTemp(data.temp ?? data)
  }

  const hasValue = waterTemp !== undefined && waterTemp !== null
  const numericTemp = hasValue ? Number(waterTemp) : null
  const clampedTemp =
    numericTemp === null || Number.isNaN(numericTemp)
      ? null
      : Math.min(Math.max(numericTemp, TEMP_RANGE.min), TEMP_RANGE.max)
  const fillPercent =
    clampedTemp === null
      ? 28
      : ((clampedTemp - TEMP_RANGE.min) /
          (TEMP_RANGE.max - TEMP_RANGE.min)) *
        100

  return (
    <div
      className="h-full rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p
          className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: COLORS.label }}
        >
          Water Temp
        </p>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold border"
          style={{ borderColor: COLORS.border, color: COLORS.label }}
        >
          Live
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl sm:text-6xl font-semibold leading-none text-white">
          {hasValue ? waterTemp : "--"}
        </span>
        <span
          className="text-lg sm:text-xl font-semibold leading-none"
          style={{ color: COLORS.label }}
        >
          °C
        </span>
      </div>
      <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.label }}>
        Surface reading • calm dock zone
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#0d1a2f]">
        <div
          className="h-full"
          style={{
            width: `${fillPercent}%`,
            backgroundColor: COLORS.mint,
          }}
        />
      </div>

      {/* Dev Override Slider */}
      <DevSlider
        enabled={override.enabled}
        onToggle={() => toggleOverride("waterTemp")}
        value={override.value}
        onChange={(val) => setValue("waterTemp", val)}
        min={0}
        max={35}
        step={0.5}
        unit="°C"
        label="Water Temp"
      />
    </div>
  )
}

export default WaterTemp
