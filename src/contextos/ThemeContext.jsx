import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Cargar preferencia guardada o usar preferencia del sistema
    const savedTheme = localStorage.getItem('contaapi-theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Aplicar clase al HTML
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('contaapi-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('contaapi-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}