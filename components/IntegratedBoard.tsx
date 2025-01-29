"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Canvas from "./Canvas"
import ToolBar from "./ToolBar"
import { VideoCall } from "./VideoCall"
import type { DrawingState, Tool } from "../types"
import io from "socket.io-client"
import Peer from "peerjs"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function IntegratedBoard() {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: "brush",
    color: "#FFFFFF",
    brushWidth: 5,
    fillColor: false,
    rulerStart: null,
    rulerEnd: null,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [image, setImage] = useState<string | null>(null)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isResizingImage, setIsResizingImage] = useState(false)

  const [tableData, setTableData] = useState<{ id: number; content: string }[]>([])
  const [newCell, setNewCell] = useState("")

  const [roomId, setRoomId] = useState("")
  const [peerId, setPeerId] = useState("")
  const [socket, setSocket] = useState<any>(null)
  const [peer, setPeer] = useState<any>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({})
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const previousStream = useRef<MediaStream | null>(null)

  const { theme, setTheme } = useTheme()

  const handleToolChange = (tool: Tool) => {
    setDrawingState((prev) => ({ ...prev, tool }))
  }

  const handleColorChange = (color: string) => {
    setDrawingState((prev) => ({ ...prev, color }))
  }

  const handleBrushWidthChange = (width: number) => {
    setDrawingState((prev) => ({ ...prev, brushWidth: width }))
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && canvas) {
      ctx.fillStyle = theme === "dark" ? "#000000" : "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setImage(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
          setImagePosition({ x: 0, y: 0 })
        }
        img.src = e.target?.result as string
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCell = () => {
    if (newCell.trim()) {
      setTableData([...tableData, { id: Date.now(), content: newCell }])
      setNewCell("")
    }
  }

  const handleExportPDF = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("canvas_export.pdf")
    }
  }

  useEffect(() => {
    const newSocket = io("http://localhost:3030")
    setSocket(newSocket)

    const newPeer = new Peer()
    setPeer(newPeer)

    newPeer.on("open", (id) => {
      setPeerId(id)
    })

    return () => {
      newSocket.disconnect()
      newPeer.destroy()
    }
  }, [])

  useEffect(() => {
    if (peer && socket) {
      peer.on("call", (call: any) => {
        call.answer(stream)
        call.on("stream", (remoteStream: MediaStream) => {
          setRemoteStreams((prev) => ({ ...prev, [call.peer]: remoteStream }))
        })
      })

      socket.on("user-connected", (userId: string) => {
        if (stream) {
          const call = peer.call(userId, stream)
          call.on("stream", (remoteStream: MediaStream) => {
            setRemoteStreams((prev) => ({ ...prev, [userId]: remoteStream }))
          })
        }
      })

      socket.on("user-disconnected", (userId: string) => {
        setRemoteStreams((prev) => {
          const newStreams = { ...prev }
          delete newStreams[userId]
          return newStreams
        })
      })

      socket.on("user-audio-change", (userId: string, enabled: boolean) => {
        console.log(`User ${userId} ${enabled ? "unmuted" : "muted"} their audio`)
      })

      socket.on("user-video-change", (userId: string, enabled: boolean) => {
        console.log(`User ${userId} ${enabled ? "enabled" : "disabled"} their video`)
      })
    }
  }, [peer, socket, stream])

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStream(mediaStream)
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
      previousStream.current = mediaStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const toggleVideo = async () => {
    if (!stream) {
      await startVideo()
      return
    }

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(!isVideoEnabled)
      socket.emit("toggle-video", roomId, peerId, videoTrack.enabled)
    }
  }

  const toggleAudio = () => {
    if (!stream) return

    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(!isAudioEnabled)
      socket.emit("toggle-audio", roomId, peerId, audioTrack.enabled)
    }
  }

  const shareScreen = async () => {
    try {
      if (isScreenSharing) {
        if (stream) {
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
        }
        if (previousStream.current) {
          setStream(previousStream.current)
        }
        setIsScreenSharing(false)
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        })

        if (stream && !previousStream.current) {
          previousStream.current = stream
        }

        screenStream.getVideoTracks()[0].onended = () => {
          if (previousStream.current) {
            setStream(previousStream.current)
          }
          setIsScreenSharing(false)
        }

        setStream(screenStream)
        setIsScreenSharing(true)

        // Update all peer connections with the new stream
        if (peer && Object.keys(remoteStreams).length > 0) {
          Object.keys(remoteStreams).forEach((userId) => {
            const call = peer.call(userId, screenStream)
            call.on("stream", (remoteStream: MediaStream) => {
              setRemoteStreams((prev) => ({ ...prev, [userId]: remoteStream }))
            })
          })
        }
      }
    } catch (error) {
      console.error("Error sharing screen:", error)
      if (previousStream.current) {
        setStream(previousStream.current)
      }
      setIsScreenSharing(false)
    }
  }

  const joinRoom = () => {
    if (roomId && peerId) {
      socket.emit("join-room", roomId, peerId)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">Matrix Digital Learning Board</h1>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-32"
            />
            <Button onClick={joinRoom}>Join</Button>
            <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="space-y-4">
            <div className="flex flex-col space-y-4 bg-secondary p-4 rounded-lg border border-border">
              <ToolBar
                drawingState={drawingState}
                onToolChange={handleToolChange}
                onColorChange={handleColorChange}
                onBrushWidthChange={handleBrushWidthChange}
              />

              <div className="flex items-center space-x-4">
                <Button onClick={handleClearCanvas} variant="outline">
                  Clear Canvas
                </Button>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="max-w-xs" />
                <Button onClick={handleExportPDF} variant="outline">
                  Export as PDF
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Add table cell"
                value={newCell}
                onChange={(e) => setNewCell(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleAddCell}>Add Cell</Button>
            </div>

            <div
              className="relative border border-border rounded-lg"
              style={{ width: "100%", height: "600px", overflow: "hidden" }}
            >
              <Canvas
                ref={canvasRef}
                drawingState={drawingState}
                backgroundImage={image}
                imagePosition={imagePosition}
                imageSize={imageSize}
                setImagePosition={setImagePosition}
                setImageSize={setImageSize}
                isResizingImage={isResizingImage}
                setIsResizingImage={setIsResizingImage}
                tableData={tableData}
                setDrawingState={setDrawingState}
              />
              <VideoCall
                stream={stream}
                remoteStreams={remoteStreams}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                onShareScreen={shareScreen}
                onStopSharing={() => shareScreen()}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isFloating={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

