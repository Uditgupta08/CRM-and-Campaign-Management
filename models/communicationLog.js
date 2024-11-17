const db = require("../config/db");

class CommunicationLog {
  static async initialize() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS communication_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        audience_id INT,
        customer_id INT,
        message TEXT,
        status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING',
        FOREIGN KEY (audience_id) REFERENCES audiences(audience_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `);
  }
  static async logMessage(data) {
    try {
      const [result] = await db.query(
        "INSERT INTO communication_logs (audience_id, customer_id, message, status) VALUES (?, ?, ?, ?)",
        [data.audience_id, data.customer_id, data.message, "PENDING"]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Failed to log message: " + error.message);
    }
  }

  static async updateStatus(logId, status) {
    try {
      const validStatuses = ["SENT", "FAILED"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }

      const [result] = await db.query(
        "UPDATE communication_logs SET status = ? WHERE log_id = ?",
        [status, logId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error("Failed to update status: " + error.message);
    }
  }
  static async getStatistics(audience_id) {
    try {
      const [results] = await db.query(
        `SELECT 
          COUNT(*) AS total_sent,
          SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) AS sent_count,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count
        FROM communication_logs 
        WHERE audience_id = ?`,
        [audience_id]
      );
      return results[0];
    } catch (error) {
      throw new Error("Failed to fetch campaign statistics: " + error.message);
    }
  }
  static async getByAudienceId(audienceId) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM communication_logs WHERE audience_id = ?",
        [audienceId]
      );
      return rows;
    } catch (error) {
      throw new Error("Failed to fetch logs by audience ID: " + error.message);
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM communication_logs");
      return rows;
    } catch (error) {
      throw new Error("Failed to fetch all logs: " + error.message);
    }
  }

  static async getById(logId) {
    try {
      const [rows] = await db.query(
        `
        SELECT 
          cl.log_id,
          cl.audience_id,
          cl.customer_id,
          cl.message,
          cl.status,
          a.name AS audience_name,
          c.name AS customer_name
        FROM 
          communication_logs cl
        LEFT JOIN 
          audiences a ON cl.audience_id = a.audience_id
        LEFT JOIN 
          customers c ON cl.customer_id = c.customer_id
        WHERE 
          cl.log_id = ?
        `,
        [logId]
      );

      if (rows.length > 0) {
        const log = rows[0];
        log.audience_name = log.audience_name || "No Audience Assigned";
        return log;
      }
      return null;
    } catch (error) {
      throw new Error("Failed to fetch log details: " + error.message);
    }
  }
}
module.exports = CommunicationLog;
