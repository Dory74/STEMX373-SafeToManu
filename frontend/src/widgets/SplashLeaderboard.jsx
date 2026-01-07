import { useState, useEffect, use } from "react"

const SERVER_ADDRESS = import.meta.env.VITE_API_URL


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
            { rank: 2, name: "Alice", score: entries[1].score, color: "bg-gray-300", height: "h-48" },
            { rank: 1, name: "Bob", score: entries[0].score, color: "bg-yellow-400", height: "h-64" },
            { rank: 3, name: "Charlie", score: entries[2].score, color: "bg-orange-400", height: "h-32" },
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
        <div className="bg-gray-800 text-gray-100 p-3 rounded-xl shadow-md">
            <div className="flex items-start justify-between gap-4 mb-3">

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
                <div className="flex items-end justify-center gap-4 h-80 p-4">
                    {data.map((user) => (
                        <div
                            key={user.rank}
                            className={`flex flex-col items-center justify-between p-4 w-16 rounded-t-lg ${user.color} ${user.height}`}
                        >
                            {/* Top: Medal/Ribbon Icon */}
                            <span className="text-4xl">
                                {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                            </span>

                            {/* Bottom: Name and Value */}
                            <div className="text-center font-bold">
                                {/* <div className="uppercase text-sm">{user.name}</div> */}
                                <div className="text-2xl">{user.score}</div>
                            </div>
                        </div>
                    ))}
                </div>
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
