require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const parser = require("socket.io-msgpack-parser");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const PORT = process.env.PORT || 8080;

// More permissive CORS for development
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  parser,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Store canvas state for each room
const roomStates = new Map();

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
    // Send current room state to the new user
    if (roomStates.has(room)) {
      socket.emit("setCanvasState", roomStates.get(room));
    }
  });

  socket.on("leave", (room) => {
    socket.leave(room);
  });

  socket.on("getElements", ({ elements, room }) => {
    io.in(room).emit("setElements", elements);
  });

  socket.on("updateCanvasState", ({ state, room }) => {
    roomStates.set(room, state);
    socket.to(room).emit("setCanvasState", state);
  });
});

app.get("/", (req, res) => {
  res.send(
    `<marquee>To try the app visite : <a href="${CLIENT_URL}">${CLIENT_URL}</a></marquee>`
  );
});

server.listen(PORT, () => {
  console.log("Listen in port : " + PORT);
});
