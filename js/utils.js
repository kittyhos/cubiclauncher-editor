export function deepSet(obj, path, value) {
  if (path.length === 1) {
    obj[path[0]] = value;
    return;
  }
  const [head, ...tail] = path;
  if (!(head in obj)) obj[head] = {};
  deepSet(obj[head], tail, value);
}

export function deepGet(obj, path) {
  if (path.length === 1) return obj[path[0]];
  const [head, ...tail] = path;
  if (!obj[head]) return undefined;
  return deepGet(obj[head], tail);
}

export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

export function escapeString(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function formatValue(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  const s = String(value);
  if (s.includes("\n")) {
    return `"""\n${s}"""`;
  }
  return `"${escapeString(s)}"`;
}

export function tomlSection(name, obj) {
  const lines = [`[${name}]`];
  for (const [key, value] of Object.entries(obj)) {
    if (value === "" || value === undefined || value === null) continue;
    lines.push(`${formatTomlKey(key)} = ${formatValue(value)}`);
  }
  return lines.join("\n");
}

export function formatTomlKey(key) {
  return /^[a-zA-Z0-9_]+$/.test(key) ? key : `"${key}"`;
}

export function sanitizeFolderName(name) {
  return name.replace(/[^a-zA-Z0-9_\-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
