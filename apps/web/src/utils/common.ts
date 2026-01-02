export interface NamedItem {
  id: string;
  name: string;
  [key: string]: any;
}

export function getNotUsedItems<T extends NamedItem>(allItems: T[], usedIds: string[]): T[] {
  return allItems.filter((item) => !usedIds.includes(item.id));
}

export function getItemName<T extends NamedItem>(
  id: string,
  items: T[],
  prefix: string = '',
): string {
  const item = items.find((i) => i.id === id);
  return item ? `${prefix}${item.name}` : 'Unknown';
}

export function intToHex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0').toUpperCase();
}

export function hexToInt(hex: string): number {
  const num = parseInt(hex.replace('#', ''), 16);
  return isNaN(num) ? 0 : num;
}
