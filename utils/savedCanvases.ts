import type { Element } from "@/types"

interface SavedCanvas {
  id: string
  name: string
  elements: Element[]
  timestamp: number
}

const STORAGE_KEY = "saved_canvases"

export function saveCanvas(elements: Element[], name: string = "Untitled"): void {
  if (typeof window === "undefined") return

  const savedCanvases = getSavedCanvases()
  const newCanvas: SavedCanvas = {
    id: crypto.randomUUID(),
    name,
    elements,
    timestamp: Date.now(),
  }

  savedCanvases.push(newCanvas)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCanvases))
}

export function getSavedCanvases(): SavedCanvas[] {
  if (typeof window === "undefined") return []

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Error loading saved canvases:", error)
    return []
  }
}

export function loadCanvas(id: string): Element[] | null {
  const savedCanvases = getSavedCanvases()
  const canvas = savedCanvases.find((c) => c.id === id)
  return canvas ? canvas.elements : null
}

export function deleteSavedCanvas(id: string): void {
  if (typeof window === "undefined") return

  const savedCanvases = getSavedCanvases()
  const updatedCanvases = savedCanvases.filter((canvas) => canvas.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCanvases))
} 