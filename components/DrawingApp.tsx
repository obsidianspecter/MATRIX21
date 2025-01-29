"use client"

import { useRef, useEffect, useState } from "react"
import ToolBar from "./ToolBar"
import Canvas from "./Canvas"
import type { DrawingState, Tool } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "next-themes"

const DrawingApp: React.FC = () => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: "brush",
    color: "#FFFFFF",
    brushWidth: 5,
    fillColor: false,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const { theme } = useTheme()

  const handleToolChange = (tool: Tool) => {
    setDrawingState((prev) => ({ ...prev, tool }))
  }

  const handleColorChange = (color: string) => {
    setDrawingState((prev) => ({ ...prev, color }))
  }

  const handleBrushWidthChange = (width: number) => {
    setDrawingState((prev) => ({ ...prev, brushWidth: width }))
  }

  const handleFillColorChange = (fill: boolean) => {
    setDrawingState((prev) => ({ ...prev, fillColor: fill }))
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && canvas) {
      ctx.fillStyle = theme === "dark" ? "#000000" : "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setBackgroundImage(null)
    }
  }

  const handleGeneratePDF = () => {
    // Implement PDF generation logic here
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === "string") {
          setBackgroundImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Interactive Drawing Board</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="drawing-app space-y-4">
          <ToolBar
            drawingState={drawingState}
            onToolChange={handleToolChange}
            onColorChange={handleColorChange}
            onBrushWidthChange={handleBrushWidthChange}
          />
          <div className="flex items-center space-x-2">
            <Input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="max-w-sm" />
            <Button onClick={handleClearCanvas} variant="outline">
              Clear Canvas
            </Button>
            <Button onClick={handleGeneratePDF} variant="outline">
              Generate PDF
            </Button>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fillColor"
                checked={drawingState.fillColor}
                onCheckedChange={(checked) => handleFillColorChange(checked as boolean)}
              />
              <label htmlFor="fillColor">Fill Color</label>
            </div>
          </div>
          <div
            className="canvas-container border rounded"
            style={{ width: "100%", height: "600px", overflow: "hidden" }}
          >
            <Canvas ref={canvasRef} drawingState={drawingState} backgroundImage={backgroundImage} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DrawingApp

