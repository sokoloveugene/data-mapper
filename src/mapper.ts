import {
  MODE,
  get,
  isUndefined,
  isNullOrUndefined,
  isContextPath,
  resoveContextPath,
} from "./utils";
import { EXECUTORS } from "./executors";
import { Scope } from "./scope";
import { TMappingSchema, TOptions, TConverter } from "./types";

export class FieldMapper {
  scope = new Scope();

  constructor(keys: string[] = []) {
    this.scope.keys = keys;
  }

  type(converter: TConverter) {
    this.scope.type = converter;
    return this;
  }

  pipe(...converters: TConverter[]) {
    this.scope.actions.push(...converters);
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

  each(filter?: Function) {
    this.scope.each = true;
    if (filter) {
      this.scope.filter = filter;
    }
    return this;
  }

  switch(schema: Record<string, TMappingSchema>) {
    this.scope.childSchema = schema;
    this.scope.mode = MODE.SWITCH;
    return this;
  }

  case(keygen: Function) {
    this.scope.keygen = keygen;
    return this;
  }

  reduce(schema: TMappingSchema) {
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

    return isUndefined(this.scope.type) || isNullOrUndefined(value)
      ? value
      : //@ts-ignore
        this.scope.type(value);
  }
}
