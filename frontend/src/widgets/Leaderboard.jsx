import { useState } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL


function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

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
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          <p className="text-gray-300 text-sm">
            Top clips and scores from the latest leaderboard API response.
          </p>
        </div>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm"
          onClick={fetchLeaderboard}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading..." : "Refresh"}
        </button>
      </div>

      {status === "error" && (
        <div className="text-red-300 text-sm mb-3">{error}</div>
      )}

      {hasData ? (
        <ul className="space-y-2">
          {entries.map((entry, idx) => (
            <li
              key={`${entry.video}-${idx}`}
              className="flex items-center justify-between bg-gray-900/60 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-indigo-300 font-semibold w-6 text-right">
                  {idx + 1}.
                </span>
                <div>
                  <div className="font-medium text-gray-100">
                    Score: {entry.score}
                  </div>
                  {entry.video && (
                    <div className="text-gray-400 text-xs">Video: {entry.video}</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300">
          {status === "loading"
            ? "Loading leaderboard..."
            : "No leaderboard entries yet. Refresh to load results."}
        </p>
      )}
    </div>
  )
}

export default Leaderboard
