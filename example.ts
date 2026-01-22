/**
 * Example usage of unionix library
 * Run with: npx ts-node example.ts
 */

import { create } from "./src";

// Define discriminated union types
interface AUnion {
  readonly type: "AType";
  readonly data: string;
}

interface BUnion {
  readonly type: "BType";
  readonly data: number;
}

type MyUnion = AUnion | BUnion;

// Create helpers
const myUnions = create<MyUnion>();

// Example data
const exampleA: MyUnion = {
  type: "AType",
  data: "Hello",
};

const exampleB: MyUnion = {
  type: "BType",
  data: 42,
};

console.log("=== Type Guards ===");
console.log("isBType(exampleA):", myUnions.isBType(exampleA)); // false
console.log("isBType(exampleB):", myUnions.isBType(exampleB)); // true
console.log("isAType(exampleA):", myUnions.isAType(exampleA)); // true

console.log("\n=== Map ===");
const updatedA = myUnions.map(exampleA, {
  AType: (a) => ({ ...a, data: a.data.toUpperCase() }),
});
console.log("Updated A:", updatedA); // { type: 'AType', data: 'HELLO' }

const updatedB = myUnions.map(exampleB, {
  AType: (a) => ({ ...a, data: "updated" }), // BType not handled, returned as-is
});
console.log("Updated B (no change):", updatedB); // { type: 'BType', data: 42 }

console.log("\n=== When ===");
const resultA = myUnions.when(exampleA, {
  AType: (a) => a.data.length,
  BType: (b) => b.data,
});
console.log("Result for A:", resultA); // 5

const resultB = myUnions.when(exampleB, {
  AType: (a) => a.data.length,
  BType: (b) => b.data,
});
console.log("Result for B:", resultB); // 42

console.log("\n=== Filter (by type) ===");
const values: MyUnion[] = [
  { type: "AType", data: "short" },
  { type: "AType", data: "very long string" },
  { type: "BType", data: 5 },
  { type: "BType", data: 15 },
  { type: "BType", data: 25 },
];

// Simple type-based filtering
const onlyBTypes = myUnions.filter(values, "BType");
console.log("Only BType values:", onlyBTypes);
// [{ type: 'BType', data: 5 }, { type: 'BType', data: 15 }, { type: 'BType', data: 25 }]

// Filter multiple types
const aAndB = myUnions.filter(values, ["AType", "BType"]);
console.log("AType and BType:", aAndB.length, "items");

console.log("\n=== FilterBy (with predicates) ===");
const filteredB = myUnions.filterBy(values, {
  BType: (b) => b.data > 10,
});
console.log("Filtered BType > 10:", filteredB);
// [{ type: 'BType', data: 15 }, { type: 'BType', data: 25 }]

const filteredMultiple = myUnions.filterBy(values, {
  AType: (a) => a.data.length > 5,
  BType: (b) => b.data > 10,
});
console.log("Filtered with multiple predicates:", filteredMultiple);

console.log("\n=== Partition ===");
const partitioned = myUnions.partition(values);
console.log("Partitioned by type:", partitioned);

console.log("\n=== Constructor ===");
const createA = myUnions.constructor("AType");
const newA = createA({ data: "Created with constructor" });
console.log("Created A:", newA);

const createB = myUnions.constructor("BType");
const newB = createB({ data: 999 });
console.log("Created B:", newB);

console.log("\n=== Complex State Machine Example ===");

interface LoadingState {
  readonly type: "loading";
  readonly progress: number;
}

interface SuccessState {
  readonly type: "success";
  readonly data: string;
}

interface ErrorState {
  readonly type: "error";
  readonly message: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

const stateHelpers = create<AppState>();

let state: AppState = { type: "loading", progress: 0 };

console.log("Initial state:", state);

// Simulate progress updates
for (let i = 0; i < 5; i++) {
  state = stateHelpers.map(state, {
    loading: (s) => ({ ...s, progress: s.progress + 20 }),
  });
  console.log(`Progress update ${i + 1}:`, state);
}

// Transition to success
state = { type: "success", data: "Operation completed!" };
console.log("Success state:", state);

// Render state
const rendered = stateHelpers.when(state, {
  loading: (s) => `Loading... ${s.progress}%`,
  success: (s) => `Success: ${s.data}`,
  error: (e) => `Error: ${e.message}`,
});
console.log("Rendered:", rendered);

// Check if complete
const isComplete = stateHelpers.match(state, {
  loading: () => false,
  success: () => true,
  error: () => true,
});
console.log("Is complete?", isComplete);

const updatedState = stateHelpers.transform(state, {
  loading: () => ({ type: "success", data: "Updated" }),
});

console.log("Updated state:", updatedState);
