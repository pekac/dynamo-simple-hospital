export function arraySubset<T>(a: T[], b: T[]): T[] {
  return a.filter((item: T) => b.indexOf(item) < 0);
}
