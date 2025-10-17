import { create } from "./index";

// Define test union types
interface AType {
  readonly type: "aType";
  readonly data: string;
}

interface BType {
  readonly type: "bType";
  readonly data: number;
}

interface CType {
  readonly type: "cType";
  readonly flag: boolean;
}

type TestUnion = AType | BType | CType;

describe("ts-unios", () => {
  let helpers: ReturnType<typeof create<TestUnion>>;

  beforeEach(() => {
    helpers = create<TestUnion>();
  });

  // Test data
  const aValue: AType = { type: "aType", data: "hello" };
  const bValue: BType = { type: "bType", data: 42 };
  const cValue: CType = { type: "cType", flag: true };

  describe("Type Guards", () => {
    test("isAType should identify AType correctly", () => {
      expect(helpers.isAType(aValue)).toBe(true);
      expect(helpers.isCType(bValue)).toBe(false);
      expect(helpers.isAType(cValue)).toBe(false);
    });

    test("isBType should identify BType correctly", () => {
      expect(helpers.isBType(aValue)).toBe(false);
      expect(helpers.isBType(bValue)).toBe(true);
      expect(helpers.isBType(cValue)).toBe(false);
    });

    test("isCType should identify CType correctly", () => {
      expect(helpers.isCType(aValue)).toBe(false);
      expect(helpers.isCType(bValue)).toBe(false);
      expect(helpers.isCType(cValue)).toBe(true);
    });

    test("type guards should properly narrow types", () => {
      const value: TestUnion = aValue;

      if (helpers.isAType(value)) {
        // Type should be narrowed to AType
        expect(value.data).toBe("hello");
      }
    });
  });

  describe("map", () => {
    test("should transform specified variant", () => {
      const result = helpers.map(aValue, {
        aType: (a) => ({ ...a, data: a.data.toUpperCase() }),
      });

      expect(result).toEqual({ type: "aType", data: "HELLO" });
    });

    test("should leave unhandled variants unchanged", () => {
      const result = helpers.map(bValue, {
        aType: (a) => ({ ...a, data: a.data.toUpperCase() }),
      });

      expect(result).toEqual(bValue);
    });

    test("should handle multiple handlers", () => {
      const resultA = helpers.map(aValue, {
        aType: (a) => ({ ...a, data: a.data.toUpperCase() }),
        bType: (b) => ({ ...b, data: b.data * 2 }),
      });

      const resultB = helpers.map(bValue, {
        aType: (a) => ({ ...a, data: a.data.toUpperCase() }),
        bType: (b) => ({ ...b, data: b.data * 2 }),
      });

      expect(resultA).toEqual({ type: "aType", data: "HELLO" });
      expect(resultB).toEqual({ type: "bType", data: 84 });
    });
  });

  describe("when", () => {
    test("should execute correct handler and return result", () => {
      const result = helpers.when(aValue, {
        aType: (a) => a.data.length,
        bType: (b) => b.data,
        cType: (c) => (c.flag ? 1 : 0),
      });

      expect(result).toBe(5); // 'hello'.length
    });

    test("should handle all variants", () => {
      const resultA = helpers.when(aValue, {
        aType: () => "A",
        bType: () => "B",
        cType: () => "C",
      });

      const resultB = helpers.when(bValue, {
        aType: () => "A",
        bType: () => "B",
        cType: () => "C",
      });

      const resultC = helpers.when(cValue, {
        aType: () => "A",
        bType: () => "B",
        cType: () => "C",
      });

      expect(resultA).toBe("A");
      expect(resultB).toBe("B");
      expect(resultC).toBe("C");
    });

    test("should throw error if handler is missing", () => {
      expect(() => {
        helpers.when(aValue, {
          bType: () => "B",
          cType: () => "C",
        } as any);
      }).toThrow("No handler found for type: aType");
    });
  });

  describe("match", () => {
    test("should transform to different type", () => {
      const result = helpers.match(aValue, {
        aType: (a) => ({ status: "text", content: a.data }),
        bType: (b) => ({ status: "number", content: b.data.toString() }),
        cType: (c) => ({ status: "boolean", content: c.flag.toString() }),
      });

      expect(result).toEqual({ status: "text", content: "hello" });
    });

    test("should work with different return types", () => {
      const resultA = helpers.match(aValue, {
        aType: (a) => a.data.length > 3,
        bType: (b) => b.data > 10,
        cType: (c) => c.flag,
      });

      expect(resultA).toBe(true);
    });
  });

  describe("filter", () => {
    const values: TestUnion[] = [
      { type: "aType", data: "short" },
      { type: "aType", data: "very long string" },
      { type: "bType", data: 5 },
      { type: "bType", data: 15 },
      { type: "cType", flag: true },
      { type: "cType", flag: false },
    ];

    test("should filter by single type and predicate", () => {
      const result = helpers.filter(values, "bType");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: "bType", data: 5 });
    });

    test("should filter by multiple types", () => {
      const result = helpers.filter(values, ["aType", "bType"]);

      expect(result).toHaveLength(4);
    });

    test("should return empty array if no matches", () => {
      const result = helpers.filter(values, "" as any);

      expect(result).toHaveLength(0);
    });
  });

  describe("fold", () => {
    test("should use specific handler when available", () => {
      const result = helpers.fold(
        aValue,
        {
          aType: (a) => a.data.length,
        },
        () => 0,
      );

      expect(result).toBe(5);
    });

    test("should use default handler when specific handler not available", () => {
      const result = helpers.fold(
        bValue,
        {
          aType: (a) => a.data.length,
        },
        () => -1,
      );

      expect(result).toBe(-1);
    });

    test("should handle multiple specific handlers", () => {
      const resultA = helpers.fold(
        aValue,
        {
          aType: (a) => a.data.length,
          bType: (b) => b.data,
        },
        () => 0,
      );

      const resultC = helpers.fold(
        cValue,
        {
          aType: (a) => a.data.length,
          bType: (b) => b.data,
        },
        () => 999,
      );

      expect(resultA).toBe(5);
      expect(resultC).toBe(999);
    });
  });

  describe("partition", () => {
    const values: TestUnion[] = [
      { type: "aType", data: "first" },
      { type: "bType", data: 1 },
      { type: "aType", data: "second" },
      { type: "cType", flag: true },
      { type: "bType", data: 2 },
      { type: "cType", flag: false },
    ];

    test("should partition values by type", () => {
      const result = helpers.partition(values);

      expect(result.aType).toHaveLength(2);
      expect(result.bType).toHaveLength(2);
      expect(result.cType).toHaveLength(2);

      expect(result.aType).toEqual([
        { type: "aType", data: "first" },
        { type: "aType", data: "second" },
      ]);

      expect(result.bType).toEqual([
        { type: "bType", data: 1 },
        { type: "bType", data: 2 },
      ]);

      expect(result.cType).toEqual([
        { type: "cType", flag: true },
        { type: "cType", flag: false },
      ]);
    });

    test("should handle empty array", () => {
      const result = helpers.partition([]);

      expect(result).toEqual({});
    });
  });

  describe("getType", () => {
    test("should return the discriminator value", () => {
      expect(helpers.getType(aValue)).toBe("aType");
      expect(helpers.getType(bValue)).toBe("bType");
      expect(helpers.getType(cValue)).toBe("cType");
    });
  });

  describe("constructor", () => {
    test("should create instance with correct type", () => {
      const createA = helpers.constructor("aType");
      const instance = createA({ data: "test" });

      expect(instance).toEqual({ type: "aType", data: "test" });
    });

    test("should work for different types", () => {
      const createB = helpers.constructor("bType");
      const instance = createB({ data: 99 });

      expect(instance).toEqual({ type: "bType", data: 99 });
    });

    test("should preserve all properties", () => {
      const createC = helpers.constructor("cType");
      const instance = createC({ flag: false });

      expect(instance).toEqual({ type: "cType", flag: false });
    });
  });

  describe("Complex state transitions", () => {
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

    test("should handle complex state mapping", () => {
      const stateHelpers = create<AppState>();

      const loadingState: AppState = { type: "loading", progress: 50 };

      // Increment progress
      const updated = stateHelpers.map(loadingState, {
        loading: (s) => ({ ...s, progress: s.progress + 10 }),
      });

      expect(updated).toEqual({ type: "loading", progress: 60 });
    });

    test("should handle state transitions", () => {
      const stateHelpers = create<AppState>();

      const states: AppState[] = [
        { type: "loading", progress: 0 },
        { type: "loading", progress: 50 },
        { type: "success", data: "result" },
        { type: "error", message: "failed" },
      ];

      const completedStates = stateHelpers.filter(states, ["error", "success"]);

      expect(completedStates).toHaveLength(2);
    });
  });
});
