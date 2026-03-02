/*
Insert client into DB
Query clients
Delete client

Example responsibilities:
createClient(name)
getAllClients()
deleteClient(id)
*/

const db = require("../database/db");
const { generateKeyPair } = require("../utils/wireguard");
// const { getNextAvailableIp } = require("../utils/ipAllocator");

function createClient({ name }) {
  // Generate WireGuard key pair for the new client
  const { publicKey, privateKey } = generateKeyPair();

  return new Promise((resolve, reject) => {
    const query = `INSERT INTO clients (name, public_key, private_key, ip_address) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, publicKey, privateKey, null], function (err) {
      if (err) {
        // reject means there was an error during the operation, and we can return the error message
        reject(err);
      } else {
        // when operation was successful
        resolve({
          id: this.lastID,
          name,
          public_key: publicKey,
          private_key: privateKey,
          ip_address: null,
        }); // this.lastID contains the ID of the newly inserted client
      }
    });
  });
}

function getAllClients() {
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
        // If the delete operation was successful, we resolve without any data since the client has been removed.
        resolve();
      }
    });
  });
}

module.exports = {
  createClient,
  getAllClients,
  deleteClient,
};
