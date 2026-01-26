// Have used a bit ofd AI to help with this component, mainly for the SVG gauge generation and the logic around it.
import { useEffect, useState } from "react"
import { useDevOverride } from "../context/DevOverrideContext"
import DevSlider from "../components/DevSlider"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL
const GAUGE_CENTER_X = 80
const GAUGE_CENTER_Y = 80
const GAUGE_RADIUS = 65
const MAX_UV = 13
const COLORS = {
  surface: "#050915",
  border: "#0f1b2f",
  label: "#8fb1d4",
  mint: "#2fffe1",
  yellow: "#ffd447",
  danger: "#ff4d67",
}

function UVReading() {
  const [apiUv, setApiUv] = useState(null)
  const [pointerX, setPointerX] = useState(0)
  const [pointerY, setPointerY] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gaugeSize, setGaugeSize] = useState(75) // percentage size
  
  const { overrides, toggleOverride, setValue } = useDevOverride()
  const override = overrides.uv
  const uv = override.enabled ? override.value : apiUv

  useEffect(() => {
    requestUV()
  }, [])

  useEffect(() => {
    calculatePosition()
  }, [uv])

  const calculatePosition = () => {
    const clampedUv = Math.max(0, Math.min(uv ?? 0, MAX_UV))
    const angleDegrees = 180 - (clampedUv / MAX_UV) * 180
    const angleRadians = (angleDegrees * Math.PI) / 180

    const x = GAUGE_CENTER_X + GAUGE_RADIUS * Math.cos(angleRadians)
    const y = GAUGE_CENTER_Y - GAUGE_RADIUS * Math.sin(angleRadians)

    setPointerX(x)
    setPointerY(y)
  }

  const requestUV = async () => {
    setLoading(true)
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

    const uvValue = typeof data === "number" ? data : data?.uv
    const parsedUv = uvValue == null ? null : Number(uvValue)
    setApiUv(Number.isFinite(parsedUv) ? parsedUv : null)
    setLoading(false)
  }

  // Status messages depending on the uv index value
  const uvStatus = (() => {
    if (uv == null) {
      return { label: "Syncing", color: COLORS.label, message: "Fetching UV data..." }
    }
    if (uv <= 1) {
      return { label: "Low", color: COLORS.mint, message: "No sun protection needed • enjoy your swim!" }
    }
    if (uv <= 2) {
      return { label: "Low", color: COLORS.mint, message: "Minimal risk • sunglasses optional" }
    }
    if (uv <= 4) {
      return { label: "Moderate", color: COLORS.yellow, message: "Sunscreen recommended for extended swims" }
    }
    if (uv <= 5) {
      return { label: "Moderate", color: COLORS.yellow, message: "Apply SPF 30+ • reapply after swimming" }
    }
    if (uv <= 7) {
      return { label: "High", color: "#FF8300", message: "Cover up between swims • seek shade" }
    }
    if (uv <= 9) {
      return { label: "Very High", color: COLORS.danger, message: "Limit midday exposure • rashie essential" }
    }
    if (uv <= 11) {
      return { label: "Extreme", color: COLORS.danger, message: "Stay shaded • SPF 50+ and hat required" }
    }
    return { label: "Extreme", color: COLORS.danger, message: "Avoid sun exposure • burn risk in minutes" }
  })()

  return (
    <div
      className="h-full rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      {/* Header row with small UV number */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p
            className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase"
            style={{ color: COLORS.label }}
          >
            UV Index
          </p>
          <span
            className="text-lg font-bold"
            style={{ color: uvStatus.color }}
          >
            {uv ?? (loading ? "…" : "--")}
          </span>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold border"
          style={{ borderColor: uvStatus.color, color: uvStatus.color }}
        >
          {uvStatus.label}
        </span>
      </div>

      {/* Primary: Large prominent gauge */}
      <div
        className="rounded-2xl border bg-[#0b1529] mb-4 flex justify-center"
        style={{ borderColor: COLORS.border }}
      >
        <svg 
          viewBox="5 8 150 82" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          style={{ width: `${gaugeSize}%`, maxWidth: '100%' }}
        >
          <g>
            {/* Low: 0-2 - Mint */}
            <path d="M 80,85 L 10,85 A 75,75 0 0,1 22,45 Z" fill={COLORS.mint} />
            {/* Moderate: 3-5 - Yellow */}
            <path d="M 80,85 L 22,45 A 75,75 0 0,1 55,12 Z" fill={COLORS.yellow} />
            {/* High: 6-7 - Orange */}
            <path d="M 80,85 L 55,12 A 75,75 0 0,1 105,12 Z" fill="#FF8300" />
            {/* Very High: 8-10 - Red */}
            <path d="M 80,85 L 105,12 A 75,75 0 0,1 138,45 Z" fill={COLORS.danger} />
            {/* Extreme: 11-13 - Purple */}
            <path d="M 80,85 L 138,45 A 75,75 0 0,1 150,85 Z" fill="#8B00FF" />
            
            {/* Pointer needle */}
            <line
              x1="80"
              y1="85"
              x2={80 + 65 * Math.cos(Math.PI - (Math.min(uv ?? 0, MAX_UV) / MAX_UV) * Math.PI)}
              y2={85 - 65 * Math.sin(Math.PI - (Math.min(uv ?? 0, MAX_UV) / MAX_UV) * Math.PI)}
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx="80" cy="85" r="8" fill="#1a1a1a" stroke="#000000" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Secondary: Message banner */}
      <div
        className="rounded-xl px-4 py-3"
        style={{
          backgroundColor: `${uvStatus.color}15`,
          borderLeft: `4px solid ${uvStatus.color}`,
        }}
      >
        <p
          className="text-lg sm:text-xl font-medium leading-snug"
          style={{ color: uvStatus.color }}
        >
          {uvStatus.message}
        </p>
      </div>

      {/* Dev Override Slider */}
      <DevSlider
        enabled={override.enabled}
        onToggle={() => toggleOverride("uv")}
        value={override.value}
        onChange={(val) => setValue("uv", val)}
        min={0}
        max={13}
        step={0.5}
        unit=""
        label="UV Index"
      />

      {/* Gauge Size Slider
      <div
        className="mt-2 rounded-xl border overflow-hidden"
        style={{ borderColor: COLORS.border, backgroundColor: "#0a1020" }}
      >
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COLORS.label }}>
              🎚️ Gauge Size
            </span>
            <span className="text-xs" style={{ color: COLORS.label }}>
              {gaugeSize}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={gaugeSize}
            onChange={(e) => setGaugeSize(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${COLORS.mint} 0%, ${COLORS.mint} ${((gaugeSize - 50) / 50) * 100}%, #1a2744 ${((gaugeSize - 50) / 50) * 100}%, #1a2744 100%)`,
            }}
          />
        </div>
      </div> */}
    </div>
  )
}

export default UVReading
