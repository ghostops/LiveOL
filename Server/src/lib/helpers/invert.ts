export const invertKeyValues = (obj: any) =>
  Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];
    // @ts-expect-error key-type
    acc[val] = acc[val] || [];
    // @ts-expect-error key-type
    acc[val].push(key);
    return acc;
  }, {});
