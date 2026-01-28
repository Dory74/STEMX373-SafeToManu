import { useEffect, useState } from "react"
// !!!!!!!!!! Depreciated Hasn't been updated to match changes in backend, use at your own risk. !!!!!!!!! //
const SERVER_ADDRESS = import.meta.env.VITE_API_URL

// theme colors for the widget
const COLORS = {
  midnight: "#030712",
  border: "#0f1b2f",
  mint: "#2fffe1",
  yellow: "#ffd447",
  cyan: "#67fff0",
}

function InstantReplay() {
  const [videoUrl, setVideoUrl] = useState("")   // blob URL for the video
  const [status, setStatus] = useState("idle")   // idle | loading | loaded | error
  const [error, setError] = useState("")         // error message to display

  // cleanup blob URL when component unmounts or videoUrl changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  // fetch the latest replay video from the backend
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
      const blob = await response.blob()              // get video as blob
      const objectUrl = URL.createObjectURL(blob)     // create local URL for video element
      setVideoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)           // revoke old URL to free memory
        return objectUrl
      })
      setStatus("loaded")
    } catch (err) {
      setStatus("error")
      setError(err?.message || "Unable to load instant replay")
    }
  }

  return (
    // main container with gradient background
    <div
      className="relative h-full rounded-3xl p-4 sm:p-5 text-white"
      style={{
        // top left to bottom right gradient
        background: `linear-gradient(145deg, #061225, ${COLORS.midnight})`,
        borderColor: COLORS.border,
        boxShadow: `0 0 0 6px ${COLORS.midnight}, 0 0 0 10px ${COLORS.border}`,
      }}
    >
      
      {/* header section with title and refresh button */}
      <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
        <div>
          {/* title */}
          <h2 className="text-2xl sm:text-3xl font-black hero-condensed tracking-tight">
            Instant Replay Stage
          </h2>
          {/* subtitle */}
          <p className="text-sm sm:text-base text-[#a6bad8]">
            Watch the freshest manu.
          </p>
        </div>
        {/* refresh button */}
        <button
          className="rounded-full border-[3px] px-4 py-2 text-sm sm:text-base font-black uppercase tracking-[0.15em] transition-colors"
          style={{
            backgroundColor: COLORS.mint,
            color: "#062020",
            borderColor: "#0b0b0b",
            boxShadow: "6px 6px 0 #0b0b0b",
          }}
          onClick={fetchLatestVideo}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* error message display */}
      {status === "error" && (
        <div className="text-red-300 text-sm mb-3">{error}</div>
      )}

      {/* video container with glowing border */}
      <div
        className="relative w-full rounded-2xl border-4 overflow-hidden"
        style={{
          borderColor: COLORS.cyan,
          boxShadow: `0 0 0 6px rgba(103,255,240,0.18), inset 0 0 32px rgba(103,255,240,0.25)`,
          backgroundColor: "#000814",
        }}
      >
        {/* show video player if loaded, otherwise show placeholder */}
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full"
            style={{ accentColor: COLORS.mint }}
          />
        ) : (
          <div className="p-6 sm:p-8 text-center text-[#9db3d1] font-semibold">
            {status === "loading"
              ? "Fetching the latest replay..."
              : "No replay loaded. Refresh to fetch the newest clip."}
          </div>
        )}
      </div>
    </div>
  )
}

export default InstantReplay
