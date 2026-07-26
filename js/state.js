export const defaultState = {
  meta: {
    name: "Mi Tema",
    author: "Cubiclauncher-editor",
    version: "1.0.0",
    description: "Este tema fue generado por la herramienta Cubiclauncher-editor creado por kittyhos",
    injects_css: false,
  },
  background: {
    reference_path: "",
    image_blur: 0,
    image_opacity: 1,
  },
  colors: {
    accent: "#e94560",
    "accent-rgb": "233, 69, 96",
    "accent-hover": "#ff6b81",
    "accent-text": "#ffffff",
  },
  text: {
    primary: "#ffffff",
    secondary: "#cccccc",
    muted: "#999999",
  },
  backgrounds: {
    main: "#1a1a2e",
    sidebar: "#16213e",
    card: "#0f3460",
    "item-active": "#e94560",
    overlay: "rgba(0,0,0,0.7)",
    input: "#1a1a2e",
  },
  borders: {
    color: "#333333",
    radius: "8px",
    "radius-sm": "4px",
  },
  shadows: {
    "shadow-sm": "0 1px 3px rgba(0,0,0,0.5)",
    "shadow-md": "0 4px 6px rgba(0,0,0,0.3)",
    "glow-accent": "0 0 12px rgba(233,69,96,0.3)",
  },
  layout: {
    "font-family": "'Inter', sans-serif",
    "font-size-base": "14px",
    "font-size-sm": "12px",
    "font-size-lg": "18px",
  },
  others: {
    "icon-filter": "invert(1)",
    "color-success": "#22c55e",
    "color-error": "#ef4444",
    "color-warning": "#f59e0b",
    "color-status-starting": "#f97316",
    "color-status-started": "#22c55e",
    "scrollbar-track": "#1a1a2e",
    "scrollbar-thumb": "#e94560",
  },
  backdrop: {
    dropdown: 10,
    modal: 4,
  },
  fonts: [],
  inject: "",
};

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

export function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export const appContext = {
  state: deepClone(defaultState),
  bgImageFile: null,
  currentPalette: null,
  currentMode: "professional",
};
