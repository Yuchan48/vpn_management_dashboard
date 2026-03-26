const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  const env = process.env.NODE_ENV || "development";
  const envPath = path.resolve(__dirname, `.env.${env}`);
  dotenv.config({ path: envPath });
  console.log(`Loaded environment variables from ${env}`);
}

module.exports = {
  loadEnv,
};
