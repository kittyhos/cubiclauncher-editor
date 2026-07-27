import { appContext, defaultState, deepClone, deepMerge } from "./state.js";
import { deepSet } from "./utils.js";
import {
  hexToRgb,
  adjustColor,
  sampleImageColors,
  extractSwatches,
  buildThemeFromPalette,
} from "./color-utils.js";
import { downloadThemeZIP, downloadPRStructure } from "./theme-export.js";

const fieldMap = {
  "meta-name": ["meta", "name"],
  "meta-author": ["meta", "author"],
  "meta-version": ["meta", "version"],
  "meta-description": ["meta", "description"],
  "meta-injects-css": ["meta", "injects_css"],
  "bg-reference_path": ["background", "reference_path"],
  "bg-image_blur": ["background", "image_blur"],
  "bg-image_opacity": ["background", "image_opacity"],
  "colors-accent": ["colors", "accent"],
  "colors-accent-text": ["colors", "accent"],
  "colors-accent-rgb": ["colors", "accent-rgb"],
  "colors-accent-hover": ["colors", "accent-hover"],
  "colors-accent-hover-text": ["colors", "accent-hover"],
  "colors-accent-text-field": ["colors", "accent-text"],
  "colors-accent-text-text": ["colors", "accent-text"],
  "text-primary": ["text", "primary"],
  "text-primary-text": ["text", "primary"],
  "text-secondary": ["text", "secondary"],
  "text-secondary-text": ["text", "secondary"],
  "text-muted": ["text", "muted"],
  "text-muted-text": ["text", "muted"],
  "backgrounds-main": ["backgrounds", "main"],
  "backgrounds-main-text": ["backgrounds", "main"],
  "backgrounds-sidebar": ["backgrounds", "sidebar"],
  "backgrounds-sidebar-text": ["backgrounds", "sidebar"],
  "backgrounds-card": ["backgrounds", "card"],
  "backgrounds-card-text": ["backgrounds", "card"],
  "backgrounds-item-active": ["backgrounds", "item-active"],
  "backgrounds-item-active-text": ["backgrounds", "item-active"],
  "backgrounds-overlay": ["backgrounds", "overlay"],
  "backgrounds-input": ["backgrounds", "input"],
  "backgrounds-input-text": ["backgrounds", "input"],
  "borders-color": ["borders", "color"],
  "borders-color-text": ["borders", "color"],
  "borders-radius": ["borders", "radius"],
  "borders-radius-sm": ["borders", "radius-sm"],
  "shadows-shadow-sm": ["shadows", "shadow-sm"],
  "shadows-shadow-md": ["shadows", "shadow-md"],
  "shadows-glow-accent": ["shadows", "glow-accent"],
  "layout-font-family": ["layout", "font-family"],
  "layout-font-size-base": ["layout", "font-size-base"],
  "layout-font-size-sm": ["layout", "font-size-sm"],
  "layout-font-size-lg": ["layout", "font-size-lg"],
  "others-icon-filter": ["others", "icon-filter"],
  "others-color-success": ["others", "color-success"],
  "others-color-success-text": ["others", "color-success"],
  "others-color-error": ["others", "color-error"],
  "others-color-error-text": ["others", "color-error"],
  "others-color-warning": ["others", "color-warning"],
  "others-color-warning-text": ["others", "color-warning"],
  "others-color-status-starting": ["others", "color-status-starting"],
  "others-color-status-starting-text": ["others", "color-status-starting"],
  "others-color-status-started": ["others", "color-status-started"],
  "others-color-status-started-text": ["others", "color-status-started"],
  "others-scrollbar-track": ["others", "scrollbar-track"],
  "others-scrollbar-track-text": ["others", "scrollbar-track"],
  "others-scrollbar-thumb": ["others", "scrollbar-thumb"],
  "others-scrollbar-thumb-text": ["others", "scrollbar-thumb"],
  "backdrop-dropdown": ["backdrop", "dropdown"],
  "backdrop-modal": ["backdrop", "modal"],
  "inject-css": ["inject"],
};

