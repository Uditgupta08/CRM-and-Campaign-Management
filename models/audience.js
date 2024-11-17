const db = require("../config/db");

class Audience {
  static async initialize() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audiences (
        audience_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        conditions JSON,
        size INT DEFAULT 0
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS audience_customers (
        audience_id INT NOT NULL,
        customer_id INT NOT NULL,
        PRIMARY KEY (audience_id, customer_id),
        FOREIGN KEY (audience_id) REFERENCES audiences(audience_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
      )
    `);
  }

  static async create(Data) {
    const [result] = await db.query(
      "INSERT INTO audiences (name, conditions, size) VALUES (?, ?, ?)",
      [Data.name, JSON.stringify(Data.conditions), Data.size]
    );
    return result.insertId;
  }

  static async calculateSize(conditions) {
    let query = "SELECT COUNT(*) as size FROM customers WHERE ";
    const queryConditions = [];
    const queryValues = [];

    conditions.forEach((condition, index) => {
      const { field, operator, value, logic } = condition;
      if (index > 0) {
        queryConditions.push(` ${logic} `);
      }

      queryConditions.push(`\`${field}\` ${operator} ?`);
      queryValues.push(value);
    });

    query += queryConditions.join("");

    try {
      const [rows] = await db.query(query, queryValues);
      return rows[0].size;
    } catch (error) {
      console.error("Error calculating audience size:", error);
      return 0;
    }
  }

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM audiences");
    return rows;
  }

  static async getById(audienceId) {
    const [rows] = await db.query(
      "SELECT * FROM audiences WHERE audience_id = ?",
      [audienceId]
    );
    return rows[0];
  }
  static async getByName(audienceName) {
    const [rows] = await db.query("SELECT * FROM audiences WHERE name = ?", [
      audienceName,
    ]);
    return rows[0];
  }

  static async update(audienceId, Data) {
    const [result] = await db.query(
      "UPDATE audiences SET name = ?, conditions = ?, size = ? WHERE audience_id = ?",
      [Data.name, JSON.stringify(Data.conditions), Data.size, audienceId]
    );
    return result.affectedRows;
  }
  static async getCustomersById(audienceId) {
    const query = `
      SELECT c.name, c.email 
    FROM customers c
    JOIN audience_customers ac ON c.customer_id = ac.customer_id
    WHERE ac.audience_id = ?
  `;
    const [results] = await db.query(query, [audienceId]);
    console.log(results);
    return results;
  }

  static async delete(audienceId) {
    const [result] = await db.query(
      "DELETE FROM audiences WHERE audience_id = ?",
      [audienceId]
    );
    return result.affectedRows;
  }
  static async addCustomersToAudience(audienceId, customerIds) {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      throw new Error("customerIds must be a non-empty array.");
    }
    const placeholders = customerIds.map(() => "(?, ?)").join(", ");
    const values = customerIds.flatMap((customerId) => [
      audienceId,
      customerId,
    ]);

    const query = `
      INSERT INTO audience_customers (audience_id, customer_id)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE audience_id = audience_id
    `;

    await db.query(query, values);
  }
}

module.exports = Audience;
