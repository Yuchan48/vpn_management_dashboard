const archiver = require("archiver");
const { generateClientConfig } = require("../utils/wireguardConfigGenerator");

function zipGenerator(res, client, privateKey) {
  const filename = `${client.name}.conf`;

  res.setHeader("Content-Type", "application/zip");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${client.name}.zip`,
  );

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("Error creating zip archive:", err);
    res.status(500).json({ error: "Failed to create zip archive" });
  });

  archive.pipe(res);

  const configContent = generateClientConfig(client, privateKey);

  archive.append(configContent, {
    name: filename,
  });

  archive.finalize();
}

module.exports = { zipGenerator };
