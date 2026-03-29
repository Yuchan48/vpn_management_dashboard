const { execFileSync, exec } = require("child_process");

function generateKeyPair() {
  // wg genkey generates a private key
  const privateKey = execFileSync("wg", ["genkey"], {
    encoding: "utf-8",
  }).trim();

  // wg pubkey generates the corresponding public key from the private key
  const publicKey = execFileSync("wg", ["pubkey"], {
    input: privateKey,
    encoding: "utf-8",
  }).trim();
  return { publicKey, privateKey };
}

module.exports = {
  generateKeyPair,
};
