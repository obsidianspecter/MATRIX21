import React, { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, Mic, MicOff, Monitor, Maximize, Minimize, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoCallProps {
  stream: MediaStream | null
  remoteStreams: { [key: string]: MediaStream }
  onToggleVideo: () => void
  onToggleAudio: () => void
  onShareScreen: () => void
  onStopSharing: () => void
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  isFloating?: boolean
}

export function VideoCall({
  stream,
  remoteStreams,
  onToggleVideo,
  onToggleAudio,
  onShareScreen,
  onStopSharing,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isFloating = false,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [displayMode, setDisplayMode] = useState<"full" | "compact" | "icon">(isFloating ? "compact" : "full")
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream
    }
  }, [stream])

  const handleVideoClick = (id: string | null) => {
    if (!isFloating && displayMode === "full") {
      setActiveVideo(activeVideo === id ? null : id)
    }
  }

  const toggleDisplayMode = () => {
    setDisplayMode((current) => {
      if (current === "full") return "compact"
      if (current === "compact") return "icon"
      return "full"
    })
  }

  if (displayMode === "icon") {
    return (
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-10 h-10 bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
          onClick={toggleDisplayMode}
        >
          <Video className="h-5 w-5" />
          {!isVideoEnabled && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`bg-secondary/80 backdrop-blur-sm rounded-lg transition-all duration-200 border border-border ${
        displayMode === "compact" ? "w-64" : "w-full"
      } ${isFloating ? "absolute top-4 right-4 z-50" : ""}`}
    >
      <div className="flex justify-between items-center p-2">
        <h3 className="text-sm font-semibold">Video Call</h3>
        <Button variant="ghost" size="sm" onClick={toggleDisplayMode} className="hover:bg-gray-900">
          {displayMode === "full" ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {displayMode === "full" && (
        <div className="p-2">
          {activeVideo ? (
            <div className="aspect-video bg-black rounded overflow-hidden mb-2">
              {activeVideo === "local" ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(ref) => {
                    if (ref) ref.srcObject = remoteStreams[activeVideo]
                  }}
                />
              )}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`relative aspect-video bg-black rounded overflow-hidden cursor-pointer ${
                activeVideo === "local" ? "border-2 border-primary" : ""
              }`}
              onClick={() => handleVideoClick("local")}
            >
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
                You {!isVideoEnabled && "(Video Off)"}
              </div>
            </div>

            {Object.entries(remoteStreams).map(([userId, remoteStream]) => (
              <div
                key={userId}
                className={`relative aspect-video bg-black rounded overflow-hidden cursor-pointer ${
                  activeVideo === userId ? "border-2 border-primary" : ""
                }`}
                onClick={() => handleVideoClick(userId)}
              >
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(ref) => {
                    if (ref) ref.srcObject = remoteStream
                  }}
                />
                <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">Participant</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayMode === "compact" && (
        <div className="p-2">
          <div className="aspect-video bg-black rounded overflow-hidden mb-2">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
              You {!isVideoEnabled && "(Video Off)"}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-2 p-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleVideo}
          className={!isVideoEnabled ? "bg-red-500/20 hover:bg-red-500/30" : ""}
        >
          {isVideoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAudio}
          className={!isAudioEnabled ? "bg-red-500/20 hover:bg-red-500/30" : ""}
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={isScreenSharing ? onStopSharing : onShareScreen}
          className={isScreenSharing ? "bg-green-500/20 hover:bg-green-500/30" : ""}
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

