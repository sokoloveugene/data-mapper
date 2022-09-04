import {
  get,
  set,
  isInstanceOf,
  isUndefined,
  dummy,
  isObject,
  notEmpty,
  toError,
} from "./utils.js";
import { typeCheck } from "./type-check.js";
import { MODE } from "./mode";
import { EXECUTORS } from "./executors";

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
    throw new Error(toError(errorStorage));
  }

  return result;
};

class Scope {
  constructor() {
    this.mode = MODE.DEFAULT;
    this.keys = [];
    this.mappers = [];
    this.fallback = undefined;
    this.childSchema = undefined;
    this.switchMap = {};
    this.predicate = dummy;
    // Types
    this.types = [];
    this.errorStorage = undefined;
    this.prefixes = [];
  }
}

class Mapper {
  constructor(keys = []) {
    this.scope = new Scope();
    this.scope.keys = keys;
  }

  pipe(...fns) {
    this.scope.mappers.push(...fns);
    return this;
  }

  type(...types) {
    this.scope.types = types;
    return this;
  }

  fallback(value) {
    this.scope.fallback = typeof value === "function" ? value() : value;
    return this;
  }

  apply(schema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.APPLY_SCHEMA;
    return this;
  }

  applyEvery(schema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.APPLY_SCHEMA_EVERY;
    return this;
  }

  applyOnly(schema, predicate = dummy) {
    this.scope.childSchema = schema;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.APPLY_SCHEMA_ONLY;
    return this;
  }

  applySwitch(switchMap, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.APPLY_SWITCH;
    return this;
  }

  applySwitchEvery(switchMap, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.APPLY_SWITCH_EVERY;
    return this;
  }

  reduce(predicate = dummy, schema) {
    this.scope.predicate = predicate;
    this.scope.childSchema = schema;
    this.scope.mode = MODE.REDUCE;
    return this;
  }

  _setDestination(path) {
    if (!this.scope.keys.length) {
      this.scope.keys = [path];
    }
    return this;
  }

  _setPrefixes(prefixes) {
    this.scope.prefixes = prefixes;
    return this;
  }

  _setErrorStorage(errorStorage) {
    this.scope.errorStorage = errorStorage;
    return this;
  }

  _validate(args) {
    const errors = typeCheck(this.scope.keys, args, this.scope.types);

    for (const { key, error } of errors) {
      const errorPath = [...this.scope.prefixes, key].join(".");
      this.scope.errorStorage[errorPath] = error;
    }
  }

  _execute(data) {
    const initial = this.scope.keys.map((key) => get(data, key));

    this._validate(initial);

    try {
      const [calculated] = this.scope.mappers.reduce(
        (composed, f) => [f(...composed)],
        initial
      );

      return EXECUTORS[this.scope.mode](this.scope, calculated);
    } catch {}
  }
}

export const pick = (...keys) => new Mapper(keys);