const colorPairs = [
  ["colors-accent", "colors-accent-text"],
  ["colors-accent-hover", "colors-accent-hover-text"],
  ["colors-accent-text-field", "colors-accent-text-text"],
  ["text-primary", "text-primary-text"],
  ["text-secondary", "text-secondary-text"],
  ["text-muted", "text-muted-text"],
  ["backgrounds-main", "backgrounds-main-text"],
  ["backgrounds-sidebar", "backgrounds-sidebar-text"],
  ["backgrounds-card", "backgrounds-card-text"],
  ["backgrounds-item-active", "backgrounds-item-active-text"],
  ["backgrounds-input", "backgrounds-input-text"],
  ["borders-color", "borders-color-text"],
  ["others-color-success", "others-color-success-text"],
  ["others-color-error", "others-color-error-text"],
  ["others-color-warning", "others-color-warning-text"],
  ["others-color-status-starting", "others-color-status-starting-text"],
  ["others-color-status-started", "others-color-status-started-text"],
  ["others-scrollbar-track", "others-scrollbar-track-text"],
  ["others-scrollbar-thumb", "others-scrollbar-thumb-text"],
];

function updateStudioHeader() {
  document.title = appContext.state.meta.name
    ? `${appContext.state.meta.name} · Cubic Theme Studio`
    : "Cubic Theme Studio";
}

function updatePreview() {
  const frame = document.getElementById("preview-frame");
  const s = appContext.state;

  const cssVars = {
    "--bg-main": s.backgrounds.main,
    "--bg-sidebar": s.backgrounds.sidebar,
    "--bg-sidebar-gradient": s.backgrounds.sidebar,
    "--bg-card": s.backgrounds.card,
    "--bg-card-gradient": s.backgrounds.card,
    "--bg-item-active": s.backgrounds["item-active"],
    "--bg-overlay": s.backgrounds.overlay,
    "--bg-input": s.backgrounds.input,
    "--text-primary": s.text.primary,
    "--text-secondary": s.text.secondary,
    "--text-muted": s.text.muted,
    "--accent": s.colors.accent,
    "--accent-hover": s.colors["accent-hover"],
    "--accent-text": s.colors["accent-text"],
    "--border-color": s.borders.color,
    "--border-radius": s.borders.radius,
    "--border-radius-sm": s.borders["radius-sm"],
    "--shadow-sm": s.shadows["shadow-sm"],
    "--shadow-md": s.shadows["shadow-md"],
    "--glow-accent": s.shadows["glow-accent"],
    "--icon-filter": s.others["icon-filter"],
    "--color-success": s.others["color-success"],
    "--color-error": s.others["color-error"],
    "--color-warning": s.others["color-warning"],
    "--color-status-starting": s.others["color-status-starting"],
    "--color-status-started": s.others["color-status-started"],
    "--scrollbar-track": s.others["scrollbar-track"],
    "--scrollbar-thumb": s.others["scrollbar-thumb"],
    "--font-family": s.layout["font-family"],
    "--font-size-base": s.layout["font-size-base"],
    "--font-size-sm": s.layout["font-size-sm"],
    "--font-size-lg": s.layout["font-size-lg"],
    "--backdrop-blur-dropdown": `${s.backdrop.dropdown}px`,
    "--backdrop-blur-modal": `${s.backdrop.modal}px`,
    "--surface-input": s.backgrounds.input,
    "--surface-dropdown": s.backgrounds.sidebar,
    "--surface-selected": s.backgrounds["item-active"],
    "--surface-hover": adjustColor(s.backgrounds.card, 10),
    "--surface-active": adjustColor(s.backgrounds.card, 20),
  };

  for (const [key, value] of Object.entries(cssVars)) {
    frame.style.setProperty(key, value);
  }

  const cardRgb = hexToRgb(s.backgrounds.card);
  if (cardRgb) {
    frame.style.setProperty("--surface-rgb", `${cardRgb.r}, ${cardRgb.g}, ${cardRgb.b}`);
  }

  if (appContext.bgImageFile && s.background.reference_path) {
    const url = URL.createObjectURL(appContext.bgImageFile);
    frame.style.setProperty("--bg-image", `url(${url})`);
    frame.style.setProperty("--bg-image-blur", `${s.background.image_blur}px`);
    frame.style.setProperty("--bg-image-opacity", s.background.image_opacity);
  } else {
    frame.style.setProperty("--bg-image", "none");
    frame.style.setProperty("--bg-image-blur", "0px");
    frame.style.setProperty("--bg-image-opacity", "0");
  }

  updateStudioHeader();
}

