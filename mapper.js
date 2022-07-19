import {
  get,
  set,
  isInstanceOf,
  isUndefined,
  dummy,
  isObject,
  notEmpty,
  toError
} from "./utils.js";
import { typeCheck } from "./type-check.js";
import fs from "fs";

export const convert = (schema, data, errorStorage, prefixes = []) => {
  if (!isObject(data)) data = {};

  const isRoot = isUndefined(errorStorage)
    ? ((errorStorage = {}), true)
    : false;

  const result = {};

  for (const [destination, config] of Object.entries(schema)) {
    const value = isInstanceOf(config, "Mapper")
      ? config
          ._setDestination(destination)
          ._setPrefixes(prefixes)
          ._setErrorStorage(errorStorage)
          ._execute(data)
      : config;

    if (isUndefined(value)) continue;

    destination.startsWith("...")
      ? Object.assign(result, value)
      : set(result, destination, value);
  }

  if (isRoot && notEmpty(errorStorage)) {
    fs.writeFileSync(
      "example/error.txt",
      JSON.stringify(errorStorage, null, 2)
    );

    throw new Error(toError(errorStorage))
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

    this.errorStorage = undefined;
    this.prefixes = [];
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
      [MODE.APPLY_SCHEMA]: (value) => {
        return convert(this.childSchema, value, this.errorStorage, [
          ...this.prefixes,
          this.keys[0],
        ]);
      },
      [MODE.APPLY_SCHEMA_EVERY]: (values) => {
        const mapped = values?.map((value, index) =>
          convert(this.childSchema, value, this.errorStorage, [
            ...this.prefixes,
            this.keys[0],
            index,
          ])
        );
        return isUndefined(mapped) ? this.default : mapped;
      },
      [MODE.APPLY_SCHEMA_ONLY]: (values) => {
        const mapped = values?.reduce((acc, value, index) => {
          const isValid = this.predicate(value);
          return isValid
            ? [
                ...acc,
                convert(this.childSchema, value, this.errorStorage, [
                  ...this.prefixes,
                  this.keys[0],
                  index,
                ]),
              ]
            : acc;
        }, []);
        return isUndefined(mapped) || !mapped.length ? this.default : mapped;
      },
      [MODE.APPLY_SWITCH]: (value) => {
        const type = this.predicate(value);
        const schemaByType = this.switchMap[type];
        const result = schemaByType
          ? convert(schemaByType, value, this.errorStorage, [
              ...this.prefixes,
              this.keys[0],
            ])
          : undefined;
        return isUndefined(result) ? this.default : result;
      },
      [MODE.APPLY_SWITCH_EVERY]: (values) => {
        const mapped = values?.reduce((acc, value, index) => {
          const type = this.predicate(value);
          const schemaByType = this.switchMap[type];
          const isValid = !!schemaByType;
          return isValid
            ? [
                ...acc,
                convert(schemaByType, value, this.errorStorage, [
                  ...this.prefixes,
                  this.keys[0],
                  index,
                ]),
              ]
            : acc;
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

  _setPrefixes(prefixes) {
    this.prefixes = prefixes;
    return this;
  }

  _setErrorStorage(errorStorage) {
    this.errorStorage = errorStorage;
    return this;
  }

  _validate(args) {
    const errors = typeCheck(this.keys, args, this.types);

    for (const { key, error } of errors) {
      const errorPath = [...this.prefixes, key].join(".");
      this.errorStorage[errorPath] = error;
    }
  }

  _execute(data) {
    const initial = this.keys.map((key) => get(data, key));

    this._validate(initial);

    try {
      const [calculated] = this.mappers.reduce(
        (composed, f) => [f(...composed)],
        initial
      );

      return this.executor(calculated);
    } catch {}
  }
}

export const pick = (...keys) => new Mapper(keys);
