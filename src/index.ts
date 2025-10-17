/**
 * ts-unios - A type-safe TypeScript library for working with discriminated unions
 */

/**
 * Discriminated union base type - requires a readonly 'type' property
 */
export type DiscriminatedUnion = {
  readonly type: string;
};

/**
 * Extract the discriminator type(s) from a union
 */
export type ExtractDiscriminator<T extends DiscriminatedUnion> = T extends { readonly type: infer U } ? U : never;

/**
 * Extract a specific variant from a union by its discriminator value
 */
export type ExtractVariant<Union extends DiscriminatedUnion, Type extends ExtractDiscriminator<Union>> =
  Union extends { readonly type: Type } ? Union : never;

/**
 * Type guard functions for each variant
 * Uses TypeScript's intrinsic Capitalize utility type
 */
export type TypeGuards<Union extends DiscriminatedUnion> = {
  [K in ExtractDiscriminator<Union> as `is${Capitalize<string & K>}`]: (
    value: Union
  ) => value is ExtractVariant<Union, K>;
};

/**
 * Map handlers - partial handlers that transform variants and return the same union type
 */
export type MapHandlers<Union extends DiscriminatedUnion> = {
  [K in ExtractDiscriminator<Union>]?: (value: ExtractVariant<Union, K>) => ExtractVariant<Union, K>;
};

/**
 * When handlers - exhaustive pattern matching with consistent return type
 */
export type WhenHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Match handlers - exhaustive pattern matching that transforms to a different type
 */
export type MatchHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Fold handlers - similar to match but with explicit default case
 */
export type FoldHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]?: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Filter predicate for a specific variant type
 */
export type FilterPredicate<T> = (value: T) => boolean;

/**
 * UnionHelpers core methods (without type guards)
 */
export interface UnionHelpersCore<Union extends DiscriminatedUnion> {
  /**
   * Map over a union value, applying transformations only to specified variants.
   * Unhandled variants are returned unchanged.
   *
   * @param value - The union value to map
   * @param handlers - Partial handlers for transforming specific variants
   * @returns The transformed union value
   *
   * @example
   * const result = helpers.map(value, {
   *   AType: (a) => ({ ...a, data: a.data.toUpperCase() })
   * });
   */
  map(value: Union, handlers: MapHandlers<Union>): Union;

  /**
   * Exhaustive pattern matching with a consistent return type.
   * All variants must be handled.
   *
   * @param value - The union value to match
   * @param handlers - Exhaustive handlers for all variants
   * @returns The result of applying the appropriate handler
   *
   * @example
   * const result = helpers.when(value, {
   *   AType: (a) => a.data.length > 5,
   *   BType: (b) => b.data > 10
   * });
   */
  when<R>(value: Union, handlers: WhenHandlers<Union, R>): R;

  /**
   * Match and transform a union value to a different type.
   * Similar to when, but emphasizes type transformation.
   *
   * @param value - The union value to match
   * @param handlers - Exhaustive handlers for all variants
   * @returns The transformed result
   *
   * @example
   * const result = helpers.match(value, {
   *   AType: (a) => ({ status: 'text', content: a.data }),
   *   BType: (b) => ({ status: 'number', content: b.data.toString() })
   * });
   */
  match<R>(value: Union, handlers: MatchHandlers<Union, R>): R;

  /**
   * Filter an array of union values, keeping only specified variant types.
   *
   * @param values - Array of union values
   * @param types - Single type or array of types to keep
   * @returns Filtered array containing only the specified variant types
   *
   * @example
   * const onlyBTypes = helpers.filter(values, 'BType');
   * const aAndB = helpers.filter(values, ['AType', 'BType']);
   */
  filter<K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    types: K | readonly K[]
  ): Array<ExtractVariant<Union, K>>;

  /**
   * Filter an array of union values with custom predicates for each type.
   *
   * @param values - Array of union values
   * @param predicates - Object mapping variant types to filter predicates
   * @returns Filtered array containing only matching variants
   *
   * @example
   * const filtered = helpers.filterBy(values, {
   *   BType: (b) => b.data > 5,
   *   AType: (a) => a.data.length > 3
   * });
   */
  filterBy<K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    predicates: {
      [P in K]: FilterPredicate<ExtractVariant<Union, P>>;
    }
  ): Array<ExtractVariant<Union, K>>;

  /**
   * Fold over a union value with optional handlers and a default case.
   *
   * @param value - The union value
   * @param handlers - Partial handlers for specific variants
   * @param defaultHandler - Handler for unhandled variants
   * @returns The result of applying the appropriate handler
   *
   * @example
   * const result = helpers.fold(
   *   value,
   *   { AType: (a) => a.data.length },
   *   () => 0
   * );
   */
  fold<R>(
    value: Union,
    handlers: FoldHandlers<Union, R>,
    defaultHandler: (value: Union) => R
  ): R;

  /**
   * Partition an array of unions into groups by variant type.
   *
   * @param values - Array of union values
   * @returns Object with discriminator values as keys and arrays of matching variants as values
   *
   * @example
   * const partitioned = helpers.partition(values);
   * // { AType: [...], BType: [...] }
   */
  partition(
    values: readonly Union[]
  ): {
    [K in ExtractDiscriminator<Union>]: Array<ExtractVariant<Union, K>>;
  };

  /**
   * Get the discriminator value from a union instance.
   *
   * @param value - The union value
   * @returns The discriminator value
   */
  getType(value: Union): ExtractDiscriminator<Union>;

  /**
   * Create a type-safe constructor function for a specific variant.
   *
   * @param type - The discriminator value
   * @returns A function that creates instances of the specified variant
   *
   * @example
   * const createA = helpers.constructor('AType');
   * const a = createA({ data: 'hello' });
   */
  constructor<K extends ExtractDiscriminator<Union>>(
    type: K
  ): <T extends ExtractVariant<Union, K>>(
    data: Omit<T, 'type'>
  ) => T;
}

