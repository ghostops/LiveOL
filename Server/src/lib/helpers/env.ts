export const getEnv = (name: string): string =>
    process.env[name.toUpperCase()] &&
    process.env[name.toUpperCase()].toLowerCase();
