import { validateSync } from "class-validator";

export function validateConfig<T>(config: T): T {
  const errors = validateSync(config as any, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed: ${JSON.stringify(errors, null, 2)}`
    );
  }

  return config;
}
