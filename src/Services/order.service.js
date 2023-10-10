const db = require("../Config");
const crypto = require("crypto");

class OrderService {
  static async receiveAndBroadcast(io, data) {
    try {
      const restaurant_id = await data.restaurant_id;
      const departments = await this.getDepartments(restaurant_id);

      for (let i = 0; i < departments.length; i++) {
        const department_name = departments[i];
        const savedData = await this.getDataFromDatabase(
          restaurant_id,
          department_name
        );
        await io.emit(
          `/get/order/${restaurant_id}/${department_name}`,
          savedData
        );
      }

      return "up";
    } catch (err) {
      throw err;
    }
  }

  static async getDepartmentName(resId) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = "SELECT * FROM Orders WHERE restaurant_id = ?";
        db.query(sql, resId, (err, result) => {
          if (err) reject(err);

          if (result?.length) {
            const product_data = JSON.parse(result?.product_data);
            const items = product_data.map((item) => item);
          } else {
            resolve(null);
          }
        });
      } catch {}
    });
  }
  static async updateStatus(io, data) {
    return new Promise((resolve, reject) => {
      try {
        const sql = "UPDATE Orders SET status = ? WHERE id = ? AND user_id = ?";

        db.query(
          sql,
          [data.status, data.id, data.user_id],
          async (err, result) => {
            const order_info = await this.getMyOrders(data.user_id);
            const parsedOrders = JSON.parse(JSON.stringify(order_info));
            if (err) reject(err);
            io.emit(`/get/order/status/${data?.user_id}`, parsedOrders);

            if (result?.affectedRows) {
              resolve("Order_status updated");
            } else {
              reject("Order_status could not be updated");
            }
          }
        );
      } catch (err) {
        return reject(err);
      }
    });
  }
  static async updateProductStatus(io, orderId, productId, status) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = "SELECT * FROM Orders WHERE id = ?";
        db.query(sql, orderId, (err, result) => {
          if (err) reject(err);
  
          if (result?.length) {
            const product_data = JSON.parse(result[0].product_data);
            const allProductsStatus2Or3 = product_data.every((item) => item.status === 2 || item.status === 3);

            if (allProductsStatus2Or3) {
              const values = [3, orderId];
              const sql = "UPDATE Orders SET status = ? WHERE id = ?";
              db.query(sql, values, (err, result) => {
                if (err) reject(err);
  
                if (result?.affectedRows) {
                  resolve([]);
                } else {
                  reject("Order_status could not be updated");
                }
              });
              
            } else {
              // Find the product by productId and update its status
              const product = product_data.find((item) => item.id === productId);
              if (product) {
                product.status = status;
              }
            }
  
            result[0].product_data = JSON.stringify(product_data);
            const result1 = result[0];
  
            const sql1 = "UPDATE Orders SET ? WHERE id = ?";
  
            db.query(sql1, [result1, orderId], (err, result) => {
              if (err) reject(err);

  
              if (result?.affectedRows) {
            io.emit(`/get/ready/orders`, result);
                resolve(result);
                
                resolve("MyFavRes is updated");
              } else {
                reject("MyFavRes is not updated");
              }
            });
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  static async getMyOrders(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // await this.updateViews(id);
        const sql =
          "SELECT * FROM Orders WHERE user_id = ? ORDER BY receivedAt DESC";
        db.query(sql, id, (err, result) => {
          if (err) reject(err);

          if (result?.length) {
            resolve(result);
          } else {
            resolve(null);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
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

  static async getDataFromDatabase(restaurant_id, department_name) {
    return new Promise((resolve, reject) => {
      const sql1 =
        "SELECT * FROM Orders WHERE restaurant_id = ? AND status = 1";
      db.query(sql1, restaurant_id, (err, result) => {
        if (err) reject(err);

        if (result?.length) {
          const result1 = JSON.parse(JSON.stringify(result));
          const orders = result1;

          const filteredItems = [];

          for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const items = JSON.parse(order.product_data);

            const filteredOrderItems = items.filter((product) => {
              return product.department === department_name;
            });

            if (filteredOrderItems.length > 0) {
              const filteredOrder = {
                id: order.id,
                product_data: JSON.stringify(filteredOrderItems),
                receivedAt: order.receivedAt,
              };
              filteredItems.push(filteredOrder);
            }
          }

          if (filteredItems.length > 0) {
            resolve(filteredItems);
          } else {
            reject(
              "No orders found for the specified department, ID, or receivedAt missing"
            );
          }
        } else {
          reject("No orders found");
        }
      });
    });
  }

  static async getDepartments(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = "SELECT * FROM Restaurants WHERE id = ?";
        db.query(sql, id, (err, result) => {
          if (err) reject(err);

          if (result?.length) {
            const departments = JSON.parse(
              JSON.stringify(result[0].departments)
            );
            resolve(JSON.parse(departments));
          } else {
            resolve(null);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  static async getDepartmentIds(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = "SELECT * FROM Restaurants WHERE id = ?";
        db.query(sql, id, (err, result) => {
          if (err) reject(err);

          if (result?.length) {
            const department_ids = JSON.parse(
              JSON.stringify(result[0].department_ids)
            );
            resolve(JSON.parse(department_ids));
          } else {
            resolve(null);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  static async getDepartmentById(id, department_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const department_names = await this.getDepartments(id);
        const department_ids = await this.getDepartmentIds(id);
        const departments = {};

        for (let i = 0; i < department_ids.length; i++) {
          departments[department_ids[i]] = department_names[i];
        }
        const department_name = departments[department_id];
        resolve(department_name);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = OrderService;
