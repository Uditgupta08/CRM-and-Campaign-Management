const db = require("../config/db");

class Campaign {
  static async initialize() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        campaign_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        audience_id INT,
        sent_date DATETIME NOT NULL,
        FOREIGN KEY (audience_id) REFERENCES audiences(audience_id)
      )
    `);
  }

  static async create(data) {
    const { name, audience_id, sent_date } = data;
    const [result] = await db.query(
      "INSERT INTO campaigns (name, audience_id, sent_date) VALUES (?, ?, ?)",
      [name, audience_id, sent_date]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.query(`
      SELECT campaigns.campaign_id, campaigns.name, campaigns.sent_date, audiences.name AS audienceName
      FROM campaigns
      LEFT JOIN audiences ON campaigns.audience_id = audiences.audience_id
      ORDER BY campaigns.sent_date DESC
    `);
    return rows;
  }

  static async getById(campaignId) {
    const [rows] = await db.query(
      `
      SELECT campaigns.*, audiences.name AS audienceName
      FROM campaigns
      LEFT JOIN audiences ON campaigns.audience_id = audiences.audience_id
      WHERE campaigns.campaign_id = ?
      `,
      [campaignId]
    );
    return rows[0];
  }

  static async getByAudienceId(audienceId) {
    const [rows] = await db.query(
      "SELECT * FROM campaigns WHERE audience_id = ?",
      [audienceId]
    );
    return rows;
  }

  static async updateStatus(campaignId, status) {
    const [result] = await db.query(
      "UPDATE campaigns SET status = ? WHERE campaign_id = ?",
      [status, campaignId]
    );
    return result.affectedRows;
  }

  static async updateCampaign(campaignId, data) {
    const { name, message, audience_id, status } = data;
    const [result] = await db.query(
      "UPDATE campaigns SET name = ?, message = ?, audience_id = ?, status = ? WHERE campaign_id = ?",
      [name, message, audience_id, status, campaignId]
    );
    return result.affectedRows;
  }

  static async delete(campaignId) {
    const [result] = await db.query(
      "DELETE FROM campaigns WHERE campaign_id = ?",
      [campaignId]
    );
    return result.affectedRows;
  }
}

module.exports = Campaign;
