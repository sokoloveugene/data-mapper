export interface TScope {
  mode: string;
  keys: string[];
  actions: TConverter[];
  fallback: Function;
  childSchema?: TMappingSchema | Record<string, TMappingSchema>;
  filter: Function;
  keygen: Function;
  each: boolean;
  type?: TConverter;
  withActions: (initial: any) => unknown;
}

export type TConverter = (...args: any[]) => any;

export interface FieldMapper {
  // type(constructor: TConstructor): this;
  // pipe(...fns: Function[]): this;
  // fallback<T>(value: T): this;
  // apply(schema: TMappingSchema): this;
  // map(schema: TMappingSchema): this;
  // when(predicate: Function): this;
  // switch(schema: Record<string, TMappingSchema>, predicate: Function): this;
  // reduce(predicate: Function, schema: TMappingSchema): this;
  // _setDestination(path: string): this;
  // _execute(data: unknown, context: unknown): Record<string, any>;
}

export type TMappingSchema = Record<string, FieldMapper>;

export type TOptions = {
  context: unknown;
  contextPrefix: string;
};
