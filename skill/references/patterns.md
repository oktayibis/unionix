# Discriminated Union Patterns with unionix

## State Machine: Async Operations

Model loading/success/error states for data fetching.

```typescript
import { create } from 'unionix';

interface Idle { readonly type: 'idle'; }
interface Loading { readonly type: 'loading'; readonly progress: number; }
interface Success<T> { readonly type: 'success'; readonly data: T; }
interface Error { readonly type: 'error'; readonly message: string; }

type FetchState<T> = Idle | Loading | Success<T> | Error;

const state = create<FetchState<string>>();

// Render UI based on state
function render(s: FetchState<string>): string {
  return state.when(s, {
    idle: () => 'Click to load',
    loading: (l) => `Loading... ${l.progress}%`,
    success: (s) => `Data: ${s.data}`,
    error: (e) => `Error: ${e.message}`
  });
}

// Update progress
function tick(s: FetchState<string>): FetchState<string> {
  return state.map(s, {
    loading: (l) => ({ ...l, progress: Math.min(l.progress + 10, 100) })
  });
}

// Retry on error
function retry(s: FetchState<string>): FetchState<string> {
  return state.transform(s, {
    error: () => ({ type: 'loading', progress: 0 })
  });
}

// Check if complete
const isComplete = (s: FetchState<string>): boolean =>
  state.match(s, {
    idle: () => false,
    loading: () => false,
    success: () => true,
    error: () => true
  });
```

---

## Event Handling

Process different event types with type-safe handlers.

```typescript
interface Click { readonly type: 'click'; readonly x: number; readonly y: number; }
interface Keypress { readonly type: 'keypress'; readonly key: string; }
interface Scroll { readonly type: 'scroll'; readonly position: number; }

type UIEvent = Click | Keypress | Scroll;

const events = create<UIEvent>();

function handleEvent(e: UIEvent): void {
  events.when(e, {
    click: (c) => console.log(`Clicked at (${c.x}, ${c.y})`),
    keypress: (k) => console.log(`Key: ${k.key}`),
    scroll: (s) => console.log(`Scrolled to ${s.position}`)
  });
}

// Filter only keyboard events
const keyEvents = events.filter(eventLog, 'keypress');

// Filter Enter key presses
const enterPresses = events.filterBy(eventLog, {
  keypress: (k) => k.key === 'Enter'
});

// Count events by type
const counts = events.partition(eventLog);
console.log(`Clicks: ${counts.click?.length ?? 0}`);
```

---

## API Response Handling

Handle different response states from API calls.

```typescript
interface Pending { readonly type: 'pending'; }
interface Ok<T> { readonly type: 'ok'; readonly data: T; readonly status: number; }
interface Err { readonly type: 'err'; readonly code: number; readonly message: string; }

type Response<T> = Pending | Ok<T> | Err;

const response = create<Response<User>>();

// Extract data with default
function getData<T>(r: Response<T>, fallback: T): T {
  return response.fold(r, { ok: (o) => o.data }, () => fallback);
}

// Map to UI state
function toUI<T>(r: Response<T>) {
  return response.match(r, {
    pending: () => ({ loading: true, error: null, data: null }),
    ok: (o) => ({ loading: false, error: null, data: o.data }),
    err: (e) => ({ loading: false, error: e.message, data: null })
  });
}

// Check if should retry
const shouldRetry = (r: Response<unknown>): boolean =>
  response.fold(r, { err: (e) => e.code >= 500 }, () => false);
```

---

## Order/Workflow Lifecycle

Model multi-step workflows with state transitions.

```typescript
interface Pending { readonly type: 'pending'; readonly id: string; readonly items: number; }
interface Processing { readonly type: 'processing'; readonly id: string; readonly assignee: string; }
interface Shipped { readonly type: 'shipped'; readonly id: string; readonly tracking: string; }
interface Delivered { readonly type: 'delivered'; readonly id: string; readonly signedBy: string; }
interface Cancelled { readonly type: 'cancelled'; readonly id: string; readonly reason: string; }

type Order = Pending | Processing | Shipped | Delivered | Cancelled;

const order = create<Order>();

// Dashboard display
function display(o: Order): string {
  return order.fold(
    o,
    {
      pending: (p) => `Order ${p.id}: ${p.items} items waiting`,
      processing: (p) => `Order ${p.id}: assigned to ${p.assignee}`,
      shipped: (s) => `Order ${s.id}: tracking ${s.tracking}`
    },
    (other) => `Order ${other.id}: ${other.type}`
  );
}

// Retry cancelled orders
const retried = orders.map((o) =>
  order.transform(o, {
    cancelled: (c) => ({ type: 'pending', id: c.id, items: 1 })
  })
);

// Get in-flight orders
const inFlight = order.filter(orders, ['processing', 'shipped']);

// Create new order
const createPending = order.constructor('pending');
const newOrder = createPending({ id: 'ORD-001', items: 3 });
```

---

## Form Validation

Represent validation states for form fields.

```typescript
interface Pristine { readonly type: 'pristine'; }
interface Valid { readonly type: 'valid'; readonly value: string; }
interface Invalid { readonly type: 'invalid'; readonly value: string; readonly errors: string[]; }
interface Validating { readonly type: 'validating'; readonly value: string; }

type FieldState = Pristine | Valid | Invalid | Validating;

const field = create<FieldState>();

// Get display class
const getClass = (f: FieldState): string =>
  field.match(f, {
    pristine: () => '',
    valid: () => 'success',
    invalid: () => 'error',
    validating: () => 'pending'
  });

// Get current value
const getValue = (f: FieldState): string =>
  field.fold(f, {
    valid: (v) => v.value,
    invalid: (i) => i.value,
    validating: (v) => v.value
  }, () => '');

// Check form validity
const allFields: FieldState[] = [emailField, passwordField];
const allValid = field.filter(allFields, 'valid').length === allFields.length;
```

---

## Result Type (Either Pattern)

Represent success/failure without exceptions.

```typescript
interface Ok<T> { readonly type: 'ok'; readonly value: T; }
interface Err<E> { readonly type: 'err'; readonly error: E; }

type Result<T, E> = Ok<T> | Err<E>;

const result = create<Result<number, string>>();

// Chain operations
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { type: 'err', error: 'Division by zero' };
  return { type: 'ok', value: a / b };
}

// Unwrap with default
const unwrap = <T, E>(r: Result<T, E>, fallback: T): T =>
  result.fold(r, { ok: (o) => o.value }, () => fallback);

// Map over success
const mapped = result.map(r, {
  ok: (o) => ({ ...o, value: o.value * 2 })
});
```
