const db = require("./config");
const crypto = require("crypto");

class OrderService {
  static async receiveAndBroadcast(io, data) {
    try {
      data.id = crypto.randomBytes(4).toString("hex");

      // Veritabanına kaydet
      await this.saveToDatabase(data);
      // Veritabanından veriyi al
      const restaurant_id = await data.restaurant_id;
      const savedData = await this.getDataFromDatabase(restaurant_id);

      // /get/order noktasına veriyi iletebilirsiniz
      io.emit(`/get/order/${restaurant_id}`, savedData);

      return "up";
    } catch (err) {
      throw err;
    }
  }

  static async saveToDatabase(data) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO Orders SET ?";
      db.query(sql, data, (err, result) => {
        if (err) {
          return reject(err);
        } else {
          resolve("The order has been recieved");
        }
      });
    });
  }

  static async getDataFromDatabase(restaurant_id) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM Orders WHERE restaurant_id = ?";
      db.query(sql, restaurant_id, (err, result) => {
        if (err) {
          return reject(err);
        } else {
          if (result.length === 0) {
            return reject(new Error("Order not found"));
          }
          resolve(result);
        }
      });
    });
  }
}

module.exports = OrderService;
