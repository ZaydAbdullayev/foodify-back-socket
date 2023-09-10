const express = require("express");
const app = express();
const cors = require("cors");
const port = 80;

const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});
const OrderService = require("./src/service/io.service");

app.use(cors());
app.use(express.static("src")); // Replace 'public' with the appropriate directoryC
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  socket.on("/order", async (data) => {
    try {
      await OrderService.receiveAndBroadcast(io, data);
    } catch (err) {
      console.error(err);
    }
  });
  socket.on("/accept/order", (data) => {
    io.emit(`/get/message${data?.user_id}`, data);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
