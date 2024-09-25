// src/parser.ts

import { z, ZodTypeAny } from "zod";

function getEnvVarName(schema: ZodTypeAny): string | undefined {
  const env = (schema._def as any).env;
  if (env) {
    return env;
  } else if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable
  ) {
    return getEnvVarName(schema.unwrap());
  } else if (schema instanceof z.ZodDefault) {
    return getEnvVarName(schema.removeDefault());
  } else if (schema instanceof z.ZodEffects) {
    return getEnvVarName(schema.innerType());
  } else {
    return undefined;
  }
}

function traverseSchema(
  schema: ZodTypeAny,
  path: string[] = []
): [string[], ZodTypeAny][] {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    let entries: [string[], ZodTypeAny][] = [];
    for (const key in shape) {
      const childSchema = shape[key];
      const childEntries = traverseSchema(childSchema, [...path, key]);
      entries = entries.concat(childEntries);
    }
    return entries;
  } else {
    const envVarName = getEnvVarName(schema);
    if (envVarName) {
      return [[path, schema]];
    } else {
      return [];
    }
  }
}

export function loadConfig<T>(schema: z.ZodType<T>): T {
  const envMappings = traverseSchema(schema);

  const configObject: any = {};

  for (const [path, schema] of envMappings) {
    const envVarName = getEnvVarName(schema);
    if (!envVarName) continue;

    const envValue = process.env[envVarName];

    let parsedValue: any;

    if (envValue === undefined) {
      // Check for default value
      if (schema.isOptional()) {
        continue; // Skip if optional
      }

      try {
        parsedValue = (schema as any)._def.defaultValue?.();
        if (parsedValue === undefined) {
          throw new Error(
            `Environment variable ${envVarName} is required but not set.`
          );
        }
      } catch {
        throw new Error(
          `Environment variable ${envVarName} is required but not set.`
        );
      }
    } else {
      // Parse the value according to the schema type
      if (schema instanceof z.ZodNumber) {
        parsedValue = Number(envValue);
      } else if (schema instanceof z.ZodBoolean) {
        parsedValue = envValue === "true";
      } else {
        parsedValue = envValue;
      }
    }

    // Set the parsed value in the config object
    let current = configObject;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        current[key] = parsedValue;
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  }

  // Validate and parse the configuration
  try {
    const parsedConfig = schema.parse(configObject);
    return parsedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format the validation errors
      const errorMessages = error.errors
        .map((issue) => {
          const path = issue.path.join(".");
          return `- ${path}: ${issue.message}`;
        })
        .join("\n");

      // Throw a new error with the formatted messages
      console.log(error.errors);
      throw new Error(
        `Configuration validation failed: ${errorMessages}\n${error.message}`
      );
    } else {
      // Re-throw other unexpected errors
      throw error;
    }
  }
}
