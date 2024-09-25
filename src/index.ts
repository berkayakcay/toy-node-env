// src/index.ts

import "reflect-metadata";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { parseEnv } from "./parser";
import { validateConfig } from "./validator";

// Export the EnvironmentVariable decorator
export { EnvironmentVariable } from "./decorators/EnvironmentVariable";

// Re-export class-validator decorators for convenience
export * from "class-validator";

/**
 * Load and validate the configuration.
 * @param cls - The configuration class.
 * @param prefix - Optional prefix for environment variables.
 * @returns The validated configuration instance.
 */
export function loadConfig<T>(
  cls: ClassConstructor<T>,
  prefix: string = ""
): T {
  const plainObject = parseEnv(cls, prefix);
  const configInstance = plainToInstance(cls, plainObject, {
    enableImplicitConversion: true,
  });
  return validateConfig(configInstance);
}
