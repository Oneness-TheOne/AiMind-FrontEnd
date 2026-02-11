"use client"

import React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
} from "lucide-react"

interface DrawingCanvasProps {
  onSave: (imageData: string) => void
  onCancel?: () => void
  width?: number
  height?: number
  title?: string
}

export function DrawingCanvas({ onSave, onCancel, width = 500, height = 400, title }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil")
  const [brushSize, setBrushSize] = useState(4)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const lastPosRef = useRef({ x: 0, y: 0 })

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([imageData])
    setHistoryIndex(0)
  }, [])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)

    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getPosition(e)
    lastPosRef.current = pos
    setIsDrawing(true)

    // Draw a dot for single click
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = tool === "eraser" ? "#FFFFFF" : "#000000"
    ctx.fill()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getPosition(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : "#000000"
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.putImageData(history[newIndex], 0, 0)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.putImageData(history[newIndex], 0, 0)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL("image/png")
    onSave(imageData)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "drawing.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-secondary/50 rounded-lg">
        {/* Tools */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <Button
            variant={tool === "pencil" ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool("pencil")}
            title="연필"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool("eraser")}
            title="지우개"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2 border-r border-border pr-2 mr-2">
          <span className="text-sm text-muted-foreground">크기:</span>
          <Slider
            value={[brushSize]}
            onValueChange={([value]) => setBrushSize(value)}
            min={1}
            max={20}
            step={1}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground min-w-[2rem]">{brushSize}px</span>
        </div>

        <div className="border-l border-border pl-2 ml-2 flex items-center gap-1">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="되돌리기"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="다시 실행"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-l border-border pl-2 ml-2 flex items-center gap-1">
          {/* Clear */}
          <Button variant="ghost" size="icon" onClick={clearCanvas} title="전체 지우기">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
        )}
        <Button onClick={handleSave} className="flex-1">
          저장하기
        </Button>
      </div>
    </div>
  )
}
