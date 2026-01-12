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
const WIND_RANGE = { min: 0, max: 40 }

function WindSpeed() {
  const [apiWindSpeed, setApiWindSpeed] = useState(null)
  
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.windSpeed
  const windSpeed = override.enabled ? override.value : apiWindSpeed

  useEffect(() => {
    requestWindSpeed()
  }, [])

  const requestWindSpeed = async () => {
    const url = new URL("/api/windSpeed", SERVER_ADDRESS)

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

    setApiWindSpeed(data.speed ?? data)
  }

  const hasValue = windSpeed !== undefined && windSpeed !== null
  const numericWind = hasValue ? Number(windSpeed) : null
  const clampedWind =
    numericWind === null || Number.isNaN(numericWind)
      ? null
      : Math.min(Math.max(numericWind, WIND_RANGE.min), WIND_RANGE.max)
  const fillPercent =
    clampedWind === null
      ? 25
      : ((clampedWind - WIND_RANGE.min) /
          (WIND_RANGE.max - WIND_RANGE.min)) *
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
          Wind
        </p>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-semibold border"
          style={{ borderColor: COLORS.border, color: COLORS.label }}
        >
          Breeze
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl sm:text-6xl font-semibold leading-none text-white">
          {hasValue ? windSpeed : "--"}
        </span>
        <span
          className="text-lg sm:text-xl font-semibold leading-none"
          style={{ color: COLORS.label }}
        >
          kn
        </span>
      </div>

      <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.label }}>
        Offshore gusts • safe casting
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
        onToggle={() => toggleOverride("windSpeed")}
        value={override.value}
        onChange={(val) => setValue("windSpeed", val)}
        min={0}
        max={40}
        step={1}
        unit=" kn"
        label="Wind Speed"
      />
    </div>
  )
}

export default WindSpeed
