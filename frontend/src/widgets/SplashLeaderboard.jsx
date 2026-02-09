import { useState, useEffect } from "react"
// !!!!!!!!!! Depreciated Hasn't been updated to match changes in backend, use at your own risk. !!!!!!!!! //

const SERVER_ADDRESS = import.meta.env.VITE_API_URL

// theme colors for the leaderboard widget
const COLORS = {
  surface: "#050915",   // main background
  border: "#0f1b2f",    // border color
  mint: "#2fffe1",      // accent for 2nd place / buttons
  yellow: "#ffd447",    // accent for 1st place
  label: "#8fb1d4",     // text labels
  rowBg: "#0b1529",     // row background
}

function Leaderboard() {
  const [entries, setEntries] = useState([])    // raw leaderboard data from API
  const [status, setStatus] = useState("idle")  // idle | loading | loaded | error
  const [error, setError] = useState("")        // error message to display
  const [data, setData] = useState([])          // formatted top 3 entries for display

  // fetch leaderboard on component mount
  useEffect(() => {
        fetchLeaderboard(); 
    }, []);

    // format top 3 entries when data is loaded
    useEffect(() => {
        if (status !== "loaded" || entries.length === 0) {
            setData([]);
            return;
        }
        // map top 3 entries with display properties (rank, color, badge)
        const data = [
            { rank: 1, name: "Bob", score: entries[0].score, color: COLORS.yellow, height: "h-64", badge: "🏆" },
            { rank: 2, name: "Alice", score: entries[1].score, color: COLORS.mint, height: "h-48", badge: "🥈" },
            { rank: 3, name: "Charlie", score: entries[2].score, color: COLORS.min, height: "h-32", badge: "🥉" },
        ];
        setData(data);
    }, [status]);



  // fetch leaderboard data from backend API
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
      // filter valid entries and sort by score descending
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



    const hasData = entries.length > 0  // check if we have any entries to display

  return (
    // main container with themed background
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

      {/* Leaderboard list - renders top 3 entries */}
      {hasData ? (
        <div className="space-y-2">
          {data.map((entry, idx) => {
            // extract display values from entry
            const rank = entry.rank
            const displayName = entry?.user || entry?.name || `Rider ${rank}`
            const score = entry?.score ?? "--"
            const color = entry.color     // rank-specific accent color
            const badge = entry.badge     // rank emoji (trophy, medal)

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

    </div>
  )
}

export default Leaderboard
