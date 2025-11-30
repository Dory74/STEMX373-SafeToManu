import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const rawServer = import.meta.env.VITE_API_URL || import.meta.env.API_URL
  const SERVER_ADDRESS = rawServer?.startsWith('http') ? rawServer : `http://${rawServer}`
  const [uv, setUV] = useState(null);
  const lat = "-37.68272674985233"
  const long = "176.17082423934843"
  
  const requestUV = async () => {
    const url = new URL("/uv", SERVER_ADDRESS)
    url.searchParams.set("lat", lat)
    url.searchParams.set("long", long)

    const response = await fetch(url, {
      method: "GET",
    })

    if (!response.ok){
      throw new Error("Network response was not ok")
    }

    const data = await response.json();
    setUV(data.uv ?? data)
    console.log(uv)
      
  }
  

  return (
    <>
     <div class="itemOuter">
      <div class="itemInner">
        <h1 class="itemTitle">Strand UV</h1>
        <div class="content">
          <p>Current UV level at the strand: {uv}</p>
        </div>
      </div>
     </div>

      <button
          onClick={async () => {
            setCount((count) => count + 1);
            await requestUV();
          }}
        >
          Update
        </button>
    </>
  )
}

export default App
