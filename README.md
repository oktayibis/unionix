# ts-unios

A type-safe TypeScript library for working with discriminated unions. `ts-unios` provides powerful pattern matching, type guards, and transformation utilities that make working with discriminated unions elegant and safe.

## Features

- **Type-Safe Pattern Matching**: Exhaustive pattern matching with compile-time guarantees
- **Dynamic Type Guards**: Auto-generated type guards (`is{Type}`) for each union variant
- **Transformation Utilities**: Map, filter, and transform union values with full type safety
- **Zero Runtime Dependencies**: Lightweight and efficient
- **Comprehensive TypeScript Support**: Full IntelliSense and type inference

## Installation

```bash
npm install ts-unios
```

```bash
yarn add ts-unios
```

```bash
pnpm add ts-unios
```

## Quick Start

```typescript
import { create } from 'ts-unios';

// Define your discriminated union types
interface AUnion {
  readonly type: 'AType';
  readonly data: string;
}

interface BUnion {
  readonly type: 'BType';
  readonly data: number;
}

type MyUnion = AUnion | BUnion;

// Create helpers for your union
const myUnions = create<MyUnion>();

// Use type guards
const exampleA: MyUnion = { type: 'AType', data: 'Hello' };

if (myUnions.isAType(exampleA)) {
  // exampleA is narrowed to AUnion
  console.log(exampleA.data.toUpperCase()); // "HELLO"
}

// Transform with map
const updated = myUnions.map(exampleA, {
  AType: (a) => ({ ...a, data: a.data.toUpperCase() })
});

// Pattern matching with when
const result = myUnions.when(exampleA, {
  AType: (a) => a.data.length > 2,
  BType: (b) => b.data > 10
});
```

## API Reference

### `create<Union>()`

Creates a helper object with all utility methods for your discriminated union type.

```typescript
const helpers = create<MyUnion>();
```

### Type Guards

Automatically generated type guards for each variant in your union. The naming convention is `is{CapitalizedType}`.

```typescript
if (helpers.isAType(value)) {
  // value is narrowed to AUnion type
  console.log(value.data);
}

if (helpers.isBType(value)) {
  // value is narrowed to BUnion type
  console.log(value.data);
}
```

### `map(value, handlers)`

Maps over a union value, applying transformations only to specified variants. Unhandled variants are returned unchanged.

**Parameters:**
- `value`: The union value to transform
- `handlers`: Partial object with transformation functions for specific types

**Returns:** The same union type with transformations applied

```typescript
const updated = helpers.map(value, {
  AType: (a) => ({ ...a, data: a.data.toUpperCase() }),
  BType: (b) => ({ ...b, data: b.data * 2 })
});

// Only transform specific types
const result = helpers.map(bValue, {
  AType: (a) => ({ ...a, data: 'updated' })
  // BType not handled, returned as-is
});
```

### `when(value, handlers)`

Exhaustive pattern matching with a consistent return type. All variants must be handled.

**Parameters:**
- `value`: The union value to match
- `handlers`: Exhaustive object with handlers for all union types

**Returns:** The result of applying the matched handler

```typescript
const result = helpers.when(value, {
  AType: (a) => a.data.length,
  BType: (b) => b.data
}); // Returns number

const isValid = helpers.when(value, {
  AType: (a) => a.data.length > 0,
  BType: (b) => b.data > 0
}); // Returns boolean
```

### `match(value, handlers)`

Similar to `when`, but emphasizes type transformation. Useful for transforming unions to different types.

**Parameters:**
- `value`: The union value to match
- `handlers`: Exhaustive object with transformation functions

**Returns:** Transformed result

```typescript
const result = helpers.match(value, {
  AType: (a) => ({ status: 'text', content: a.data }),
  BType: (b) => ({ status: 'number', content: b.data.toString() })
});
```

### `filter(values, types)`

Filters an array of union values, keeping only specified variant types.

**Parameters:**
- `values`: Array of union values
- `types`: Single type or array of types to keep

**Returns:** Filtered array containing only the specified variant types

```typescript
const values: MyUnion[] = [
  { type: 'AType', data: 'hello' },
  { type: 'BType', data: 5 },
  { type: 'AType', data: 'world' },
  { type: 'BType', data: 15 }
];

// Filter single type
const onlyATypes = helpers.filter(values, 'AType');
// Result: [{ type: 'AType', data: 'hello' }, { type: 'AType', data: 'world' }]

// Filter multiple types
const aAndB = helpers.filter(values, ['AType', 'BType']);
// Result: all AType and BType values
```

### `filterBy(values, predicates)`

Filters an array of union values with custom predicates for each type.

**Parameters:**
- `values`: Array of union values
- `predicates`: Object mapping variant types to filter predicates

**Returns:** Filtered array containing only matching variants

```typescript
const filtered = helpers.filterBy(values, {
  BType: (b) => b.data > 10
});
// Result: [{ type: 'BType', data: 15 }]

// Filter multiple types with different conditions
const multiFiltered = helpers.filterBy(values, {
  AType: (a) => a.data.length > 5,
  BType: (b) => b.data > 10
});
```

### `fold(value, handlers, defaultHandler)`

Pattern matching with optional handlers and a default case.

**Parameters:**
- `value`: The union value
- `handlers`: Partial object with handlers for specific types
- `defaultHandler`: Handler for unhandled variants

**Returns:** Result from the matched or default handler

```typescript
const result = helpers.fold(
  value,
  {
    AType: (a) => a.data.length,
    BType: (b) => b.data
  },
  () => 0 // default for unhandled types
);
```

