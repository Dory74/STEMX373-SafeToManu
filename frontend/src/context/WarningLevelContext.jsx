import { createContext, useContext, useState, useEffect } from 'react';
import { useDevOverride } from './DevOverrideContext.jsx';

const WarningLevelContext = createContext();

const SERVER_ADDRESS = import.meta.env.VITE_API_URL;

export function WarningLevelProvider({ children }) {
  const [warningData, setWarningData] = useState({ level: 1, message: null });
  const { overrides } = useDevOverride();
  
  // Check if water quality override is enabled for dev testing
  const waterQualityOverride = overrides.waterQuality;

  useEffect(() => {
    fetchWarningLevel();
  }, []);

  // Re-fetch or recalculate when override changes
  useEffect(() => {
    if (waterQualityOverride.enabled) {
      // Calculate warning level locally based on override value
      const value = waterQualityOverride.value;
      let level = 1;
      let message = "Waves clean • Sun shining • Conditions green";
      
      if (value > 140 && value <= 280) {
        level = 2;
        message = "Elevated levels detected • Use caution • Check signage";
      } else if (value > 280) {
        level = 3;
        message = "High contaminants detected • Swimming not advised";
      }
      
      setWarningData({ level, message });
    } else {
      fetchWarningLevel();
    }
  }, [waterQualityOverride.enabled, waterQualityOverride.value]);

  const fetchWarningLevel = async () => {
    try {
      const url = new URL("/api/warning-level", SERVER_ADDRESS);
      const response = await fetch(url, { method: "GET" });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      setWarningData({ level: data.level, message: data.message });
    } catch (err) {
      console.error("Error fetching warning level:", err);
      // Default to safe if API fails
      setWarningData({ level: 1, message: null });
    }
  };

  return (
    <WarningLevelContext.Provider value={{ warningData, fetchWarningLevel }}>
      {children}
    </WarningLevelContext.Provider>
  );
}

export function useWarningLevel() {
  const context = useContext(WarningLevelContext);
  if (!context) {
    throw new Error("useWarningLevel must be used within a WarningLevelProvider");
  }
  return context;
}

export default WarningLevelContext;
