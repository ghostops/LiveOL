export const getEnv = (name: string, lowerCase = true): string => {
  if (process.env[name.toUpperCase()] && lowerCase) {
    // @ts-expect-error key-type
    return process.env[name.toUpperCase()].toLowerCase();
  }

  return process.env[name.toUpperCase()]!;
};
