const mysql = require("mysql");

const config = {
  host: "162.55.134.175",
  database: "spschool_yandex_eats",
  user: "spschool",
  password: "Myfirstwebsite-1",
};

const pool = mysql.createPool(config);

pool.getConnection((err, connection) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database");
    connection.release();
  }
});

module.exports = pool;
