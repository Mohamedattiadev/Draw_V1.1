import type { Element, Style } from "@/types"
import { distance } from "./canvas"
import { v4 as uuid } from "uuid"

export function isWithinElement(x: number, y: number, element: Element): boolean {
  let { tool, x1, y1, x2, y2, strokeWidth } = element

  switch (tool) {
    case "arrow":
    case "line":
      const a = { x: x1, y: y1 }
      const b = { x: x2, y: y2 }
      const c = { x, y }

      const offset = distance(a, b) - (distance(a, c) + distance(b, c))
      return Math.abs(offset) < (0.05 * strokeWidth || 1)
    case "circle":
      const width = x2 - x1 + strokeWidth
      const height = y2 - y1 + strokeWidth
      x1 -= strokeWidth / 2
      y1 -= strokeWidth / 2

      const centreX = x1 + width / 2
      const centreY = y1 + height / 2

      const mouseToCentreX = centreX - x
      const mouseToCentreY = centreY - y

      const radiusX = Math.abs(width) / 2
      const radiusY = Math.abs(height) / 2

      return (
        (mouseToCentreX * mouseToCentreX) / (radiusX * radiusX) +
          (mouseToCentreY * mouseToCentreY) / (radiusY * radiusY) <=
        1
      )

    case "diamond":
    case "rectangle":
      const minX = Math.min(x1, x2) - strokeWidth / 2
      const maxX = Math.max(x1, x2) + strokeWidth / 2
      const minY = Math.min(y1, y2) - strokeWidth / 2
      const maxY = Math.max(y1, y2) + strokeWidth / 2

      return x >= minX && x <= maxX && y >= minY && y <= maxY
    default:
      return false
  }
}

export function getElementPosition(x: number, y: number, elements: Element[]): Element | undefined {
  return elements.filter((element) => isWithinElement(x, y, element)).at(-1)
}

export function createElement(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: Style,
  tool: Exclude<Element["tool"], "selection" | "hand" | "lock">,
): Element {
  return { id: uuid(), x1, y1, x2, y2, ...style, tool }
}

export function updateElement(
  id: string,
  stateOption: Partial<Element>,
  setState: (elements: Element[] | ((prevState: Element[]) => Element[]), overwrite?: boolean) => void,
  state: Element[],
  overwrite = false,
): void {
  const index = state.findIndex((ele) => ele.id === id)
  if (index === -1) return

  const stateCopy = [...state]

  stateCopy[index] = {
    ...stateCopy[index],
    ...stateOption,
  }

  setState(stateCopy, overwrite)
}

export function deleteElement(
  s_element: Element | null,
  setState: (elements: Element[] | ((prevState: Element[]) => Element[])) => void,
  setSelectedElement: (element: Element | null) => void,
): void {
  if (!s_element) return

  const { id } = s_element
  setState((prevState) => prevState.filter((element) => element.id !== id))
  setSelectedElement(null)
}

export function duplicateElement(
  s_element: Element | null,
  setState: (elements: Element[] | ((prevState: Element[]) => Element[])) => void,
  setSelected: (element: Element | null) => void,
  factor: number,
  offsets: Partial<Element> = {},
): void {
  if (!s_element) return

  const { id } = s_element
  setState((prevState) =>
    prevState.flatMap((element) => {
      if (element.id === id) {
        const duplicated = { ...moveElement(element, factor), id: uuid() }
        setSelected({ ...duplicated, ...offsets })
        return [element, duplicated]
      }
      return element
    }),
  )
}

export function moveElement(element: Element, factorX: number, factorY: number | null = null): Element {
  return {
    ...element,
    x1: element.x1 + factorX,
    y1: element.y1 + (factorY ?? factorX),
    x2: element.x2 + factorX,
    y2: element.y2 + (factorY ?? factorX),
  }
}

