import express from "express";
import { Server } from "socket.io"; // Importing Server class from socket.io
import http from "http";
import { fileURLToPath } from "url";
import path from "path";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Create an HTTP server
const server = http.createServer(app);

// Create a new Socket.IO server instance
const io = new Server(server);

// Define a route
app.get("/", (req, res) => {
  res.render("index");
});

// Set up a connection event
io.on("connection", (socket) => {
  socket.on("send-location", (data) => {
    io.emit("received-location", { id: socket.id, ...data });
  });
  console.log("A user connected");

  // Handle disconnect
  socket.on("disconnect", () => {
    io.emit("A user disconnected", socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
