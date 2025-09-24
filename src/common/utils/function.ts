export function flattenObject(
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, any> = {}
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}${key[0]?.toUpperCase() + key.slice(1)}` : key;

    if (Array.isArray(value)) {
      // Flatten each item in the array
      result[newKey] = value.map(item => {
        if (typeof item === "object" && item !== null) {
          const flatItem = flattenObject(item);
          // If object has only one key, return its value
          return Object.keys(flatItem).length === 1 ? Object.values(flatItem)[0] : flatItem;
        }
        return item;
      });
    } else if (value && typeof value === "object") {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

type OptionalizeUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export function optionalizeUndefined<T>(obj: T): OptionalizeUndefined<T> {
  const out: Partial<Record<keyof T, unknown>> = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  }
  return out as unknown as OptionalizeUndefined<T>; // single, targeted assertion
}

type rowOrder = { id: number; position: number };

export function applyPartialReorder(existing: rowOrder[], reorders: rowOrder[]): rowOrder[] {
  const n = existing.length;
  const reorderMap = new Map(reorders.map(r => [r.id, r.position]));

  const left = existing.filter(e => !reorderMap.has(e.id));

  const result: (rowOrder | null)[] = Array(n).fill(null);

  for (const r of reorders) {
    result[r.position - 1] = { id: r.id, position: r.position };
  }

  let li = 0;
  for (let i = 0; i < n; i++) {
    if (!result[i]) {
      result[i] = { id: left[li]!.id, position: i + 1 };
      li++;
    } else {
      result[i] = { id: result[i]!.id, position: i + 1 };
    }
  }

  return result as rowOrder[];
}