export function moveElementLayer(
  id: string,
  to: number,
  setState: (elements: Element[] | ((prevState: Element[]) => Element[])) => void,
  state: Element[],
): void {
  const index = state.findIndex((ele) => ele.id === id)
  if (index === -1) return

  const stateCopy = [...state]
  const replace = stateCopy[index]
  stateCopy.splice(index, 1)

  let toReplaceIndex = index
  if (to === 1 && index < state.length - 1) {
    toReplaceIndex = index + 1
  } else if (to === -1 && index > 0) {
    toReplaceIndex = index - 1
  } else if (to === 0) {
    toReplaceIndex = 0
  } else if (to === 2) {
    toReplaceIndex = state.length - 1
  }

  const firstPart = stateCopy.slice(0, toReplaceIndex)
  const lastPart = stateCopy.slice(toReplaceIndex)

  setState([...firstPart, replace, ...lastPart])
}

export function arrowMove(
  s_element: Element | null,
  x: number,
  y: number,
  setState: (elements: Element[] | ((prevState: Element[]) => Element[])) => void,
): void {
  if (!s_element) return

  const { id } = s_element
  setState((prevState) =>
    prevState.map((element) => {
      if (element.id === id) {
        return moveElement(element, x, y)
      }
      return element
    }),
  )
}

export function minmax(value: number, interval: [number, number]): number {
  return Math.max(Math.min(value, interval[1]), interval[0])
}

export function getElementById(id: string, elements: Element[]): Element | undefined {
  return elements.find((element) => element.id === id)
}

export function adjustCoordinates(element: Element): { id: string; x1: number; y1: number; x2: number; y2: number } {
  const { id, x1, x2, y1, y2, tool } = element
  if (tool === "line" || tool === "arrow") return { id, x1, x2, y1, y2 }

  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)

  return { id, x1: minX, y1: minY, x2: maxX, y2: maxY }
}

export function resizeValue(
  corner: string,
  type: string,
  x: number,
  y: number,
  padding: number,
  element: Element,
  offset: { x: number; y: number },
  elementOffset: Element,
): Partial<Element> {
  const { x1, x2, y1, y2 } = element

  const getPadding = (condition: boolean): number => {
    return condition ? padding : padding * -1
  }

  const getType = (
    y: number,
    coordinate: number,
    originalCoordinate: number,
    eleOffset: number,
    te = false,
  ): number => {
    if (type === "default") return originalCoordinate

    const def = coordinate - y
    if (te) return eleOffset - def
    return eleOffset + def
  }

  switch (corner) {
    case "tt":
      return {
        y1: y + getPadding(y < y2),
        y2: getType(y, offset.y, y2, elementOffset.y2),
        x1: getType(y, offset.y, x1, elementOffset.x1, true),
        x2: getType(y, offset.y, x2, elementOffset.x2),
      }
    case "bb":
      return { y2: y + getPadding(y < y1) }
    case "rr":
      return { x2: x + getPadding(x < x1) }
    case "ll":
      return { x1: x + getPadding(x < x2) }
    case "tl":
      return { x1: x + getPadding(x < x2), y1: y + getPadding(y < y2) }
    case "tr":
      return { x2: x + getPadding(x < x1), y1: y + getPadding(y < y2) }
    case "bl":
      return { x1: x + getPadding(x < x2), y2: y + getPadding(y < y1) }
    case "br":
      return { x2: x + getPadding(x < x1), y2: y + getPadding(y < y1) }
    case "l1":
      return { x1: x, y1: y }
    case "l2":
      return { x2: x, y2: y }
    default:
      return {}
  }
}

export function saveElements(elements: Element[]): void {
  if (typeof window === "undefined") return

  const jsonString = JSON.stringify(elements)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.download = "canvas.sketchFlow"
  link.href = url
  link.click()
}

export function uploadElements(setElements: (elements: Element[]) => void): void {
  if (typeof window === "undefined") return

  function uploadJSON(event: Event): void {
    const target = event.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return

    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (!e.target?.result) return
        const data = JSON.parse(e.target.result as string)
        setElements(data)
      } catch (error) {
        console.error("Error :", error)
      }
    }

    reader.readAsText(file)
  }

  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.accept = ".kyrosDraw"
  fileInput.onchange = uploadJSON
  fileInput.click()
}
