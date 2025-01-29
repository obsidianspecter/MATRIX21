export type Tool = "brush" | "eraser" | "rectangle" | "circle" | "triangle" | "line" | "ruler"

export interface DrawingState {
  isDrawing: boolean
  tool: Tool
  color: string
  brushWidth: number
  fillColor: boolean
  rulerStart: { x: number; y: number } | null
  rulerEnd: { x: number; y: number } | null
}

