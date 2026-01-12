import { useState, useEffect } from "react"
import { useDevOverride } from "../context/DevOverrideContext"
import DevSlider from "../components/DevSlider"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL
const COLORS = {
  surface: "#050915",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  danger: "#ff4d67",
  label: "#8fb1d4",
}

function WaterQuality() {
  const [apiWaterQuality, setApiWaterQuality] = useState(null)
  
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.waterQuality
  const waterQuality = override.enabled ? override.value : apiWaterQuality

  useEffect(() => {
    requestWaterQuality()
  }, [])

  const getWaterQualityStatus = (value) => {
    if (value === null || value === undefined) {
      return {
        label: "Awaiting data",
        fill: "#5a6575",
        badge: "NO DATA",
        tone: "muted",
        subtext: "Sensor sync pending",
        reading: null,
      }
    }

    const parsedValue = Number(value)
    if (Number.isNaN(parsedValue)) {
      return {
        label: "Awaiting data",
        fill: "#5a6575",
        badge: "NO DATA",
        tone: "muted",
        subtext: "Sensor sync pending",
        reading: null,
      }
    }

    // 0-180: Good (safe)
    if (parsedValue <= 140) {
      return {
        label: "Super Clean",
        fill: COLORS.mint,
        badge: "SAFE",
        tone: "safe",
        subtext: "Crystal clear • green flag",
        reading: parsedValue,
      }
    }

    // 181-240: OK (caution)
    if (parsedValue <= 280) {
      return {
        label: "Advisory",
        fill: COLORS.yellow,
        badge: "CAUTION",
        tone: "caution",
        subtext: "Elevated levels • check signage",
        reading: parsedValue,
      }
    }

    // 241-250+: Bad (danger)
    return {
      label: "Don't Swim",
      fill: COLORS.danger,
      badge: "WARNING",
      tone: "danger",
      subtext: "High contaminants detected",
      reading: parsedValue,
    }
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

    setApiWaterQuality(data.safteyLevel ?? data)
  }

  const status = getWaterQualityStatus(waterQuality)
  const badgeColor =
    status.tone === "safe"
      ? COLORS.mint
      : status.tone === "caution"
        ? COLORS.yellow
        : status.tone === "danger"
          ? COLORS.danger
          : COLORS.label

  return (
    <div
      className="h-full rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: COLORS.label }}
        >
          Water Quality
        </p>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold border"
          style={{ borderColor: badgeColor, color: badgeColor }}
        >
          {status.badge}
        </span>
      </div>

      <div className="flex items-center gap-5 sm:gap-6">
        

        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl sm:text-4xl font-semibold leading-none"
              style={{ color: status.fill }}
            >
              {status.label}
            </span>
          </div>

          <p
            className="mt-2 text-sm sm:text-base"
            style={{
              color:
                status.tone === "danger"
                  ? "#ffe1e7"
                  : status.tone === "caution"
                    ? "#fff7d6"
                    : COLORS.label,
            }}
          >
            {status.subtext}
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#0d1a2f]">
            <div
              className="h-full transition-all"
              style={{
                width: status.reading !== null 
                  ? `${Math.max(0, (status.reading / 300) * 100)}%`
                  : "0%",
                backgroundColor: status.fill,
              }}
            />
          </div>
          {status.reading !== null && (
            <p className="mt-1 text-xs" style={{ color: COLORS.label }}>
              Reading: {status.reading} / 300 CFU/100mL
            </p>
          )}
        </div>
      </div>

      {/* Dev Override Slider */}
      <DevSlider
        enabled={override.enabled}
        onToggle={() => toggleOverride("waterQuality")}
        value={override.value}
        onChange={(val) => setValue("waterQuality", val)}
        min={0}
        max={300}
        step={5}
        unit=" (0-180 Safe, 181-280 Caution, 281+ Warning)"
        label="Water Quality"
      />
    </div>
  )
}

export default WaterQuality
