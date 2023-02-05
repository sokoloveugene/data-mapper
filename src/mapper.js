import { MODE, get, dummy } from "./utils.js";
import { EXECUTORS } from "./executors";
import { Scope } from "./scope.js";

export class Mapper {
  constructor(keys = []) {
    this.scope = new Scope();
    this.scope.keys = keys;
  }

  pipe(...fns) {
    this.scope.actions.push(...fns);
    return this;
  }

  fallback(value) {
    this.scope.fallback = typeof value === "function" ? value : () => value;
    return this;
  }

  apply(schema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.APPLY;
    return this;
  }

  map(schema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.MAP;
    return this;
  }

  mapWhen(schema, predicate = dummy) {
    this.scope.childSchema = schema;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.MAP_WHEN;
    return this;
  }

  switch(switchMap, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.SWITCH;
    return this;
  }

  switchMap(switchMap, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.SWITCH_MAP;
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

  _execute(data) {
    const initial = this.scope.keys.map((key) => get(data, key));
    return EXECUTORS[this.scope.mode](
      this.scope,
      this.scope.withActions(initial)
    );
  }
}
