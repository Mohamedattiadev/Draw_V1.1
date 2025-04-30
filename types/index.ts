import type { ReactNode } from "react"

export type ToolType = "selection" | "hand" | "rectangle" | "diamond" | "circle" | "arrow" | "line" | "lock"

export interface Tool {
  slug: ToolType
  icon: () => JSX.Element
  title: string
  toolAction: (slug: ToolType) => void
}

export interface Element {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  tool: Exclude<ToolType, "selection" | "hand" | "lock">
  strokeWidth: number
  strokeColor: string
  strokeStyle: "solid" | "dashed" | "dotted"
  fill: string
  opacity: number
  offsetX?: number
  offsetY?: number
}

export interface Style {
  strokeWidth: number
  strokeColor: string
  strokeStyle: "solid" | "dashed" | "dotted"
  fill: string
  opacity: number
}

export interface Translate {
  x: number
  y: number
  sx: number
  sy: number
}

export interface ScaleOffset {
  x: number
  y: number
}

export interface Dimension {
  width: number
  height: number
}

export interface Corner {
  slug: string
  x: number
  y: number
}

export interface FocuseLine {
  fx: number
  fy: number
  fw: number
  fh: number
}

export interface FocuseCorners {
  line: FocuseLine
  corners: Corner[]
}

export interface StrokeStyle {
  slug: "solid" | "dashed" | "dotted"
  icon: () => JSX.Element
}

export interface AppContextType {
  action: string
  setAction: (action: string) => void
  tools: Tool[][]
  selectedTool: ToolType
  setSelectedTool: (tool: ToolType) => void
  elements: Element[]
  setElements: (
    elements: Element[] | ((prevState: Element[]) => Element[]),
    overwrite?: boolean,
    emit?: boolean,
  ) => void
  translate: Translate
  setTranslate: (translate: Translate | ((prevState: Translate) => Translate)) => void
  scale: number
  setScale: (scale: number | ((prevState: number) => number)) => void
  onZoom: (delta: number | "default") => void
  scaleOffset: ScaleOffset
  setScaleOffset: (scaleOffset: ScaleOffset) => void
  lockTool: boolean
  setLockTool: (lockTool: boolean | ((prevState: boolean) => boolean)) => void
  style: Style
  setStyle: (style: Partial<Style> | ((prevState: Style) => Style)) => void
  selectedElement: Element | null
  setSelectedElement: (element: Element | null) => void
  undo: () => void
  redo: () => void
  session: string | null
  setSession: (session: string | null) => void
}

export interface AppContextProviderProps {
  children: ReactNode
}
