const db = require("../config/db");
const Customer = require("./customer");

class Order {
  static async initialize() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        order_date DATE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `);
  }

  static async create(Data) {
    const { customer_id, amount, order_date } = Data;
    const [result] = await db.query(
      "INSERT INTO orders (customer_id, amount, order_date) VALUES (?, ?, ?)",
      [customer_id, amount, order_date]
    );
    await Customer.updateTotalSpending(customer_id);
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.query(`
      SELECT orders.order_id AS id, orders.amount, orders.order_date, customers.name AS customerName
      FROM orders
      JOIN customers ON orders.customer_id = customers.customer_id
    `);
    return rows;
  }
}

module.exports = Order;
