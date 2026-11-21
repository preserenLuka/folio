export const THEMES = {
  classic: { name: "Classic oak", bg: "#3b2a1d", board: "#6b4a33", boardTop: "#8a6446", text: "#f6efe3", prop: "🕯️" },
  forest:  { name: "Forest", bg: "#1f3a2e", board: "#3f2d20", boardTop: "#5a4130", text: "#e8f1e6", prop: "🌿" },
  midnight:{ name: "Midnight", bg: "#161a33", board: "#2a2f55", boardTop: "#3b4175", text: "#e6e8ff", prop: "✨" },
  rose:    { name: "Rosé", bg: "#4a2433", board: "#7a3f55", boardTop: "#9a5670", text: "#ffeaf1", prop: "🌸" },
  winter:  { name: "Winter", bg: "#25384a", board: "#d9e3ec", boardTop: "#f2f6fa", text: "#f2f6fa", prop: "❄️" },
} as const;
export type ThemeId = keyof typeof THEMES;
export const themeOf = (id: string) => THEMES[(id in THEMES ? id : "classic") as ThemeId];
