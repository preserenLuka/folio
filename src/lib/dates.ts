export function periodStart(p: "YEAR" | "MONTH" | "WEEK") {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (p === "YEAR") return new Date(d.getFullYear(), 0, 1);
  if (p === "MONTH") return new Date(d.getFullYear(), d.getMonth(), 1);
  const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d;
}
