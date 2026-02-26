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

function createClient({
  name,
  public_key = null,
  private_key = null,
  ip_address = null,
}) {
  // We return a new Promise because the database operations are asynchronous. This allows us to use async/await or .then/.catch when calling these functions from our routes.
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO clients (name, public_key, private_key, ip_address) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, public_key, private_key, ip_address], function (err) {
      if (err) {
        // reject means there was an error during the operation, and we can return the error message
        reject(err);
      } else {
        // resolve means the operation was successful, and we can return the new client's ID, name, public key, private key, and IP address. this.lastID is a special property provided by sqlite3 that contains the ID of the last inserted row, which in this case is the new client we just added to the database.
        resolve({ id: this.lastID, name, public_key, private_key, ip_address }); // this.lastID contains the ID of the newly inserted client
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
