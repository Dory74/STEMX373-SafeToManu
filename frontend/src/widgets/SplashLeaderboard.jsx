import { useState, useEffect } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL
const COLORS = {
  surface: "#050915",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  label: "#8fb1d4",
  rowBg: "#0b1529",
}

function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")
    const [data, setData] = useState([])

  useEffect(() => {
        fetchLeaderboard(); 
    }, []);

    useEffect(() => {
        if (status !== "loaded" || entries.length === 0) {
            setData([]);
            return;
        }
        const data = [
            { rank: 1, name: "Bob", score: entries[0].score, color: COLORS.yellow, height: "h-64", badge: "🏆" },
            { rank: 2, name: "Alice", score: entries[1].score, color: COLORS.mint, height: "h-48", badge: "🥈" },
            { rank: 3, name: "Charlie", score: entries[2].score, color: COLORS.min, height: "h-32", badge: "🥉" },
        ];
        setData(data);
    }, [status]);



  const fetchLeaderboard = async () => {
    setStatus("loading")
    setError("")
    try {
      const url = new URL("/api/leaderboard", SERVER_ADDRESS)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()
      const normalized = Array.isArray(data)
        ? data
            .filter((item) => typeof item.score === "number")
            .sort((a, b) => b.score - a.score)
        : []
      setEntries(normalized)
      setStatus("loaded")
    } catch (err) {
      setStatus("error")
      setError(err?.message || "Unable to load leaderboard")
    }
  }



    const hasData = entries.length > 0

  return (
    <div
      className="h-full rounded-2xl border px-5 py-4 sm:px-6 sm:py-5"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p
          className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: COLORS.label }}
        >
          Splash Leaderboard
        </p>
        {/* refresh button */}
        <button
          className="rounded-full px-3 py-1 text-[11px] font-semibold border transition-colors hover:bg-[#0f1b2f]"
          style={{ borderColor: COLORS.mint, color: COLORS.mint }}
          onClick={fetchLeaderboard}
          disabled={status === "loading"}
        >
          {status === "loading" ? "..." : "Refresh"}
        </button>
      </div>

      {/* Top scorer highlight */}
      {hasData && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className="text-5xl sm:text-6xl font-semibold leading-none"
              style={{ color: COLORS.yellow }}
            >
              {data[0]?.score ?? "--"}
            </span>
            <span
              className="text-lg sm:text-xl font-semibold leading-none"
              style={{ color: COLORS.label }}
            >
              pts
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.label }}>
            {data[0]?.user || data[0]?.name || "Top Scorer"} • Current Leader
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}

      {/* Leaderboard list */}
      {hasData ? (
        <div className="space-y-2">
          {data.map((entry, idx) => {
            const rank = entry.rank
            const displayName = entry?.user || entry?.name || `Rider ${rank}`
            const score = entry?.score ?? "--"
            const color = entry.color
            const badge = entry.badge

            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl px-4 py-3 border"
                style={{
                  backgroundColor: rank === 1 ? "#0d1a2f" : COLORS.rowBg,
                  borderColor: rank === 1 ? COLORS.yellow : COLORS.border,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg font-bold w-6 text-center"
                    style={{ color }}
                  >
                    {badge || rank}
                  </span>
                  <span
                    className="text-sm sm:text-base font-medium truncate max-w-[120px] sm:max-w-[180px]"
                    style={{ color: rank === 1 ? "#ffffff" : COLORS.label }}
                  >
                    {displayName}
                  </span>
                </div>
                <span
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color }}
                >
                  {score}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm" style={{ color: COLORS.label }}>
          {status === "loading"
            ? "Loading leaderboard..."
            : "No entries yet. Refresh to load results."}
        </p>
      )}

      {/* Progress bar decoration */}
      {/* {hasData && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#0d1a2f]">
          <div
            className="h-full"
            style={{
              width: `${Math.min((data[0]?.score / 100) * 100, 100)}%`,
              backgroundColor: COLORS.yellow,
            }}
          />
        </div>
      )} */}
    </div>
  )
}

export default Leaderboard
