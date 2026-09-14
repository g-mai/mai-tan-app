/**
 * The one date format this app shows: "14 September 2026", or "14 Sep 2026"
 * when space is tight. Locale comes from the browser.
 */
export function formatDate(
  value: Date | string,
  month: "long" | "short" = "long",
): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month,
    day: "numeric",
  });
}
