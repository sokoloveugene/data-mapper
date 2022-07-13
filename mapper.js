import {
  get,
  set,
  isInstanceOf,
  isUndefined,
  dummy,
  isObject,
} from "./utils.js";

export const convert = (schema, data) => {
  if (!isObject(data)) return;

  const result = {};

  for (const [destination, config] of Object.entries(schema)) {
    const value = isInstanceOf(config, "Mapper")
      ? config._setDestination(destination)._execute(data)
      : config;

    if (isUndefined(value)) continue;

    set(result, destination, value);
  }

  return result;
};

const MODE = {
  DEFAULT: "DEFAULT",
  APPLY_SCHEMA: "APPLY_SCHEMA",
  APPLY_SCHEMA_EVERY: "APPLY_SCHEMA_EVERY",
  APPLY_SCHEMA_ONLY: "APPLY_SCHEMA_ONLY",
  APPLY_SWITCH: "APPLY_SWITCH",
  APPLY_SWITCH_EVERY: "APPLY_SWITCH_EVERY",
};

class Mapper {
  constructor(from = []) {
    this.from = from;
    this.mappers = [];
    this.default = undefined;
    this.nestedSchema = undefined;
    this.switchMap = {};
    this.predicate = dummy;
    this.mode = MODE.DEFAULT;
  }

  pipe(...fns) {
    this.mappers.push(...fns);
    return this;
  }

  fallback(value) {
    this.default = typeof value === "function" ? value() : value;
    return this;
  }

  apply(schema) {
    this.nestedSchema = schema;
    this.mode = MODE.APPLY_SCHEMA;
    return this;
  }

  applyEvery(schema) {
    this.nestedSchema = schema;
    this.mode = MODE.APPLY_SCHEMA_EVERY;
    return this;
  }

  applyOnly(schema, predicate = dummy) {
    this.nestedSchema = schema;
    this.predicate = predicate;
    this.mode = MODE.APPLY_SCHEMA_ONLY;
    return this;
  }

  applySwitch(switchMap, predicate = dummy) {
    this.switchMap = switchMap;
    this.predicate = predicate;
    this.mode = MODE.APPLY_SWITCH;
    return this;
  }

  applySwitchEvery(switchMap, predicate = dummy) {
    this.switchMap = switchMap;
    this.predicate = predicate;
    this.mode = MODE.APPLY_SWITCH_EVERY;
    return this;
  }

  get executor() {
    return {
      [MODE.DEFAULT]: (value) => (isUndefined(value) ? this.default : value),
      [MODE.APPLY_SCHEMA]: (value) => convert(this.nestedSchema, value),
      [MODE.APPLY_SCHEMA_EVERY]: (values) => {
        const mapped = values?.map((value) =>
          convert(this.nestedSchema, value)
        );
        return isUndefined(mapped) ? this.default : mapped;
      },
      [MODE.APPLY_SCHEMA_ONLY]: (values) => {
        const mapped = values?.reduce((acc, value) => {
          const isValid = this.predicate(value);
          return isValid ? [...acc, convert(this.nestedSchema, value)] : acc;
        }, []);
        return isUndefined(mapped) || !mapped.length ? this.default : mapped;
      },
      [MODE.APPLY_SWITCH]: (value) => {
        const type = this.predicate(value);
        const schemaByType = this.switchMap[type];
        const result = schemaByType ? convert(schemaByType, value) : undefined;
        return isUndefined(result) ? this.default : result;
      },
      [MODE.APPLY_SWITCH_EVERY]: (values) => {
        const mapped = values?.reduce((acc, value) => {
          const type = this.predicate(value);
          const schemaByType = this.switchMap[type];
          const isValid = !!schemaByType;
          return isValid ? [...acc, convert(schemaByType, value)] : acc;
        }, []);
        return isUndefined(mapped) || !mapped.length ? this.default : mapped;
      },
    }[this.mode];
  }

  _setDestination(path) {
    if (!this.from.length) {
      this.from = [path];
    }
    return this;
  }

  _execute(data) {
    const initial = this.from.map((key) => get(data, key));

    const [calculated] = this.mappers.reduce(
      (composed, f) => [f(...composed)],
      initial
    );

    return this.executor(calculated);
  }
}

export const pick = (...keys) => new Mapper(keys);
