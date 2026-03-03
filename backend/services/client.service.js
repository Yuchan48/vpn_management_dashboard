/*
Insert client into DB
Query clients
Delete client
*/

const db = require("../database/db");
// const { generateKeyPair } = require("../utils/wireguard");
// const { getNextAvailableIp } = require("../utils/ipAllocator");

// Create a client in the database.
async function createClient({ name, publicKey, ipAddress }) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO clients (name, public_key, ip_address) VALUES (?, ?, ?)`;

    db.run(query, [name, publicKey, ipAddress], function (err) {
      if (err) {
        reject(err);
      } else {
        // Return the created client object, including the newly assigned ID (this.lastID))
        resolve({
          id: this.lastID,
          name,
          public_key: publicKey,
          ip_address: ipAddress,
        });
      }
    });
  });
}

// Get a client by ID from the database.
async function getClientById(id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM clients WHERE id = ?";

    db.get(query, [id], (err, row) => {
      // The id parameter is passed as an array to prevent SQL injection. As SQLite treats [id] as data, and not SQL code.
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error("Client not found"));
      } else {
        resolve(row); // row is the client object retrieved from the database that matches the given ID
      }
    });
  });
}

// Returns an array of all client objects from the database.
async function getAllClients() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM clients";
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // rows is an array of client objects retrieved from the database
      }
    });
  });
}

// Delete a client by ID from the database.
function deleteClient(id) {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM clients WHERE id = ?";
    db.run(query, [id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        // this.changes contains the number of rows affected by the delete operation. If it's 0, it means no client was found with the given ID.
        reject(new Error("Client not found"));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  createClient,
  getClientById,
  getAllClients,
  deleteClient,
};
