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
const OrderService = require("./src/Services/order.service");
const cashierService = require("./src/Services/cashier.service");

app.use(cors());
app.use(express.static("src")); // Replace 'public' with the appropriate directory
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  socket.on("/order", async (data) => {
    try {
      if (!data) {
        throw new Error("Invalid da or empty data");
      }

      await cashierService.getOrders(io, data);
    } catch (err) {
      console.error("Hata:", err.message);
      socket.emit("error", { message: "Failed" });
    }
  });
  socket.on(`/update/ProductSt`, async (data) => {
    try {
      if (!data) {
        throw new Error("Invalid da or empty data");
      }

      await OrderService.updateProductStatus(io, data.order_id, data.product_id, data.status);
    } catch (err) {
      console.error("Error:", err);
      socket.emit("error", { message: "Failed" });
    }
  });

  socket.on("/accept/order", (data) => {
    try {
      if (!data || !data.user_id) {
        throw new Error("Invalid data or not found user_id");
      }

      io.emit(`/get/message/${data.user_id}`, data);
    } catch (err) {
      socket.emit("error", { message: "Invalid data" });
    }
  });

  socket.on("/update/order/status", async (data) => {
    try {
      if (!data) {
        throw new Error("Invalid data");
      }
      await OrderService.updateStatus(io, data);
    } catch (err) {
      socket.emit("error", { message: "Failed" });
    }
  });
  socket.on("/divide/orders/depart", async (data) => {
    try {
      if (!data) {
        throw new Error("Invalid data");
      }

      await OrderService.receiveAndBroadcast(io, data);
    } catch (err) {
      socket.emit("error", { message: "Failed" });
    }
  });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
