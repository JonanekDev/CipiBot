// Deep merge function that merges two configuration objects.
// Rules:
// - If the patch value is null or undefined, keep the current value.
// - If the patch value is a primitive or an array, replace the current value.
// - If both values are objects, merge them recursively.
// - Empty strings are converted to null.
// - Empty objects (maps) are fully replaced with empty object.
export function mergeConfig(current: any, patch: any): any {
  if (patch === null || patch === undefined) {
    return current;
  }

  // Arrays are fully replaced (not merged)
  if (typeof patch !== 'object' || Array.isArray(patch)) {
    // Convert empty strings to null
    if (typeof patch === 'string' && patch === '') {
      return null;
    }
    return patch;
  }

  // If patch is an empty objec
  if (Object.keys(patch).length === 0) {
    return {};
  }

  if (typeof current !== 'object' || current === null || Array.isArray(current)) {
    current = {};
  }

  const result = { ...current };

  for (const key in patch) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      const patchValue = patch[key];
      const currentValue = current[key];

      // If patchValue is an object (but not array), recursively merge
      if (typeof patchValue === 'object' && patchValue !== null && !Array.isArray(patchValue)) {
        result[key] = mergeConfig(currentValue || {}, patchValue);
      } else {
        // Convert empty strings to null
        if (typeof patchValue === 'string' && patchValue === '') {
          result[key] = null;
        } else {
          // Primitives, arrays, null, undefined - fully replace
          result[key] = patchValue;
        }
      }
    }
  }

  return result;
}
