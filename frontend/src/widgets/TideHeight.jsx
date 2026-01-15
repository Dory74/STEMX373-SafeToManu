import { useState, useEffect } from "react"
import { useDevOverride } from "../context/DevOverrideContext"
import DevSlider from "../components/DevSlider"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL
const COLORS = {
  surface: "#050915",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  label: "#8fb1d4",
}
const SAFE_THRESHOLD = 4.2
const MAX_TIDE = 6.5

function TideHeight() {
  const [apiTideHeight, setApiTideHeight] = useState(null)
  
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.tideHeight
  const tideHeight = override.enabled ? override.value : apiTideHeight

  useEffect(() => {
    requestTideHeight()
  }, [])

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

    setApiTideHeight(data.height ?? data)
  }

  const hasValue = tideHeight !== undefined && tideHeight !== null
  const numericHeight = hasValue ? Number(tideHeight) : null
  const clampedHeight =
    numericHeight === null || Number.isNaN(numericHeight)
      ? null
      : Math.min(Math.max(numericHeight, 0), MAX_TIDE)
  const fillPercent =
    clampedHeight === null ? 0 : (clampedHeight / MAX_TIDE) * 100
  const safeLinePercent = Math.min((SAFE_THRESHOLD / MAX_TIDE) * 100, 100)
  const isAboveSafe = numericHeight !== null && numericHeight >= SAFE_THRESHOLD
  const fillColor = isAboveSafe ? COLORS.mint : COLORS.yellow

  return (
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

      {/* Main body */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-8">
        <div className="flex items-end gap-4">
          {/* Gauge */}
          <div
            className="relative w-14 sm:w-16 h-52 sm:h-64 rounded-xl border overflow-hidden"
            style={{ borderColor: COLORS.border, backgroundColor: "#0b1529" }}
          >

            {/* filled in div */}
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{
                height: `${fillPercent}%`,
                backgroundColor: fillColor,
              }}
            />

            <div
              className="absolute left-0 w-full border-t-4"
              style={{
                top: `${100 - safeLinePercent}%`,
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

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              {/* Large height vaalue */}
              <span className="text-5xl sm:text-6xl font-semibold leading-none text-white">
                {hasValue ? tideHeight : "--"}
              </span>

              {/* small m */}
              <span
                className="text-lg sm:text-xl font-semibold leading-none"
                style={{ color: COLORS.label }}
              >
                m
              </span>
            </div>
            {/* Warning message */}
            <p
              className="text-sm sm:text-base font-semibold uppercase tracking-[0.15em]"
              style={{ color: isAboveSafe ? COLORS.mint : COLORS.yellow }}
            >
              {isAboveSafe ? "Safe depth for manu" : "Below safe crest"}
            </p>

            {/* context text */}
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
