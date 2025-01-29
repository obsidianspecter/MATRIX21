import type React from "react"
import { useRef, useEffect, forwardRef, useState, useCallback } from "react"
import type { DrawingState } from "../types"

interface CanvasProps {
  drawingState: DrawingState
  backgroundImage: string | null
  imagePosition: { x: number; y: number }
  imageSize: { width: number; height: number }
  setImagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  setImageSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>
  isResizingImage: boolean
  setIsResizingImage: React.Dispatch<React.SetStateAction<boolean>>
  tableData: { id: number; content: string }[]
  setDrawingState: React.Dispatch<React.SetStateAction<DrawingState>>
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (
    {
      drawingState,
      backgroundImage,
      imagePosition,
      imageSize,
      setImagePosition,
      setImageSize,
      isResizingImage,
      setIsResizingImage,
      tableData,
      setDrawingState,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
    const [currentShape, setCurrentShape] = useState<ImageData | null>(null)
    const [isDraggingImage, setIsDraggingImage] = useState(false)
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })

    useEffect(() => {
      const updateCanvasSize = () => {
        const container = canvasRef.current?.parentElement
        if (container) {
          const { width, height } = container.getBoundingClientRect()
          setCanvasSize({ width, height })
        }
      }

      updateCanvasSize()
      window.addEventListener("resize", updateCanvasSize)
      return () => window.removeEventListener("resize", updateCanvasSize)
    }, [])

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(canvasRef.current)
        } else {
          ref.current = canvasRef.current
        }
      }
    }, [ref])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = canvasSize.width * 2 // Increase resolution
      canvas.height = canvasSize.height * 2 // Increase resolution

      const context = canvas.getContext("2d", { alpha: false })
      if (context) {
        context.scale(2, 2) // Scale up for higher resolution
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = "high"
        context.fillStyle = "hsl(var(--background))"
        context.fillRect(0, 0, canvas.width, canvas.height)
        setCtx(context)
      }
    }, [canvasSize])

    const getMousePos = useCallback((canvas: HTMLCanvasElement, evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width / 2 // Adjust for increased resolution
      const scaleY = canvas.height / rect.height / 2 // Adjust for increased resolution
      const clientX = "touches" in evt ? evt.touches[0].clientX : evt.clientX
      const clientY = "touches" in evt ? evt.touches[0].clientY : evt.clientY
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    }, [])

    const startDrawing = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current || !ctx) return
        const { x, y } = getMousePos(canvasRef.current, e)

        if (
          backgroundImage &&
          x >= imagePosition.x &&
          x <= imagePosition.x + imageSize.width &&
          y >= imagePosition.y &&
          y <= imagePosition.y + imageSize.height
        ) {
          if (x >= imagePosition.x + imageSize.width - 10 && y >= imagePosition.y + imageSize.height - 10) {
            setIsResizingImage(true)
          } else {
            setIsDraggingImage(true)
            setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y })
          }
        } else if (drawingState.tool === "ruler") {
          setDrawingState((prev) => ({ ...prev, rulerStart: { x, y }, rulerEnd: { x, y } }))
        } else {
          setIsDrawing(true)
          setLastPoint({ x, y })
          if (drawingState.tool === "brush" || drawingState.tool === "eraser") {
            ctx.beginPath()
            ctx.moveTo(x, y)
          } else {
            setCurrentShape(ctx.getImageData(0, 0, canvasSize.width * 2, canvasSize.height * 2))
          }
        }
      },
      [
        ctx,
        drawingState.tool,
        getMousePos,
        canvasSize,
        imagePosition,
        imageSize,
        backgroundImage,
        setIsResizingImage,
        setDrawingState,
      ],
    )

    const redrawCanvas = useCallback(() => {
      if (!ctx || !canvasRef.current) return

      // Clear canvas
      ctx.fillStyle = "hsl(var(--background))"
      ctx.fillRect(0, 0, canvasSize.width * 2, canvasSize.height * 2)

      // Only redraw image if it exists
      if (backgroundImage) {
        const img = new Image()
        img.onload = () => {
          if (!ctx || !canvasRef.current) return

          // Draw image
          ctx.drawImage(img, imagePosition.x, imagePosition.y, imageSize.width, imageSize.height)

          // Draw border around image
          ctx.strokeStyle = "hsl(var(--primary))"
          ctx.lineWidth = 2
          ctx.strokeRect(imagePosition.x, imagePosition.y, imageSize.width, imageSize.height)

          // Draw resize handle
          ctx.fillStyle = "hsl(var(--primary))"
          ctx.fillRect(imagePosition.x + imageSize.width - 8, imagePosition.y + imageSize.height - 8, 8, 8)
        }
        img.src = backgroundImage
      }

      // Redraw table
      const cellWidth = 100
      const cellHeight = 30
      const startX = 10
      const startY = canvasSize.height - tableData.length * cellHeight - 10

      ctx.fillStyle = "hsl(var(--primary))"
      ctx.font = "12px Arial"

      tableData.forEach((cell, index) => {
        const x = startX
        const y = startY + index * cellHeight
        ctx.strokeStyle = "hsl(var(--primary))"
        ctx.strokeRect(x, y, cellWidth, cellHeight)
        ctx.fillText(cell.content, x + 5, y + 20)
      })

      // Draw ruler
      if (drawingState.rulerStart && drawingState.rulerEnd) {
        ctx.beginPath()
        ctx.moveTo(drawingState.rulerStart.x, drawingState.rulerStart.y)
        ctx.lineTo(drawingState.rulerEnd.x, drawingState.rulerEnd.y)
        ctx.strokeStyle = "hsl(var(--primary))"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
      }
    }, [
      ctx,
      canvasSize,
      backgroundImage,
      imagePosition,
      imageSize,
      tableData,
      drawingState.rulerStart,
      drawingState.rulerEnd,
    ])

    const draw = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current || !ctx) return
        const { x, y } = getMousePos(canvasRef.current, e)

        if (isResizingImage) {
          const newWidth = Math.max(50, x - imagePosition.x) // Minimum width of 50px
          const newHeight = Math.max(50, y - imagePosition.y) // Minimum height of 50px
          setImageSize({ width: newWidth, height: newHeight })
          redrawCanvas()
        } else if (isDraggingImage && dragStart) {
          setImagePosition({
            x: Math.max(0, Math.min(x - dragStart.x, canvasSize.width - imageSize.width)),
            y: Math.max(0, Math.min(y - dragStart.y, canvasSize.height - imageSize.height)),
          })
          redrawCanvas()
        } else if (drawingState.tool === "ruler") {
          setDrawingState((prev) => ({ ...prev, rulerEnd: { x, y } }))
          redrawCanvas()
        } else if (isDrawing && lastPoint) {
          ctx.strokeStyle = drawingState.tool === "eraser" ? "hsl(var(--background))" : drawingState.color
          ctx.lineWidth = drawingState.brushWidth
          ctx.lineCap = "round"
          ctx.lineJoin = "round"

          if (drawingState.tool === "brush" || drawingState.tool === "eraser") {
            ctx.lineTo(x, y)
            ctx.stroke()
          } else if (currentShape) {
            ctx.putImageData(currentShape, 0, 0)
            ctx.beginPath()

            switch (drawingState.tool) {
              case "rectangle":
                ctx.rect(lastPoint.x, lastPoint.y, x - lastPoint.x, y - lastPoint.y)
                break
              case "circle":
                const radius = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2))
                ctx.arc(lastPoint.x, lastPoint.y, radius, 0, 2 * Math.PI)
                break
              case "triangle":
                ctx.moveTo(lastPoint.x, lastPoint.y)
                ctx.lineTo(x, y)
                ctx.lineTo(lastPoint.x - (x - lastPoint.x), y)
                ctx.closePath()
                break
              case "line":
                ctx.moveTo(lastPoint.x, lastPoint.y)
                ctx.lineTo(x, y)
                break
            }

            if (drawingState.fillColor) {
              ctx.fillStyle = drawingState.color
              ctx.fill()
            }
            ctx.stroke()
          }
        }
      },
      [
        isResizingImage,
        isDraggingImage,
        isDrawing,
        dragStart,
        lastPoint,
        ctx,
        drawingState,
        currentShape,
        getMousePos,
        imagePosition,
        imageSize,
        setImageSize,
        setImagePosition,
        canvasSize,
        redrawCanvas,
        setDrawingState,
      ],
    )

    const stopDrawing = useCallback(() => {
      setIsDrawing(false)
      setCurrentShape(null)
      setIsDraggingImage(false)
      setIsResizingImage(false)
      if (ctx) ctx.closePath()
      if (drawingState.tool === "ruler") {
        setDrawingState((prev) => ({ ...prev, rulerStart: null, rulerEnd: null }))
      }
    }, [ctx, setIsResizingImage, setDrawingState, drawingState.tool])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const handleMouseDown = (e: MouseEvent) => startDrawing(e)
      const handleMouseMove = (e: MouseEvent) => draw(e)
      const handleMouseUp = () => stopDrawing()
      const handleMouseOut = () => stopDrawing()

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        startDrawing(e)
      }
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        draw(e)
      }
      const handleTouchEnd = () => stopDrawing()

      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("mouseout", handleMouseOut)

      canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
      canvas.addEventListener("touchend", handleTouchEnd)

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mouseout", handleMouseOut)

        canvas.removeEventListener("touchstart", handleTouchStart)
        canvas.removeEventListener("touchmove", handleTouchMove)
        canvas.removeEventListener("touchend", handleTouchEnd)
      }
    }, [startDrawing, draw, stopDrawing])

    useEffect(() => {
      if (backgroundImage && ctx && canvasRef.current) {
        redrawCanvas()
      }
    }, [backgroundImage, ctx, redrawCanvas])

    useEffect(() => {
      if (ctx && canvasRef.current) {
        redrawCanvas()
      }
    }, [ctx, redrawCanvas])

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: isResizingImage ? "nwse-resize" : isDraggingImage ? "move" : "default",
        }}
      />
    )
  },
)

Canvas.displayName = "Canvas"

export default Canvas

