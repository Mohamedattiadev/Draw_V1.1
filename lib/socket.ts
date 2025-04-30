import { io } from "socket.io-client"
import parser from "socket.io-msgpack-parser"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080"

// Create socket instance only on client side
let socket: any

if (typeof window !== "undefined") {
  socket = io(BACKEND_URL, {
    parser,
  })
}

export { socket }