function setInputsFromState() {
  const setIfExists = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  setIfExists("meta-name", appContext.state.meta.name);
  setIfExists("meta-author", appContext.state.meta.author);
  setIfExists("meta-description", appContext.state.meta.description);

  setIfExists("bg-reference_path", appContext.state.background.reference_path);
  setIfExists("bg-image_blur", appContext.state.background.image_blur);
  setIfExists("bg-image_opacity", appContext.state.background.image_opacity);

  const setColor = (pickerId, textId, value) => {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (picker) picker.value = normalizeHex(value) || "#000000";
    if (text) text.value = value || "";
  };

  setColor("colors-accent", "colors-accent-text", appContext.state.colors.accent);
  setIfExists("colors-accent-rgb", appContext.state.colors["accent-rgb"]);
  setColor("colors-accent-hover", "colors-accent-hover-text", appContext.state.colors["accent-hover"]);
  setColor("colors-accent-text-field", "colors-accent-text-text", appContext.state.colors["accent-text"]);

  ["primary", "secondary", "muted"].forEach((k) => {
    setColor(`text-${k}`, `text-${k}-text`, appContext.state.text[k]);
  });

  ["main", "sidebar", "card", "item-active", "input"].forEach((k) => {
    setColor(`backgrounds-${k}`, `backgrounds-${k}-text`, appContext.state.backgrounds[k]);
  });

  setColor("borders-color", "borders-color-text", appContext.state.borders.color);
  setIfExists("borders-radius", appContext.state.borders.radius);
  setIfExists("borders-radius-sm", appContext.state.borders["radius-sm"]);
}

function normalizeHex(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^#[0-9A-Fa-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return null;
}

function handleInputChange(evt) {
  const el = evt.target;
  const path = fieldMap[el.id];
  if (!path) return;

  let value = el.value;
  if (el.type === "number") value = parseFloat(value);
  if (el.type === "checkbox") value = el.checked;

  if (path[0] === "inject") {
    appContext.state.inject = value;
  } else {
    deepSet(appContext.state, path, value);
  }

  const pair = colorPairs.find(([picker, text]) => picker === el.id || text === el.id);
  if (pair) {
    const [pickerId, textId] = pair;
    if (el.id === pickerId) {
      document.getElementById(textId).value = el.value;
      deepSet(appContext.state, fieldMap[textId], el.value);
    } else if (normalizeHex(el.value)) {
      document.getElementById(pickerId).value = normalizeHex(el.value);
    }
  }

  updatePreview();
}

function updateDropZone() {
  const zone = document.getElementById("drop-zone");
  if (!zone) return;
  if (appContext.bgImageFile) {
    zone.classList.add("hidden");
  } else {
    zone.classList.remove("hidden");
  }
}

function applyGeneratedTheme(generated) {
  appContext.state = deepMerge(deepClone(defaultState), {
    background: appContext.state.background,
    meta: appContext.state.meta,
    colors: generated.colors,
    text: generated.text,
    backgrounds: generated.backgrounds,
    borders: generated.borders,
    shadows: generated.shadows,
    others: generated.others,
  });
}

export async function applyThemeFromImage(file) {
  if (!file) return;
  appContext.bgImageFile = file;
  appContext.state.background.reference_path = file.name;
  try {
    const samples = await sampleImageColors(file);
    appContext.currentPalette = extractSwatches(samples);
    if (appContext.currentPalette) {
      const generated = buildThemeFromPalette(appContext.currentPalette, appContext.currentMode);
      applyGeneratedTheme(generated);
      appContext.state.background.reference_path = file.name;
    }
  } catch (err) {
    console.error("Error generando paleta:", err);
  }
  setInputsFromState();
  updatePreview();
  updateDropZone();
}

