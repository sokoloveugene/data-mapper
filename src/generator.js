import { isUndefined, MODE } from "./utils";

/**
 * TODO cover spread feature
 */

export const typeFromSchema = (schema) =>
  Object.keys(schema).reduce(
    (acc, key) => ({ ...acc, [key]: schema[key]?.scope?.getTypeDefinition() }),
    {}
  );

export function getRootTypeDefinition(scope) {
  const { type, mode } = scope;
  if (type === String) {
    return "string";
  }

  if (type === Number) {
    return "number";
  }

  if (type === Boolean) {
    return "boolean";
  }

  if (mode === MODE.MAP || mode === MODE.MAP_WHEN || mode === MODE.SWITCH_MAP) {
    return "array";
  }

  if (mode === MODE.APPLY || mode === MODE.SWITCH) {
    return "object";
  }

  if (mode === MODE.REDUCE) {
    return "record";
  }

  return "unknown";
}

export function getChildTypeDefinition(scope) {
  const { mode, switchMap, childSchema } = scope;
  if (MODE.DEFAULT === mode) {
    return null;
  }

  if (mode === MODE.SWITCH || mode === MODE.SWITCH_MAP) {
    return Object.values(switchMap).map((schemaVariant) =>
      typeFromSchema(schemaVariant)
    );
  }

  return Object.keys(childSchema).reduce(
    (acc, key) => ({
      ...acc,
      [key]: childSchema[key].scope.getTypeDefinition(),
    }),
    {}
  );
}
export function getInterface(obj) {
  const parsedTypes = typeFromSchema(obj);
  return ["interface Schema", parseProperties(parsedTypes)].join("\n");
}

function parseProperties(obj) {
  const lines = ["{"];

  for (const rawKey of Object.keys(obj)) {
    const { type, optional, child } = obj[rawKey] ?? {};
    const key = `"${rawKey}"`;
    const separator = optional ? "?:" : ":";
    const union = Array.isArray(child)
      ? child.map((i) => parseProperties(i)).join("|")
      : "";
    const tail = ";";
    const arrayGeneric = (body) => `Array<${body}>`;
    const recordGeneric = (body) => `Record<string, ${body}>`;

    let value = type;

    if (isUndefined(obj[rawKey])) {
      // static prop case
      value = "any";
    }

    if (type === "object") {
      if (Array.isArray(child)) {
        value = union;
      } else {
        value = parseProperties(child);
      }
    }

    if (type === "array") {
      if (Array.isArray(child)) {
        value = arrayGeneric(union);
      } else {
        value = arrayGeneric(parseProperties(child));
      }
    }

    if (type === "record") {
      value = recordGeneric(parseProperties(child));
    }

    lines.push(`${key}${separator}${value}${tail}`);
  }

  lines.push("}");

  return lines.join("\n");
}
