require("dotenv").config();
const { log } = require("console");
const clientService = require("../services/client.service");
const { generateKeyPair } = require("../utils/wireguard");
const fs = require("fs");

async function migrateKeys() {
  try {
    const clients = await clientService.getAllClients();
    console.log(`Migrating keys for ${clients.length} clients`);

    for (const client of clients) {
      console.log(`Migrating keys for client: ${client.name} (${client.id})`);

      // genera a wireguard key pair
      const { publicKey, privateKey } = generateKeyPair();

      // update the client record with the new keys
      await clientService.updateClientPublicKey(
        client.id,
        publicKey,
        privateKey,
      );

      console.log(`Client ${client.id} - ${client.name}`);
      console.log(`  Public Key:  ${publicKey}`);
      console.log(`  Private Key: ${privateKey}`);
      console.log("---------------");
    }

    console.log("All client keys migrated successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

migrateKeys();
