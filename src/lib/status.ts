export const STATUS_LABEL = {
  WANT_TO_READ: "Want to read", READING: "Reading", READ: "Read", PAUSED: "Paused", DNF: "Did not finish",
} as const;
/** Deterministic spine colour from a title when the user hasn't customised one. */
export function spineColorFor(title: string) {
  let h = 0; for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `hsl(${h % 360} 35% 32%)`;
}
