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
