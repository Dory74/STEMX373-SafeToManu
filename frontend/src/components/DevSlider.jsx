import { useState } from "react"
import { useDevOverride } from "../context/DevOverrideContext"

const COLORS = {
  surface: "#050915",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  label: "#8fb1d4",
  danger: "#ff4d67",
}

/**
 * DevSlider - A toggleable slider control for overriding API values
 * @param {boolean} enabled - Whether the override is active
 * @param {function} onToggle - Callback when toggle is clicked
 * @param {number} value - Current slider value
 * @param {function} onChange - Callback when slider value changes
 * @param {number} min - Minimum slider value
 * @param {number} max - Maximum slider value
 * @param {number} step - Slider step increment
 * @param {string} unit - Unit label (e.g., "m", "°C", "kn")
 * @param {string} label - Label for the control
 */
function DevSlider({
  enabled,
  onToggle,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  label = "Override",
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { showDevSliders } = useDevOverride()

  // Don't render if dev sliders are hidden
  if (!showDevSliders) {
    return null
  }

  return (
    <div
      className="mt-3 rounded-xl border overflow-hidden transition-all"
      style={{
        borderColor: enabled ? COLORS.yellow : COLORS.border,
        backgroundColor: "#0a1020",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#0f1b2f] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: enabled ? COLORS.yellow : COLORS.label }}
          >
            🔧 Dev {label}
          </span>
          {enabled && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ backgroundColor: COLORS.yellow, color: "#0b0b0b" }}
            >
              Override Active
            </span>
          )}
        </div>
        <span style={{ color: COLORS.label }}>{isExpanded ? "▲" : "▼"}</span>
      </button>

      {/* Expandable controls */}
      {isExpanded && (
        <div className="px-3 py-3 border-t" style={{ borderColor: COLORS.border }}>
          {/* Enable toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: COLORS.label }}>
              Use manual value
            </span>
            <button
              onClick={onToggle}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: enabled ? COLORS.mint : "#1a2744",
              }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{
                  left: enabled ? "calc(100% - 20px)" : "4px",
                }}
              />
            </button>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: COLORS.label }}>
                Value: {value}{unit}
              </span>
              <span className="text-[10px]" style={{ color: COLORS.label }}>
                {min}{unit} — {max}{unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={!enabled}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: enabled
                  ? `linear-gradient(to right, ${COLORS.mint} 0%, ${COLORS.mint} ${((value - min) / (max - min)) * 100}%, #1a2744 ${((value - min) / (max - min)) * 100}%, #1a2744 100%)`
                  : "#1a2744",
                opacity: enabled ? 1 : 0.5,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DevSlider
