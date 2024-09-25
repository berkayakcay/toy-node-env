// src/parser.ts

import "reflect-metadata";
import { getEnvironmentVariableName } from "./decorators/EnvironmentVariable";
import { ClassConstructor } from "class-transformer";
import { set } from "lodash";
import { getFromContainer, MetadataStorage } from "class-validator";

function getClassProperties(target: Function): string[] {
  const metadataStorage = getFromContainer(MetadataStorage) as any;
  const validations = metadataStorage.getTargetValidationMetadatas(
    target,
    "",
    false,
    false
  );
  const properties = validations.map((meta: any) => meta.propertyName);
  return [...new Set<string>(properties)]; // Remove duplicates
}

export function parseEnv<T>(
  cls: ClassConstructor<T>,
  prefix: string = ""
): any {
  const plainObject: any = {};

  function parseClass(target: any, path: string[] = [], plainObj: any) {
    const properties = getClassProperties(target.constructor);

    for (const property of properties) {
      const propertyType = Reflect.getMetadata("design:type", target, property);
      const envVarName = getEnvironmentVariableName(target, property);

      let envValue;
      if (envVarName) {
        envValue = process.env[envVarName];
      } else {
        // Apply custom mapping rules
        const envKey = [prefix, ...path, property]
          .map((segment) => segment.replace(/([A-Z])/g, "_$1").toUpperCase())
          .join("__");
        envValue = process.env[envKey];
      }

      if (
        propertyType &&
        typeof propertyType === "function" &&
        ![String, Number, Boolean].includes(propertyType)
      ) {
        // Nested object
        const nestedPlainObject = {};
        parseClass(new propertyType(), [...path, property], nestedPlainObject);
        plainObj[property] = nestedPlainObject;
      } else if (envValue !== undefined) {
        plainObj[property] = envValue;
      }
    }
  }

  const instance = new cls();
  parseClass(instance, [], plainObject);

  return plainObject;
}
