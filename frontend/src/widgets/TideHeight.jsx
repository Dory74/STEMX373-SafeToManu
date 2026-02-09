import { useState, useEffect } from "react"
import { useDevOverride } from "../context/DevOverrideContext"
import DevSlider from "../components/DevSlider"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL

// theme colors for the widget
const COLORS = {
  surface: "#050915",   // main background
  border: "#0f1b2f",    // border color
  mint: "#2fffe1",      // safe state color
  yellow: "#ffd447",    // warning state color
  label: "#8fb1d4",     // text labels
}

const SAFE_THRESHOLD = 4.2  // minimum safe tide height in meters
const MAX_TIDE = 6.5        // max tide for gauge scaling

function TideHeight() {
  const [apiTideHeight, setApiTideHeight] = useState(null)  // tide height from API
  
  // dev override context - allows manual override of tide value for testing
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.tideHeight
  const tideHeight = override.enabled ? override.value : apiTideHeight  // use override if enabled

  // fetch tide height on component mount
  useEffect(() => {
    requestTideHeight()
  }, [])

  // fetch current tide height from backend API
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

    setApiTideHeight(data.height ?? data)  // handle both {height: x} and raw number
  }

  // derived values for gauge display
  const hasValue = tideHeight !== undefined && tideHeight !== null
  const numericHeight = hasValue ? Number(tideHeight) : null
  const clampedHeight =                                          // clamp to valid range
    numericHeight === null || Number.isNaN(numericHeight)
      ? null
      : Math.min(Math.max(numericHeight, 0), MAX_TIDE)
  const fillPercent =                                            // gauge fill percentage
    clampedHeight === null ? 0 : (clampedHeight / MAX_TIDE) * 100
  const safeLinePercent = Math.min((SAFE_THRESHOLD / MAX_TIDE) * 100, 100)  // safe line position
  const isAboveSafe = numericHeight !== null && numericHeight >= SAFE_THRESHOLD
  const fillColor = isAboveSafe ? COLORS.mint : COLORS.yellow    // green if safe, yellow if not

  return (
    // main container with themed background
    <div
      className="h-full rounded-2xl border px-5 py-4 sm:px-7 sm:py-6"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      {/* Title/header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <p
          className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: COLORS.label }}
        >
          Tide Height
        </p>
        {/* top safe indicator */}
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold border"
          style={{
            borderColor: isAboveSafe ? COLORS.mint : COLORS.yellow,
            color: isAboveSafe ? COLORS.mint : COLORS.yellow,
          }}
        >
          Safe {SAFE_THRESHOLD}m
        </span>
      </div>

      {/* Main body - gauge and value display */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-8">
        <div className="flex items-end gap-4">
          {/* Vertical gauge container */}
          <div
            className="relative w-14 sm:w-16 h-52 sm:h-64 rounded-xl border overflow-hidden"
            style={{ borderColor: COLORS.border, backgroundColor: "#0b1529" }}
          >

            {/* filled portion - height based on current tide */}
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{
                height: `${fillPercent}%`,
                backgroundColor: fillColor,
              }}
            />

            {/* safe threshold line marker */}
            <div
              className="absolute left-0 w-full border-t-4"
              style={{
                top: `${100 - safeLinePercent}%`,  // position from top
                borderColor: COLORS.border,
              }}
            >
              {/* line and label */}
              <div
                className="absolute right-1 -top-3 text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{
                  backgroundColor: COLORS.surface,
                  color: COLORS.label,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {SAFE_THRESHOLD}m
              </div>
            </div>
          </div>

          {/* Value display section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              {/* Large tide height value */}
              <span className="text-5xl sm:text-6xl font-semibold leading-none text-white">
                {hasValue ? tideHeight : "--"}
              </span>

              {/* Unit label */}
              <span
                className="text-lg sm:text-xl font-semibold leading-none"
                style={{ color: COLORS.label }}
              >
                m
              </span>
            </div>
            {/* Safety status message */}
            <p
              className="text-sm sm:text-base font-semibold uppercase tracking-[0.15em]"
              style={{ color: isAboveSafe ? COLORS.mint : COLORS.yellow }}
            >
              {isAboveSafe ? "Safe depth for manu" : "Below safe crest"}
            </p>

            {/* Helper text */}
            <p className="text-sm sm:text-base" style={{ color: COLORS.label }}>
              Vertical gauge shows live fill vs. safe line.
            </p>
          </div>
        </div>
      </div>

      {/* Dev Override Slider */}
      <DevSlider
        enabled={override.enabled}
        onToggle={() => toggleOverride("tideHeight")}
        value={override.value}
        onChange={(val) => setValue("tideHeight", val)}
        min={0}
        max={6.5}
        step={0.2}
        unit="m"
        label="Tide Height"
      />
    </div>
  )
}

export default TideHeight
