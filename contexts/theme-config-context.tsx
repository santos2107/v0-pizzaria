"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeConfigContextType = {
  primaryColor: string
  secondaryColor: string
  updateThemeColors: (primary: string, secondary: string) => void
}

const defaultThemeConfig: ThemeConfigContextType = {
  primaryColor: "#10b981", // Verde padrão
  secondaryColor: "#f59e0b", // Laranja padrão
  updateThemeColors: () => {},
}

const ThemeConfigContext = createContext<ThemeConfigContextType>(defaultThemeConfig)

export const useThemeConfig = () => useContext(ThemeConfigContext)

export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(defaultThemeConfig.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(defaultThemeConfig.secondaryColor)

  // Carregar configurações salvas quando o componente montar
  useEffect(() => {
    const savedPrimaryColor = localStorage.getItem("primaryColor")
    const savedSecondaryColor = localStorage.getItem("secondaryColor")

    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor)
    if (savedSecondaryColor) setSecondaryColor(savedSecondaryColor)

    // Aplicar as cores ao CSS personalizado
    applyThemeColors(
      savedPrimaryColor || defaultThemeConfig.primaryColor,
      savedSecondaryColor || defaultThemeConfig.secondaryColor,
    )
  }, [])

  // Função para atualizar as cores do tema
  const updateThemeColors = (primary: string, secondary: string) => {
    setPrimaryColor(primary)
    setSecondaryColor(secondary)

    // Salvar no localStorage
    localStorage.setItem("primaryColor", primary)
    localStorage.setItem("secondaryColor", secondary)

    // Aplicar as cores ao CSS personalizado
    applyThemeColors(primary, secondary)
  }

  // Função para aplicar as cores ao CSS personalizado
  const applyThemeColors = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty("--primary-color", primary)
    document.documentElement.style.setProperty("--secondary-color", secondary)
  }

  return (
    <ThemeConfigContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        updateThemeColors,
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  )
}
