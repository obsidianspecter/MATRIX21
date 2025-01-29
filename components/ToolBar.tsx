import type React from "react"
import type { DrawingState, Tool } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Brush, Eraser, Square, Circle, Triangle, Minus, Ruler } from "lucide-react"

interface ToolBarProps {
  drawingState: DrawingState
  onToolChange: (tool: Tool) => void
  onColorChange: (color: string) => void
  onBrushWidthChange: (width: number) => void
}

const ToolBar: React.FC<ToolBarProps> = ({ drawingState, onToolChange, onColorChange, onBrushWidthChange }) => {
  return (
    <div className="toolbar flex flex-wrap gap-2 items-center bg-secondary p-2 rounded-lg">
      <Button
        onClick={() => onToolChange("brush")}
        variant={drawingState.tool === "brush" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "brush"}
      >
        <Brush className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("eraser")}
        variant={drawingState.tool === "eraser" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "eraser"}
      >
        <Eraser className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("rectangle")}
        variant={drawingState.tool === "rectangle" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "rectangle"}
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("circle")}
        variant={drawingState.tool === "circle" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "circle"}
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("triangle")}
        variant={drawingState.tool === "triangle" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "triangle"}
      >
        <Triangle className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("line")}
        variant={drawingState.tool === "line" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "line"}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onToolChange("ruler")}
        variant={drawingState.tool === "ruler" ? "secondary" : "outline"}
        size="icon"
        aria-pressed={drawingState.tool === "ruler"}
      >
        <Ruler className="h-4 w-4" />
      </Button>
      <Input
        type="color"
        value={drawingState.color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-12 h-8 bg-transparent border border-input rounded-md"
      />
      <div className="flex items-center space-x-2 flex-grow">
        <span className="text-sm text-muted-foreground">Brush Width:</span>
        <Slider
          min={1}
          max={30}
          value={[drawingState.brushWidth]}
          step={1}
          onValueChange={(value) => onBrushWidthChange(value[0])}
          className="w-32"
        />
      </div>
    </div>
  )
}

export default ToolBar

