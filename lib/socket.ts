import { io } from "socket.io-client"
import parser from "socket.io-msgpack-parser"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080"

// Create socket instance only on client side
let socket: any

if (typeof window !== "undefined") {
  socket = io(BACKEND_URL, {
    parser,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    forceNew: true
  })

  socket.on("connect", () => {
    console.log("Socket connected successfully")
  })

  socket.on("connect_error", (error: any) => {
    console.error("Socket connection error:", error.message)
    // Try to reconnect with polling if websocket fails
    if (socket.io.opts.transports[0] === 'websocket') {
      socket.io.opts.transports = ['polling', 'websocket']
    }
  })

  socket.on("disconnect", (reason: string) => {
    console.log("Socket disconnected:", reason)
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, reconnect manually
      socket.connect()
    }
  })
}

export { socket }
