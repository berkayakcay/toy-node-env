import "reflect-metadata";

const ENV_VAR_KEY = Symbol("envVarKey");

/**
 * Decorator to associate a property with a specific environment variable name.
 * @param name - The environment variable name.
 */
export function EnvironmentVariable(name: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(ENV_VAR_KEY, name, target, propertyKey);
  };
}

/**
 * Retrieve the environment variable name associated with a property.
 * @param target - The target object.
 * @param propertyKey - The property key.
 * @returns The environment variable name, if set.
 */
export function getEnvironmentVariableName(
  target: any,
  propertyKey: string
): string | undefined {
  return Reflect.getMetadata(ENV_VAR_KEY, target, propertyKey);
}