export function regenerateTheme(mode) {
  appContext.currentMode = mode || appContext.currentMode;
  const modeSelect = document.getElementById("theme-mode");
  if (modeSelect && modeSelect.value !== appContext.currentMode) {
    modeSelect.value = appContext.currentMode;
  }
  if (!appContext.currentPalette) return;
  const generated = buildThemeFromPalette(appContext.currentPalette, appContext.currentMode);
  applyGeneratedTheme(generated);
  setInputsFromState();
  updatePreview();
}

export function setBlurPreset(blur, opacity, button) {
  appContext.state.background.image_blur = blur;
  appContext.state.background.image_opacity = opacity;
  document.querySelectorAll(".blur-chip").forEach((btn) => btn.classList.remove("active"));
  if (button) {
    button.classList.add("active");
  } else {
    const match = document.querySelector(`.blur-chip[data-blur="${blur}"]`);
    if (match) match.classList.add("active");
  }
  updatePreview();
}

function handleFileChange(evt) {
  const file = evt.target.files[0];
  if (!file) {
    appContext.bgImageFile = null;
    appContext.state.background.reference_path = "";
    updatePreview();
    updateDropZone();
    return;
  }
  applyThemeFromImage(file);
}

function initEvents() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.id && fieldMap[el.id]) {
      el.addEventListener("input", handleInputChange);
    }
  });

  const bgInput = document.getElementById("bg-file");
  const browseBtn = document.getElementById("btn-browse");
  if (browseBtn && bgInput) {
    browseBtn.addEventListener("click", () => bgInput.click());
  }
  if (bgInput) {
    bgInput.addEventListener("change", handleFileChange);
  }

  document.getElementById("btn-download-zip").addEventListener("click", downloadThemeZIP);
  document.getElementById("btn-download-pr").addEventListener("click", downloadPRStructure);

  document.querySelectorAll(".blur-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const blur = parseFloat(btn.dataset.blur);
      const opacity = parseFloat(btn.dataset.opacity);
      setBlurPreset(blur, opacity, btn);
    });
  });

  const modeSelect = document.getElementById("theme-mode");
  if (modeSelect) {
    modeSelect.value = appContext.currentMode;
    modeSelect.addEventListener("change", () => {
      regenerateTheme(modeSelect.value);
    });
  }

  const drawer = document.getElementById("editor-drawer");
  const btnEdit = document.getElementById("btn-edit");
  const btnCloseEditor = document.getElementById("btn-close-editor");
  if (btnEdit && drawer) {
    btnEdit.addEventListener("click", () => drawer.classList.add("open"));
  }
  if (btnCloseEditor && drawer) {
    btnCloseEditor.addEventListener("click", () => drawer.classList.remove("open"));
  }

  const dropZone = document.getElementById("drop-zone");
  const previewPanel = document.getElementById("preview-panel");
  [dropZone, previewPanel].forEach((zone) => {
    if (!zone) return;
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (dropZone) dropZone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", () => {
      if (dropZone) dropZone.classList.remove("drag-over");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dropZone) dropZone.classList.remove("drag-over");
      const files = e.dataTransfer.files;
      if (files && files.length) {
        const file = files[0];
        if (/image\//.test(file.type)) {
          applyThemeFromImage(file);
          if (bgInput) {
            const dt = new DataTransfer();
            dt.items.add(file);
            bgInput.files = dt.files;
          }
        } else {
          alert("Solo se permiten imágenes (PNG, JPG, WEBP o GIF).");
        }
      }
    });
  });
}

export function init() {
  setInputsFromState();
  initEvents();
  setBlurPreset(appContext.state.background.image_blur, appContext.state.background.image_opacity);
  const modeSelect = document.getElementById("theme-mode");
  if (modeSelect) modeSelect.value = appContext.currentMode;
  updatePreview();
  updateDropZone();
}
