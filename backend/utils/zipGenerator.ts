import archiver from "archiver";
import { generateClientConfig } from "./configGenerator";

import type { Response } from "express";
import type { Client } from "../types/client";

export function zipGenerator(
  res: Response,
  client: Client,
  privateKey: string,
): void {
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