### `partition(values)`

Partitions an array of unions into groups by variant type.

**Parameters:**
- `values`: Array of union values

**Returns:** Object with discriminator values as keys and arrays of matching variants as values

```typescript
const partitioned = helpers.partition(values);
// Result: { AType: [...], BType: [...] }

const aTypes = partitioned.AType; // Array<AUnion>
const bTypes = partitioned.BType; // Array<BUnion>
```

### `getType(value)`

Gets the discriminator value from a union instance.

**Parameters:**
- `value`: The union value

**Returns:** The discriminator value

```typescript
const type = helpers.getType(value); // 'AType' | 'BType'
```

### `constructor(type)`

Creates a type-safe constructor function for a specific variant.

**Parameters:**
- `type`: The discriminator value

**Returns:** Constructor function for that variant

```typescript
const createA = helpers.constructor('AType');
const aValue = createA({ data: 'hello' });
// Result: { type: 'AType', data: 'hello' }

const createB = helpers.constructor('BType');
const bValue = createB({ data: 42 });
// Result: { type: 'BType', data: 42 }
```

## Real-World Examples

### State Management

```typescript
import { create } from 'ts-unios';

interface LoadingState {
  readonly type: 'loading';
  readonly progress: number;
}

interface SuccessState {
  readonly type: 'success';
  readonly data: string;
}

interface ErrorState {
  readonly type: 'error';
  readonly message: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

const stateHelpers = create<AppState>();

// State transitions
function updateState(state: AppState): AppState {
  return stateHelpers.map(state, {
    loading: (s) => ({ ...s, progress: Math.min(s.progress + 10, 100) })
  });
}

// Render based on state
function render(state: AppState): string {
  return stateHelpers.when(state, {
    loading: (s) => `Loading... ${s.progress}%`,
    success: (s) => `Success: ${s.data}`,
    error: (e) => `Error: ${e.message}`
  });
}

// Check if state is complete
const isComplete = (state: AppState): boolean => {
  return stateHelpers.match(state, {
    loading: () => false,
    success: () => true,
    error: () => true
  });
};
```

### Event Handling

```typescript
interface ClickEvent {
  readonly type: 'click';
  readonly x: number;
  readonly y: number;
}

interface KeyEvent {
  readonly type: 'keypress';
  readonly key: string;
}

interface ScrollEvent {
  readonly type: 'scroll';
  readonly position: number;
}

type UIEvent = ClickEvent | KeyEvent | ScrollEvent;

const eventHelpers = create<UIEvent>();

function handleEvents(events: UIEvent[]): void {
  // Filter only click and keypress events
  const interactiveEvents = eventHelpers.filterBy(events, {
    click: () => true,
    keypress: (e) => e.key === 'Enter'
  });

  // Handle each event type
  interactiveEvents.forEach((event) => {
    eventHelpers.when(event, {
      click: (e) => console.log(`Clicked at (${e.x}, ${e.y})`),
      keypress: (e) => console.log(`Key pressed: ${e.key}`),
      scroll: (e) => console.log(`Scrolled to: ${e.position}`)
    });
  });
}

// Partition events by type
function analyzeEvents(events: UIEvent[]) {
  const byType = eventHelpers.partition(events);

  return {
    clickCount: byType.click?.length ?? 0,
    keypressCount: byType.keypress?.length ?? 0,
    scrollCount: byType.scroll?.length ?? 0
  };
}
```

### API Response Handling

```typescript
interface SuccessResponse<T> {
  readonly type: 'success';
  readonly data: T;
  readonly timestamp: number;
}

interface ErrorResponse {
  readonly type: 'error';
  readonly code: number;
  readonly message: string;
}

interface PendingResponse {
  readonly type: 'pending';
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | PendingResponse;

const responseHelpers = create<ApiResponse<any>>();

// Extract data or provide default
function getDataOrDefault<T>(response: ApiResponse<T>, defaultValue: T): T {
  return responseHelpers.fold(
    response,
    {
      success: (r) => r.data
    },
    () => defaultValue
  );
}

// Map response to UI state
function toUIState<T>(response: ApiResponse<T>) {
  return responseHelpers.match(response, {
    success: (r) => ({ status: 'loaded', content: r.data }),
    error: (r) => ({ status: 'error', content: r.message }),
    pending: () => ({ status: 'loading', content: null })
  });
}
```

## Best Practices

### 1. Use `readonly` for Immutability

Always define your discriminated unions with `readonly` properties to prevent accidental mutations:

```typescript
interface MyType {
  readonly type: 'myType';
  readonly data: string;
}
```

### 2. Prefer `when` for Exhaustive Matching

Use `when` when you need to handle all cases to ensure compile-time exhaustiveness checking:

```typescript
// Compiler ensures all cases are handled
const result = helpers.when(value, {
  AType: (a) => handleA(a),
  BType: (b) => handleB(b)
});
```

### 3. Use `fold` for Partial Matching

Use `fold` when you only care about specific types and have a sensible default:

```typescript
const result = helpers.fold(
  value,
  {
    AType: (a) => specificHandling(a)
  },
  (v) => defaultHandling(v)
);
```

### 4. Leverage Type Narrowing

Use type guards in conditionals to leverage TypeScript's type narrowing:

```typescript
if (helpers.isAType(value)) {
  // Full autocomplete for AType properties
  console.log(value.data);
}
```

## TypeScript Configuration

For best results, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Created for type-safe discriminated union handling in TypeScript projects.
