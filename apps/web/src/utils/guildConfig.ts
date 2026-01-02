export function deepEqual(draft: any, original: any): boolean {
  if (draft === original) return true;
  if (
    typeof draft !== 'object' ||
    draft === null ||
    typeof original !== 'object' ||
    original === null
  )
    return false;

  const keys1 = Object.keys(draft);
  const keys2 = Object.keys(original);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(draft[key], original[key])) return false;
  }

  return true;
}
