import { isUndefined, MODE, set } from "./utils";

const EXTENDS = "__EXTENDS__";

const extendsRecord = {
  [EXTENDS]: { type: "extends", optional: false, child: null },
};

const typeFromSchema = (schema) => {
  const types = {};

  for (const key of Object.keys(schema)) {
    if (key.startsWith("...")) {
      Object.assign(types, extendsRecord);
    } else {
      set(types, key, schema[key]?.scope?.getTypeDefinition());
    }
  }

  return types;
};

export function _getRootTypeDefinition(scope) {
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

export function _getChildTypeDefinition(scope) {
  const { mode, switchMap, childSchema } = scope;
  if (MODE.DEFAULT === mode) {
    return null;
  }

  if (mode === MODE.SWITCH || mode === MODE.SWITCH_MAP) {
    return Object.values(switchMap).map((schemaVariant) =>
      typeFromSchema(schemaVariant)
    );
  }

  return typeFromSchema(childSchema);
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
    const separator = optional || !type ? "?:" : ":";
    const union = Array.isArray(child)
      ? child.map((i) => parseProperties(i)).join("|")
      : "";
    const tail = ";";
    const arrayGeneric = (body) => `Array<${body}>`;
    const recordGeneric = (body) => `Record<string, ${body}>`;

    let value = type;

    if (rawKey === EXTENDS) {
      // spread feature
      lines.push(`[property: string]: any`);
      continue;
    }

    if (isUndefined(obj[rawKey])) {
      // static prop case
      value = "any";
    }

    if (obj[rawKey] && !type) {
      // nested
      value = parseProperties(obj[rawKey]);
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
