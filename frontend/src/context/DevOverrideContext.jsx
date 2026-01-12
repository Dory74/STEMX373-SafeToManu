// GENERATED FILE BY CLAUDE CODE NOT BUILT BY ME, AS SUCH THE SUPLIMENT INTEGRATION INTO OTHER FILS IS ALSO BUILT BY AI. THIS IS WHAT THE BRANCH IS FOR, BUT I AM ALOS FIXONG OTHER ERRORS THAT ARE NOT AI RELATED, AS THE DEV SLIDERS ARE HELPING WITH TESTING.

import { createContext, useContext, useState } from "react"

const DevOverrideContext = createContext()

export const OVERRIDE_DEFAULTS = {
  uv: { enabled: false, value: 5 },
  tideHeight: { enabled: false, value: 1.5 },
  waterTemp: { enabled: false, value: 20 },
  windSpeed: { enabled: false, value: 15 },
  waterQuality: { enabled: false, value: 100 },
}

export function DevOverrideProvider({ children }) {
  const [overrides, setOverrides] = useState(OVERRIDE_DEFAULTS)

  const setOverride = (key, enabled, value) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: { enabled, value },
    }))
  }

  const toggleOverride = (key) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }))
  }

  const setValue = (key, value) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }))
  }

  const resetAll = () => {
    setOverrides(OVERRIDE_DEFAULTS)
  }

  return (
    <DevOverrideContext.Provider
      value={{ overrides, setOverride, toggleOverride, setValue, resetAll }}
    >
      {children}
    </DevOverrideContext.Provider>
  )
}

export function useDevOverride() {
  const context = useContext(DevOverrideContext)
  if (!context) {
    throw new Error("useDevOverride must be used within a DevOverrideProvider")
  }
  return context
}

export default DevOverrideContext
