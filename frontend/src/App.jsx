import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const rawServer = import.meta.env.VITE_API_URL || import.meta.env.API_URL
  const SERVER_ADDRESS = rawServer?.startsWith('http') ? rawServer : `http://${rawServer}`
  const [uv, setUV] = useState(null);
  
  const requestUV = async () => {
    const response = await fetch(new URL("/", SERVER_ADDRESS), {
      method: "GET",
    })

    if (!response.ok){
      throw new Error("Network response was not ok")
    }

    const data = await response.json();
    setUV(data.message ?? data)
    console.log(data.message)
      
  }
  

  return (
    <>
      <div>
    
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 class="text-3xl font-bold underline">Vite + React</h1>
      <div className="card">
        <button
          onClick={async () => {
            setCount((count) => count + 1);
            await requestUV();
            console.log(import.meta.env.VITE_API_URL + "hello");
          }}
        >
          {import.meta.env.VITE_API_URL} Hello is {count}
        </button>

        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
