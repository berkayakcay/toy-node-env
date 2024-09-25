// src/envalidation.ts

import { z, ZodTypeAny, ZodType, ZodTypeDef } from "zod";

// Extend ZodType to add .env() method
declare module "zod" {
  interface ZodTypeDef {
    env?: string;
  }

  interface ZodType<
    Output = any,
    Def extends ZodTypeDef = ZodTypeDef,
    Input = Output
  > {
    env(envVarName: string): this;
  }
}

(ZodType.prototype as any).env = function (envVarName: string) {
  this._def.env = envVarName;
  return this;
};

export const envalidation = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  object: <T extends z.ZodRawShape>(shape: T) => z.object(shape),
  array: <T extends ZodTypeAny>(schema: T) => z.array(schema),
  enum: <T extends [string, ...string[]]>(values: T) => z.enum(values),
  // Add other schema types as needed
};

export type TypeOf<T extends ZodTypeAny> = T["_type"];
