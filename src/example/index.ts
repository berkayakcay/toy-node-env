import "reflect-metadata"; // Must be imported at the entry point
import { loadConfig } from ".."; // Adjust the import path accordingly
import { AppConfig } from "./config";

try {
  const config = loadConfig(AppConfig);

  // Access configuration properties
  console.log("Host:", config.apis.internal.common.host);
  console.log("Client ID:", config.apis.internal.common.oAuth.clientId);
  console.log("AES Key:", config.constants.aesKey);
} catch (error: any) {
  console.error("Error loading configuration:", error.message);
  process.exit(1);
}
