import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

interface Room {
  users: string[]
}

const rooms = new Map<string, Room>()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (roomId: string, userId: string) => {
    socket.join(roomId)

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [] })
    }

    const room = rooms.get(roomId)!
    room.users.push(userId)

    socket.to(roomId).emit("user-connected", userId)

    socket.on("disconnect", () => {
      room.users = room.users.filter((id) => id !== userId)
      socket.to(roomId).emit("user-disconnected", userId)

      if (room.users.length === 0) {
        rooms.delete(roomId)
      }
    })
  })

  socket.on("toggle-audio", (roomId: string, userId: string, enabled: boolean) => {
    socket.to(roomId).emit("user-audio-change", userId, enabled)
  })

  socket.on("toggle-video", (roomId: string, userId: string, enabled: boolean) => {
    socket.to(roomId).emit("user-video-change", userId, enabled)
  })
})

const PORT = process.env.PORT || 3030
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

