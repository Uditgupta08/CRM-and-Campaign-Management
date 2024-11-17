const db = require("../config/db");

class Customer {
  static async initialize() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        total_spending DECIMAL(10, 2) DEFAULT 0,
        last_visit DATE
      )
    `);
  }
  static async updateTotalSpending(customerId) {
    await db.query(
      `
      UPDATE customers
      SET total_spending = (
        SELECT COALESCE(SUM(amount), 0) FROM orders WHERE customer_id = ?
      )
      WHERE customer_id = ?
    `,
      [customerId, customerId]
    );
  }

  static async create(Data) {
    const { name, email, total_spending = 0, last_visit = null } = Data;
    const [result] = await db.query(
      "INSERT INTO customers (name, email, total_spending, last_visit) VALUES (?, ?, ?, ?)",
      [name, email, total_spending, last_visit]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM customers");
    return rows;
  }

  static async getByEmails(emails) {
    try {
      if (!Array.isArray(emails)) {
        throw new Error("The 'emails' parameter must be an array.");
      }
      const placeholders = emails.map(() => "?").join(", ");
      const [rows] = await db.query(
        `SELECT customer_id, name, email FROM customers WHERE email IN (${placeholders})`,
        emails
      );
      return rows;
    } catch (error) {
      throw new Error("Failed to fetch customers: " + error.message);
    }
  }
}

module.exports = Customer;
