const userRoute = require("./routes/user.routes");
const convoRoute = require("./routes/conversation.routes");
const express = require("express");

const app = express();

const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.json());
app.use("/users", userRoute);
app.use("/convo", convoRoute);
app.get("/", (req, res) => {
  res.json({ message: "main page" });
});

io.on("connection", (socket) => {
  console.log("client connected");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running, port: " + PORT);
});
