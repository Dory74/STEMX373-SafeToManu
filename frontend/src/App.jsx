import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import DevDashboard from './devDashboard.jsx';
import HomePage from './HomePage.jsx';
import Manu from './Manu.jsx';
import { DevOverrideProvider } from './context/DevOverrideContext.jsx';
import { WarningLevelProvider } from './context/WarningLevelContext.jsx';


function App() {

  return (
    <DevOverrideProvider>
      <WarningLevelProvider>
        <Router>
          <Routes>
            <Route path="/dev" element={<DevDashboard />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/manu" element={<Manu />} />

          </Routes>
        </Router>
      </WarningLevelProvider>
    </DevOverrideProvider>
  )
}

export default App