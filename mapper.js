import {
  get,
  set,
  isInstanceOf,
  isUndefined,
  dummy,
  isObject,
} from "./utils.js";
import { typeCheck } from "./type-check.js";

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
  constructor(keys = []) {
    this.keys = keys;
    this.mappers = [];
    this.default = undefined;
    this.childSchema = undefined;
    this.switchMap = {};
    this.predicate = dummy;
    this.types = [];
    this.mode = MODE.DEFAULT;
  }

  pipe(...fns) {
    this.mappers.push(...fns);
    return this;
  }

  type(...types) {
    this.types = types;
    return this;
  }

  fallback(value) {
    this.default = typeof value === "function" ? value() : value;
    return this;
  }

  apply(schema) {
    this.childSchema = schema;
    this.mode = MODE.APPLY_SCHEMA;
    return this;
  }

  applyEvery(schema) {
    this.childSchema = schema;
    this.mode = MODE.APPLY_SCHEMA_EVERY;
    return this;
  }

  applyOnly(schema, predicate = dummy) {
    this.childSchema = schema;
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
      [MODE.APPLY_SCHEMA]: (value) => convert(this.childSchema, value),
      [MODE.APPLY_SCHEMA_EVERY]: (values) => {
        const mapped = values?.map((value) => convert(this.childSchema, value));
        return isUndefined(mapped) ? this.default : mapped;
      },
      [MODE.APPLY_SCHEMA_ONLY]: (values) => {
        const mapped = values?.reduce((acc, value) => {
          const isValid = this.predicate(value);
          return isValid ? [...acc, convert(this.childSchema, value)] : acc;
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
    if (!this.keys.length) {
      this.keys = [path];
    }
    return this;
  }

  _validate(args) {
    const error = typeCheck(this.keys, args, this.types);
    if (error) console.log(error);
  }

  _execute(data) {
    const initial = this.keys.map((key) => get(data, key));

    this._validate(initial);

    const [calculated] = this.mappers.reduce(
      (composed, f) => [f(...composed)],
      initial
    );

    return this.executor(calculated);
  }
}

export const pick = (...keys) => new Mapper(keys);