/**
 * UnionHelpers combines core methods with type guards
 */
export type UnionHelpers<Union extends DiscriminatedUnion> = UnionHelpersCore<Union> & TypeGuards<Union>;

/**
 * Create a set of type-safe helpers for working with a discriminated union.
 *
 * @returns An object containing helper methods for the union type
 *
 * @example
 * type MyUnion = AType | BType;
 * const helpers = create<MyUnion>();
 *
 * if (helpers.isAType(value)) {
 *   // value is narrowed to AType
 * }
 */
export function create<Union extends DiscriminatedUnion>(): UnionHelpers<Union> {
  const helpers: any = {};
  const typeGuardCache = new Map<string, Function>();

  // Helper to uncapitalize first letter
  const uncapitalize = (str: string): string => {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  // Implement map
  helpers.map = (value: Union, handlers: MapHandlers<Union>): Union => {
    const handler = handlers[value.type as ExtractDiscriminator<Union>];
    if (handler) {
      return handler(value as any) as Union;
    }
    return value;
  };

  // Implement when (exhaustive pattern matching)
  helpers.when = <R>(value: Union, handlers: WhenHandlers<Union, R>): R => {
    const handler = handlers[value.type as ExtractDiscriminator<Union>];
    if (!handler) {
      throw new Error(`No handler found for type: ${value.type}`);
    }
    return handler(value as any);
  };

  // Implement match (alias for when, but emphasizes transformation)
  helpers.match = <R>(value: Union, handlers: MatchHandlers<Union, R>): R => {
    const handler = handlers[value.type as ExtractDiscriminator<Union>];
    if (!handler) {
      throw new Error(`No handler found for type: ${value.type}`);
    }
    return handler(value as any);
  };

  // Implement filter (simple type-based filtering)
  helpers.filter = <K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    types: K | readonly K[]
  ): Array<ExtractVariant<Union, K>> => {
    const allowedTypes = new Set(Array.isArray(types) ? types : [types]);
    return values.filter((value) => allowedTypes.has(value.type as K)) as Array<ExtractVariant<Union, K>>;
  };

  // Implement filterBy (predicate-based filtering)
  helpers.filterBy = <K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    predicates: {
      [P in K]: FilterPredicate<ExtractVariant<Union, P>>;
    }
  ): Array<ExtractVariant<Union, K>> => {
    const allowedTypes = new Set(Object.keys(predicates));
    return values.filter((value) => {
      if (allowedTypes.has(value.type)) {
        const predicate = predicates[value.type as K];
        return predicate ? predicate(value as any) : false;
      }
      return false;
    }) as Array<ExtractVariant<Union, K>>;
  };

  // Implement fold
  helpers.fold = <R>(
    value: Union,
    handlers: FoldHandlers<Union, R>,
    defaultHandler: (value: Union) => R
  ): R => {
    const handler = handlers[value.type as ExtractDiscriminator<Union>];
    if (handler) {
      return handler(value as any);
    }
    return defaultHandler(value);
  };

  // Implement partition
  helpers.partition = (
    values: readonly Union[]
  ): {
    [K in ExtractDiscriminator<Union>]: Array<ExtractVariant<Union, K>>;
  } => {
    const result = {} as {
      [K in ExtractDiscriminator<Union>]: Array<ExtractVariant<Union, K>>;
    };

    for (const value of values) {
      const type = value.type as ExtractDiscriminator<Union>;
      if (!result[type]) {
        result[type] = [];
      }
      result[type].push(value as any);
    }

    return result;
  };

  // Implement getType
  helpers.getType = (value: Union): ExtractDiscriminator<Union> => {
    return value.type as ExtractDiscriminator<Union>;
  };

  // Implement constructor
  helpers.constructor = <K extends ExtractDiscriminator<Union>>(type: K) => {
    return <T extends ExtractVariant<Union, K>>(data: Omit<T, 'type'>): T => {
      return { ...data, type } as T;
    };
  };

  // Use Proxy to dynamically create type guards (is{Type} methods)
  return new Proxy(helpers, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string' && prop.startsWith('is')) {
        // Check cache first
        if (typeGuardCache.has(prop)) {
          return typeGuardCache.get(prop);
        }

        // Extract the type from the method name (e.g., 'isAType' -> 'AType')
        const typeName = prop.slice(2); // Remove 'is' prefix

        // Create type guard function
        const typeGuard = (value: Union): boolean => {
          return value.type === uncapitalize(typeName) || value.type === typeName;
        };

        // Cache it
        typeGuardCache.set(prop, typeGuard);
        return typeGuard;
      }

      return target[prop];
    }
  }) as UnionHelpers<Union>;
}

/**
 * Default export
 */
export default create;
