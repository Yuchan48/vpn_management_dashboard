const db = require("../database/db");

// Create a client in the database.
async function createClient({ name, publicKey, ipAddress, userId }) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO clients (name, public_key, ip_address, user_id) VALUES (?, ?, ?, ?)`;

    db.run(query, [name, publicKey, ipAddress, userId], function (err) {
      if (err) {
        reject(err);
      } else {
        // Return the created client object, including the newly assigned ID (this.lastID))
        resolve({
          id: this.lastID,
          name,
          public_key: publicKey,
          ip_address: ipAddress,
          user_id: userId,
        });
      }
    });
  });
}

// Get a client by ID from the database.
async function getClientById({ clientId, user }) {
  return new Promise((resolve, reject) => {
    const query =
      user.role === "admin"
        ? "SELECT * FROM clients WHERE id = ?"
        : "SELECT * FROM clients WHERE id = ? AND user_id = ?";

    const params = user.role === "admin" ? [clientId] : [clientId, user.id];
    db.get(query, params, (err, row) => {
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
    const query =
      "SELECT clients.id, clients.name, clients.public_key, clients.ip_address, clients.user_id, users.username FROM clients JOIN users ON clients.user_id = users.id ORDER BY clients.user_id ASC, clients.id ASC;";
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // rows is an array of client objects retrieved from the database
      }
    });
  });
}
// Returns an array of all client objects associated with a specific user ID from the database.
async function getClientsByUserId(userId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM clients WHERE user_id = ? ORDER BY id";
    db.all(query, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // rows is an array of client objects associated with the given user ID
      }
    });
  });
}

// Delete a client by ID from the database.
function deleteClient({ clientId, user }) {
  return new Promise((resolve, reject) => {
    const query =
      user.role === "admin"
        ? "DELETE FROM clients WHERE id = ?"
        : "DELETE FROM clients WHERE id = ? AND user_id = ?";
    const params = user.role === "admin" ? [clientId] : [clientId, user.id];
    db.run(query, params, function (err) {
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

function updateClientPublicKey(id, newPublicKey) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE clients SET public_key = ? WHERE id = ?";
    db.run(query, [newPublicKey, id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
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
  getClientsByUserId,
  deleteClient,
  updateClientPublicKey,
};
