function validateEnvVariables() {
  const requiredVariables = [
    "JWT_SECRET",
    "SERVER_PUBLIC_KEY",
    "SERVER_ENDPOINT",
    "DNS_SERVER",
    "VPN_SUBNET_MASK",
  ];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
    process.exit(1);
  }

  console.log("Environment variables validated.");
}

module.exports = {
  validateEnvVariables,
};
