const ALLOWED_INTERVALS = [2, 5, 15, 20, 30, 60] as const;

export function sanitizeString(input: string): string {
  return input.replace(/[^\x20-\x7E]/g, "").trim();
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function isAllowedInterval(interval: number): boolean {
  return ALLOWED_INTERVALS.includes(interval as (typeof ALLOWED_INTERVALS)[number]);
}

export function intervalToCron(interval: number): string {
  switch (interval) {
    case 2:
      return "*/2 * * * *";
    case 5:
      return "*/5 * * * *";
    case 15:
      return "*/15 * * * *";
    case 20:
      return "*/20 * * * *";
    case 30:
      return "*/30 * * * *";
    case 60:
      return "0 * * * *";
    default:
      throw new Error("Unsupported interval");
  }
}
