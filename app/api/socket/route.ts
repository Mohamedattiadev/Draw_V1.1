import { NextResponse } from "next/server"
import { Server } from "socket.io"
import parser from "socket.io-msgpack-parser"

// This is a workaround to avoid recreating the server on every request in development
let io: any

export async function GET() {
  if (!io) {
    // Create socket.io server
    const httpServer = new (require("http").Server)()
    io = new Server(httpServer, {
      parser,
      cors: {
        origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket: any) => {
      socket.on("join", (room: string) => {
        socket.join(room)
      })

      socket.on("leave", (room: string) => {
        socket.leave(room)
      })

      socket.on("getElements", ({ elements, room }: { elements: any; room: string }) => {
        socket.to(room).emit("setElements", elements)
      })
    })

    // Start the server
    const PORT = process.env.SOCKET_PORT || 3001
    httpServer.listen(PORT, () => {
      console.log(`Socket.io server running on port ${PORT}`)
    })
  }

  return NextResponse.json({ status: "Socket server is running" })
}
