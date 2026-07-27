import { appContext } from "./state.js";
import {
  escapeString,
  formatValue,
  tomlSection,
  formatTomlKey,
  sanitizeFileName,
  sanitizeFolderName,
} from "./utils.js";

export function generateMetaTOML() {
  const m = appContext.state.meta;
  const lines = [
    `name = "${escapeString(m.name)}"`,
    m.author ? `author = "${escapeString(m.author)}"` : 'author = ""',
    m.version ? `version = "${escapeString(m.version)}"` : 'version = ""',
    m.description ? `description = "${escapeString(m.description)}"` : 'description = ""',
    `injects_css = ${m.injects_css ? "true" : "false"}`,
  ];
  return lines.join("\n") + "\n";
}

export function generateDefinitionTOML() {
  const parts = [];

  const bg = appContext.state.background;
  if (bg.reference_path || bg.image_blur !== "" || bg.image_opacity !== "") {
    parts.push(tomlSection("background", {
      reference_path: bg.reference_path || undefined,
      image_blur: bg.reference_path ? parseFloat(bg.image_blur) || 0 : undefined,
      image_opacity: bg.reference_path ? parseFloat(bg.image_opacity) ?? 0.5 : undefined,
    }));
  }

  ["colors", "text", "borders", "shadows", "layout", "others", "backdrop"].forEach((sec) => {
    const data = appContext.state[sec];
    if (Object.keys(data).length > 0) {
      parts.push(tomlSection(sec, data));
    }
  });

  {
    const bgData = { ...appContext.state.backgrounds };
    if (Object.keys(bgData).length > 0) {
      bgData["sidebar-gradient"] = bgData.sidebar;
      bgData["card-gradient"] = bgData.card;
      parts.push(tomlSection("backgrounds", bgData));
    }
  }

  appContext.state.fonts.forEach((font) => {
    parts.push("[[fonts]]");
    for (const [key, value] of Object.entries(font)) {
      if (value === "" || value === undefined || value === null) continue;
      parts.push(`${formatTomlKey(key)} = ${formatValue(value)}`);
    }
  });

  return parts.join("\n\n") + "\n";
}

export function generateThemeMD() {
  const m = appContext.state.meta;
  const lines = [
    `# ${m.name}`,
    "",
    m.description || "Tema creado con Cubic Theme Studio.",
    "",
    `**Autor:** ${m.author || "Anónimo"}`,
    `**Versión:** ${m.version || "1.0.0"}`,
  ];
  return lines.join("\n") + "\n";
}

export function generateZIP(filename, innerFolder, includeBG) {
  const zip = new JSZip();
  const folder = zip.folder(innerFolder);
  folder.file("Meta.toml", generateMetaTOML());
  folder.file("Definition.toml", generateDefinitionTOML());
  const injectCSS = generateInjectCSS();
  if (injectCSS) {
    folder.file("Inject.css", injectCSS);
  }
  if (includeBG && appContext.bgImageFile) {
    folder.file(appContext.bgImageFile.name, appContext.bgImageFile);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, filename);
  });
}

export function generateInjectCSS() {
  return appContext.state.inject.trim();
}

export function getThemeNames() {
  const author = sanitizeFileName(appContext.state.meta.author || "Autor");
  const themeName = sanitizeFileName(appContext.state.meta.name || "Tema");
  const zipName = `${author}_${themeName}.zip`;
  const innerFolder = sanitizeFolderName(appContext.state.meta.name || "tema");
  const prAuthor = sanitizeFileName(appContext.state.meta.author || "Autor");
  const prTheme = sanitizeFolderName(appContext.state.meta.name || "Tema");
  return { author, themeName, zipName, innerFolder, prAuthor, prTheme };
}

export function downloadThemeZIP() {
  if (!appContext.state.meta.name.trim()) {
    alert("El tema necesita un nombre en la sección Meta.");
    document.querySelector('[data-section="meta"]').click();
    return;
  }
  const { zipName, innerFolder } = getThemeNames();
  const includeBG = appContext.state.background.reference_path && appContext.bgImageFile;
  generateZIP(zipName, innerFolder, includeBG);
}

export async function downloadPRStructure() {
  if (!appContext.state.meta.name.trim()) {
    alert("El tema necesita un nombre en la sección Meta.");
    return;
  }
  const { zipName, innerFolder, prAuthor, prTheme } = getThemeNames();
  const zip = new JSZip();
  const base = zip.folder(`src/${prAuthor}/${prTheme}`);
  base.file("theme.md", generateThemeMD());
  const v1 = base.folder("V1");

  const themeZip = new JSZip();
  const folder = themeZip.folder(innerFolder);
  folder.file("Meta.toml", generateMetaTOML());
  folder.file("Definition.toml", generateDefinitionTOML());
  const prInjectCSS = generateInjectCSS();
  if (prInjectCSS) {
    folder.file("Inject.css", prInjectCSS);
  }
  if (appContext.state.background.reference_path && appContext.bgImageFile) {
    folder.file(appContext.bgImageFile.name, appContext.bgImageFile);
  }
  const themeBlob = await themeZip.generateAsync({ type: "blob" });
  v1.file(zipName, themeBlob);

  const prBlob = await zip.generateAsync({ type: "blob" });
  saveAs(prBlob, `${prAuthor}_${prTheme}_PR.zip`);
}
