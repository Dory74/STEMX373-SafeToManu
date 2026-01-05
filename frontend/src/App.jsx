import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import DevDashboard from './devDashboard.jsx';
import HomePage from './HomePage.jsx';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/dev" element={<DevDashboard />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

export default App