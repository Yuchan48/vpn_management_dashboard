/*
Initial goal:
Create a function:
generateKeyPair()
Return:
{
  publicKey,
  privateKey
}
*/

/*
this is for development only. In production, you should use WireGuard's official tools to generate keys securely.
*/
const crypto = require("crypto");

function generatePrivateKey() {
  // WireGuard private keys are 32 bytes (256 bits)
  return crypto.randomBytes(32).toString("base64");
}

function generatePublicKey(privateKey) {
  return privateKey.slice(0, 32); // Generate a mock “public key”. In a real implementation, you'd derive the public key from the private key using WireGuard's key generation algorithm.
}

function generateKeyPair() {
  const privateKey = generatePrivateKey();
  const publicKey = generatePublicKey(privateKey);
  return { publicKey, privateKey };
}

module.exports = {
  generateKeyPair,
};

/*
This is for production. You need to make sure that the wirecard tools are installed on your server and use them to generate keys securely. You can use the child_process module to call the wg genkey and wg pubkey commands.
*/
/*
const { execSync } = require("child_process");

function generateKeyPair() {
  // wg genkey generates a private key
  const privateKey = execSync("wg genkey", { encoding: "utf-8" }).trim();

  // wg pubkey generates the corresponding public key from the private key
  const publicKey = execSync(`echo "${privateKey}" | wg pubkey`, {
    encoding: "utf-8",
  }).trim();
  return { publicKey, privateKey };
}

module.exports = {
  generateKeyPair,
};
 */
