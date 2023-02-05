export declare interface Scope {
  mode: string;
  keys: string[];
  actions: Function[];
  fallback: Function;
  childSchema?: MappingSchema;
  switchMap: Record<string, MappingSchema>;
  predicate: Function;
}

export declare interface Mapper {
  pipe(...fns: Function[]): this;
  fallback<T>(value: T): this;
  apply(schema: MappingSchema): this;
  map(schema: MappingSchema): this;
  mapWhen(schema: MappingSchema, predicate: Function): this;
  switch(switchMap: Record<string, MappingSchema>, predicate: Function): this;
  switchMap(switchMap: Record<string, MappingSchema>, predicat: Function): this;
  reduce(predicate: Function, schema: MappingSchema): this;
  _setDestination(path: string): this;
  _execute(data: unknown): Record<string, any>;
}

export declare type MappingSchema = Record<string, Mapper>;

export declare const convert = (schema: MappingSchema, data: unknown) =>
  Record<string, unknown>;
