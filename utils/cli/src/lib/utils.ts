export const nowInCentisecondsFromMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const millisecondsSinceMidnight = now.getTime() - midnight.getTime();
  const centiseconds = Math.floor(millisecondsSinceMidnight / 10);
  return centiseconds;
}