import {
  MODE,
  get,
  dummy,
  isUndefined,
  isNullOrUndefined,
  isContextPath,
  resoveContextPath,
} from "./utils";
import { EXECUTORS } from "./executors";
import { Scope } from "./scope";
import { TConstructor, TMappingSchema, TOptions, TScope } from "./types";

export class FieldMapper {
  scope: TScope;

  constructor(keys: string[] = []) {
    this.scope = new Scope();
    this.scope.keys = keys;
  }

  type(constructor: TConstructor) {
    this.scope.type = constructor;
    return this;
  }

  pipe(...fns: Function[]) {
    this.scope.actions.push(...fns);
    return this;
  }

  fallback(value: Function | unknown) {
    this.scope.fallback = typeof value === "function" ? value : () => value;
    return this;
  }

  apply(schema: TMappingSchema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.APPLY;
    return this;
  }

  map(schema: TMappingSchema) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.MAP;
    return this;
  }

  mapWhen(schema: TMappingSchema, predicate: Function = dummy) {
    this.scope.childSchema = schema;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.MAP_WHEN;
    return this;
  }

  switch(switchMap: Record<string, TMappingSchema>, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.SWITCH;
    return this;
  }

  switchMap(switchMap: Record<string, TMappingSchema>, predicate = dummy) {
    this.scope.switchMap = switchMap;
    this.scope.predicate = predicate;
    this.scope.mode = MODE.SWITCH_MAP;
    return this;
  }

  reduce(predicate = dummy, schema: TMappingSchema) {
    this.scope.predicate = predicate;
    this.scope.childSchema = schema;
    this.scope.mode = MODE.REDUCE;
    return this;
  }

  _setDestination(path: string) {
    if (!this.scope.keys.length) {
      this.scope.keys = [path];
    }
    return this;
  }

  _execute(data: unknown, options: TOptions) {
    const values = this.scope.keys.map((key) => {
      const [source, path] = isContextPath(options.contextPrefix, key)
        ? [options.context, resoveContextPath(options.contextPrefix, key)]
        : [data, key];
      return get(source, path);
    });

    const value = EXECUTORS[this.scope.mode](
      this.scope,
      //@ts-ignore
      this.scope.withActions(values),
      options
    );

    const withType =
      isUndefined(this.scope.type) || isNullOrUndefined(value)
        ? value
        : //@ts-ignore
          this.scope.type(value);

    return Number.isNaN(withType) ? undefined : withType;
  }
}
