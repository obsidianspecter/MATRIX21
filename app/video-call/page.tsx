"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import io from "socket.io-client"
import Peer from "peerjs"

export default function VideoCallPage() {
  const [roomId, setRoomId] = useState("")
  const [peerId, setPeerId] = useState("")
  const [socket, setSocket] = useState<any>(null)
  const [peer, setPeer] = useState<any>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({})
  const videoRef = useRef<HTMLVideoElement>(null)

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
    }
  }, [peer, socket, stream])

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const joinRoom = () => {
    if (roomId && peerId) {
      socket.emit("join-room", roomId, peerId)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Video Call</h1>
      <div className="mb-4 flex gap-2">
        <Input type="text" placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <Button onClick={joinRoom}>Join Room</Button>
        <Button onClick={startVideo}>Start Video</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Video</h2>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto" />
        </div>
        {Object.entries(remoteStreams).map(([userId, remoteStream]) => (
          <div key={userId}>
            <h2 className="text-xl font-semibold mb-2">Remote Video ({userId})</h2>
            <video
              autoPlay
              playsInline
              className="w-full h-auto"
              ref={(ref) => {
                if (ref) ref.srcObject = remoteStream
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

