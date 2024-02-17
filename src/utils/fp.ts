export function compose(...fns: Function[]): (x: any) => Promise<any> {
  for (const fn of fns) {
    if (typeof fn !== 'function') {
      throw new TypeError('Dont mess around');
    }
  }
  const orderedFns = fns.reverse();

  return async function (x: any) {
    for (const fn of orderedFns) {
      x = await fn(x);
    }

    return x;
  };
}
