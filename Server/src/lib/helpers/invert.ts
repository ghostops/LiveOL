export const invertKeyValues = (obj: any, fn?: Function) =>
  Object.keys(obj).reduce((acc, key) => {
    const val = fn ? fn(obj[key]) : obj[key];
    // @ts-expect-error key-type
    acc[val] = acc[val] || [];
    // @ts-expect-error key-type
    acc[val].push(key);
    return acc;
  }, {});
