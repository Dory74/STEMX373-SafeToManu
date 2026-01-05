import { useEffect, useState } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL 
function InstantReplay() {
  const [videoUrl, setVideoUrl] = useState("")
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  const fetchLatestVideo = async () => {
    setStatus("loading")
    setError("")
    try {
      const url = new URL("/api/latestVideo", SERVER_ADDRESS)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "No replay available yet."
            : `Request failed with status ${response.status}`
        )
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setVideoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return objectUrl
      })
      setStatus("loaded")
    } catch (err) {
      setStatus("error")
      setError(err?.message || "Unable to load instant replay")
    }
  }

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-md">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Instant Replay</h2>
          <p className="text-gray-300 text-sm">
            Fetch and watch the most recent manu clip.
          </p>
        </div>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-700/50 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm"
          onClick={fetchLatestVideo}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading..." : "Refresh"}
        </button>
      </div>

      {status === "error" && (
        <div className="text-red-300 text-sm mb-3">{error}</div>
      )}

      {videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          controls
          autoPlay
          className="w-full rounded-lg bg-black"
          
        />
      ) : (
        <p className="text-gray-300">
          {status === "loading"
            ? "Fetching the latest replay..."
            : "No replay loaded. Refresh to fetch the newest clip."}
        </p>
      )}
    </div>
  )
}

export default InstantReplay
