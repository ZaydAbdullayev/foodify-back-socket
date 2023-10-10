const queryService = require("./query.service");
const crypto = require("crypto");

class cashierService {
  static async getOrders(io, data) {
    data.id = crypto.randomBytes(4).toString("hex");
    await this.saveOrder(data);

    const restaurant_id = await data.restaurant_id;
    const savedOrder = await this.getFromDatabase(restaurant_id);
    await io.emit(`/get/newOrders/${restaurant_id}`, savedOrder);
  }
  static async saveOrder(data) {
    try {
      const sql = "INSERT INTO Orders SET ?";
      const result = await queryService.dbQuery(sql, data);
      if (result?.length) {
        return result;
      } else {
        return "The order could not be recieved";
      }
    } catch (err) {
      return err;
    }
  }
  static async getFromDatabase(resId) {
    try {
      const orderQuery =
        "SELECT * FROM Orders WHERE restaurant_id = ? AND status = 0";
      const orderResult = await queryService.dbQuery(orderQuery, resId);
      const parsedOrders = JSON.parse(JSON.stringify(orderResult));
      if (parsedOrders?.length) {
        return parsedOrders;
      } else {
        return "The order could not be recieved";
      }
    } catch (err) {
      return err;
    }
  }
}

module.exports = cashierService;
